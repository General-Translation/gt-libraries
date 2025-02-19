import {
  getEntryAndMetadata,
  flattenDictionary,
  DictionaryEntry,
  Dictionary,
  TranslatedContent,
  TranslationOptions,
} from 'gt-react/internal';
import T from './T';
import getDictionary, {
  getDictionaryEntry,
} from '../../dictionary/getDictionary';
import getLocale from '../../request/getLocale';
import getI18NConfig from '../../config-dir/getI18NConfig';
import {
  renderContentToString,
  splitStringToContent,
} from 'generaltranslation';
import {
  createDictionarySubsetError,
  createNoEntryWarning,
  createDictionaryStringTranslationError,
  dictionaryDisabledError,
} from '../../errors/createErrors';
import React, { isValidElement } from 'react';
import { hashJsxChildren } from 'generaltranslation/id';

/**
 * Returns the dictionary access function `d()`, which is used to translate an item from the dictionary.
 *
 * @param {string} [id] - Optional prefix to prepend to the translation keys.
 * @returns {Function} A translation function that accepts a key string and returns the translated value.
 *
 * @example
 * const d = await getDict('user');
 * console.log(d('name')); // Translates item 'user.name'
 *
 * const d = await getDict();
 * console.log(d('hello')); // Translates item 'hello'
 */
export default async function getDict(id?: string): Promise<
  (
    id: string,
    options?: {
      locale?: string;
    } & TranslationOptions
  ) => React.ReactNode
> {
  const getId = (suffix: string) => {
    return id ? `${id}.${suffix}` : suffix;
  };

  // ---------- SET UP ---------- //

  const I18NConfig = getI18NConfig();
  if (!I18NConfig.isDictionaryEnabled()) {
    if (process.env.NODE_ENV === 'production') {
      console.error(dictionaryDisabledError);
      return () => undefined;
    } else {
      throw new Error(dictionaryDisabledError);
    }
  }
  const defaultLocale = I18NConfig.getDefaultLocale();
  const locale = await getLocale();
  const translationRequired = I18NConfig.requiresTranslation(locale);
  const serverRuntimeTranslationEnabled =
    I18NConfig.isServerRuntimeTranslationEnabled() &&
    process.env.NODE_ENV === 'development'; // need proper credentials
  let stringTranslationsById: Record<string, TranslatedContent> = {};

  // ---------- GET TRANSLATIONS ---------- //

  if (translationRequired) {
    // ----- FETCH CACHE ----- //

    // Send a request to cache for translations
    let translationsPromise = I18NConfig.getCachedTranslations(locale);

    // Flatten dictionaries for processing while waiting for translations
    const dictionarySubset =
      (id ? getDictionaryEntry(id) : getDictionary()) || {};
    if (typeof dictionarySubset !== 'object' || Array.isArray(dictionarySubset))
      // check that it is a Dictionary, not a Dictionary Entry
      throw new Error(createDictionarySubsetError(id ?? '', 'getDict'));
    const flattenedDictionaryEntries = flattenDictionary(
      dictionarySubset as Dictionary
    );

    // Block until cache check resolves
    const translations = await translationsPromise;

    // ----- RESOLVE TRANSLATIONS ----- //

    // Translate all strings in sub dictionary (block until completed)
    await Promise.all(
      Object.entries(flattenedDictionaryEntries ?? {}).map(
        async ([suffix, dictionaryEntry]) => {
          // ----- EXTRACT IDENTIFIERS ----- //

          // Get the entry from the dictionary
          let { entry, metadata } = getEntryAndMetadata(dictionaryEntry);

          // only tx strings
          if (typeof entry !== 'string') return;

          // Get identifier
          const entryId = getId(suffix);

          // Skip empty strings
          if (!entry.length) {
            console.warn(
              `gt-next warn: Empty string found in dictionary with id: ${entryId}`
            );
            return;
          }

          // Serialize and hash
          const source = splitStringToContent(entry);
          const hash = hashJsxChildren({
            source,
            ...(metadata?.context && { context: metadata?.context }),
            id: entryId,
          });

          // ----- CHECK CACHED TRANSLATIONS ----- //

          // If a translation already exists int our cache from earlier, add it to the translations
          const translationEntry = translations[hash];
          if (translationEntry) {
            // success
            if (translationEntry.state === 'success') {
              return (stringTranslationsById[entryId] =
                translationEntry.target as TranslatedContent);
            }
            // error fallback (strings in local cache will only be success or error)
            return;
          }

          // ----- ON DEMAND TRANSLATE STRING ----- //
          // dev only (with api key)

          // Skip if dev runtime translation is disabled
          if (!serverRuntimeTranslationEnabled) return;

          // Send a request to cache for translations
          const translationPromise = I18NConfig.translateContent({
            source,
            targetLocale: locale,
            options: { id: entryId, hash },
          });

          // for server-side rendering, all strings are blocking
          try {
            stringTranslationsById[entryId] = await translationPromise;
          } catch (error) {
            console.error(
              createDictionaryStringTranslationError(entryId),
              error
            );
            return;
          }
        }
      )
    );
  }

  // ---------- THE d() METHOD ---------- //

  /**
   *
   * @param {string} id The identifier of the dictionary entry to translate.
   * @param { TranslationOptions & { locale?: string; }} options For translating strings, the locale to translate to.
   * @returns The translated version of the dictionary entry.
   *
   * @example
   * d('greetings.greeting1'); // Translates item in dictionary under greetings.greeting1
   *
   * @example
   * d('greetings.greeting1', { locale: 'fr' }); // Translates item in dictionary under greetings.greeting1 to French
   *
   * @example
   * // dictionary entry
   * {
   *  greetings: {
   *    greeting2: "Hello, {name}!"
   *  }
   * }
   *
   * // Translates item in dictionary under greetings.greeting2 and replaces {name} with 'John'
   * d('greetings.greeting2', { variables: { name: 'John' } });
   */
  const d = (
    id: string,
    options: {
      locale?: string;
    } & TranslationOptions = {}
  ): React.ReactNode => {
    // ----- SET UP ----- //

    // Get entry
    id = getId(id);
    const dictionaryEntry = getDictionaryEntry(id);
    if (
      dictionaryEntry === undefined ||
      dictionaryEntry === null || // no entry found
      (typeof dictionaryEntry === 'object' &&
        !isValidElement(dictionaryEntry) &&
        !Array.isArray(dictionaryEntry)) // make sure is DictionaryEntry, not Dictionary
    ) {
      console.warn(createNoEntryWarning(id));
      return undefined;
    }
    let { entry, metadata } = getEntryAndMetadata(
      dictionaryEntry as DictionaryEntry
    );

    // Get variables and variable options
    let variables = options;
    let variablesOptions = metadata?.variablesOptions;

    // ----- STRINGS ----- //

    // Render strings
    if (typeof entry === 'string') {
      const source = stringTranslationsById[id] || splitStringToContent(entry);
      return renderContentToString(
        source,
        [locale, defaultLocale],
        variables,
        variablesOptions
      );
    }

    // ----- JSX ----- //

    // Translate on demand
    return (
      <T
        id={id}
        variables={variables}
        variablesOptions={variablesOptions}
        {...metadata}
      >
        {entry}
      </T>
    );
  };

  return d;
}
