import React from 'react';
import {
  flattenDictionary,
  extractEntryMetadata,
} from 'gt-react/internal';
import { ReactNode } from 'react';
import getI18NConfig from '../config/getI18NConfig';
import getLocale from '../request/getLocale';
import getMetadata from '../request/getMetadata';
import { splitStringToContent } from 'generaltranslation';
import getDictionary, { getDictionaryEntry } from '../dictionary/getDictionary';
import ClientProvider from './ClientProvider';
import { Dictionary } from 'gt-react/internal';
import { createDictionarySubsetError } from '../errors/createErrors';
import { Translations, GTTranslationError, } from '../types/types';
import { requiresRegionalTranslation, requiresTranslation, isSameLanguage, isSameDialect } from 'generaltranslation';


/**
 * Provides General Translation context to its children, which can then access `useGT`, `useLocale`, and `useDefaultLocale`.
 *
 * @param {React.ReactNode} children - The children components that will use the translation context.
 * @param {string} id - ID of a nested dictionary, so that only a subset of a large dictionary needs to be sent to the client.
 *
 * @returns {JSX.Element} The provider component for General Translation context.
 */
export default async function GTProvider({
  children,
  id,
}: {
  children?: ReactNode;
  id?: string;
}) {
  
  const getId = (suffix: string) => {
    return id ? `${id}.${suffix}` : suffix;
  };

  const I18NConfig = getI18NConfig();
  const locale = await getLocale();
  const additionalMetadata = await getMetadata();
  const defaultLocale = I18NConfig.getDefaultLocale();
  const renderSettings = I18NConfig.getRenderSettings();
  const regionalTranslationRequired = I18NConfig.requiresRegionalTranslation(locale);
  const translationRequired = I18NConfig.requiresTranslation(locale) || regionalTranslationRequired;
  
  let translationsPromise;
  if (translationRequired) translationsPromise = I18NConfig.getTranslations(locale);
  
  // Flatten dictionaries for processing while waiting for translations
  const dictionarySubset = (id ? getDictionaryEntry(id) : getDictionary()) || {};
  if (typeof dictionarySubset !== 'object' || Array.isArray(dictionarySubset))
    throw new Error(createDictionarySubsetError(id ?? '', "<GTProvider>"));
  const dictionaryEntries = flattenDictionary(dictionarySubset);

  let dictionary: Dictionary = {};
  let translations: Translations = {};
  
  // i.e. if a translation is required
  let existingTranslations = (translationsPromise) ? await translationsPromise : {};
  
  // Check and standardize flattened dictionary entries before passing them to the client
  await Promise.all(
    Object.entries(dictionaryEntries ?? {}).map(async ([suffix, dictionaryEntry]) => {

      // ---- POPULATING THE DICTIONARY ---- //

      // Get the entry from the dictionary
      const entryId = getId(suffix);
      let { entry, metadata } = extractEntryMetadata(dictionaryEntry);
      if (typeof entry === 'undefined') return; 

      // Tag the result of entry
      const taggedEntry = I18NConfig.addGTIdentifier(entry, entryId);

      // If no translation is required, return
      if (!translationRequired) return dictionary[entryId] = [taggedEntry, { ...metadata }];

      // ---- POPULATING TRANSLATIONS ---- //

      // STRINGS

      if (typeof taggedEntry === 'string') {

        // Hash and add to dictionary
        const contentArray = splitStringToContent(taggedEntry);
        const [_, hash] = I18NConfig.serializeAndHash(
          contentArray,
          metadata?.context,
          entryId
        );
        dictionary[entryId] = [taggedEntry, { ...metadata, hash }]

        // If a translation already exists, add it to the translations
        const translation = existingTranslations?.[entryId];
        if (translation?.[hash])
          return (translations[entryId] = { [hash]: translation[hash] });

        // New translation required
        const translationPromise = I18NConfig.translateContent({
          source: contentArray,
          targetLocale: locale,
          options: {
            id: entryId,
            hash,
            ...additionalMetadata,
            ...(metadata?.context && { context: metadata.context }),
          },
        });
        
        return translations[entryId] = {
          promise: translationPromise,
          hash,
          type: 'content'
        };
      }

      // JSX

      // Hash and add to dictionary
      const [entryAsObjects, hash] = I18NConfig.serializeAndHash(
        taggedEntry,
        metadata?.context,
        entryId
      );
      dictionary[entryId] = [taggedEntry, { ...metadata, hash }]

      // If a translation already exists, add it to the translations
      const translation = existingTranslations?.[entryId];
      if (translation?.[hash])
        return (translations[entryId] = { [hash]: translation[hash] });

      // New translation required
      const translationPromise = I18NConfig.translateChildren({
        source: entryAsObjects,
        targetLocale: locale,
        metadata: {
          id: entryId, hash,
          ...(metadata?.context && { context: metadata.context }),
          ...additionalMetadata,
          ...(renderSettings.timeout && { timeout: renderSettings.timeout }),
        },
      });

      return (translations[entryId] = {
        promise: translationPromise,
        hash,
        type: 'jsx',
      });
    })
  );

  return (
    <ClientProvider
      dictionary={dictionary}
      initialTranslations={{ ...existingTranslations, ...translations }}
      locale={locale}
      defaultLocale={defaultLocale}
      translationRequired={translationRequired}
      regionalTranslationRequired={regionalTranslationRequired}
      requiredPrefix={id}
      renderSettings={I18NConfig.getRenderSettings()}
      {...I18NConfig.getClientSideConfig()}
    >
      {children}
    </ClientProvider>
  );
}
