import * as React from 'react';
import { useCallback } from 'react';
import {
  DictionaryTranslationOptions,
  RenderMethod,
  TranslationsObject,
} from '../../types/types';
import { isValidDictionaryEntry } from '../../provider/helpers/getDictionaryEntry';
import getEntryAndMetadata from '../../provider/helpers/getEntryAndMetadata';
import {
  createInvalidDictionaryEntryWarning,
  createNoEntryFoundWarning,
} from '../../errors/createErrors';
import {
  renderContentToString,
  splitStringToContent,
} from 'generaltranslation';
import { hashJsxChildren } from 'generaltranslation/id';
import { Content } from 'generaltranslation/internal';
import { TranslateContentCallback } from '../../types/runtime';
import { Dictionaries } from '../../types/dictionary';

export default function useCreateInternalUseDictFunction({
  dictionaries,
  translations,
  locale,
  defaultLocale,
  translationRequired,
  dialectTranslationRequired,
  runtimeTranslationEnabled,
  registerContentForTranslation,
  renderSettings,
}: {
  dictionaries: Dictionaries | undefined;
  translations: TranslationsObject | null;
  locale: string;
  defaultLocale: string;
  translationRequired: boolean;
  dialectTranslationRequired: boolean;
  runtimeTranslationEnabled: boolean;
  registerContentForTranslation: TranslateContentCallback;
  renderSettings: { method: RenderMethod };
}) {
  return useCallback(
    (id: string, options: DictionaryTranslationOptions = {}): string => {
      // Check: dictionary exists
      if (!dictionaries) {
        return '';
      }

      // Get entry
      const value = dictionaries?.[defaultLocale]?.[id];

      // Check: no entry found
      if (!value) {
        console.warn(createNoEntryFoundWarning(id));
        return '';
      }

      // Check: invalid entry
      if (!isValidDictionaryEntry(value)) {
        console.warn(createInvalidDictionaryEntryWarning(id));
        return '';
      }

      // Get entry and metadata
      const { entry, metadata } = getEntryAndMetadata(value);

      // ----- SET UP ----- //

      // Check: reject invalid content
      if (!entry || typeof entry !== 'string') return '';

      // Parse content
      const source = splitStringToContent(entry);

      // Render method
      const renderContent = (content: Content, locales: string[]) => {
        return renderContentToString(
          content,
          locales,
          options.variables,
          options.variablesOptions
        );
      };

      // Check: translation not required
      if (!translationRequired) return renderContent(source, [defaultLocale]);

      // ----- CHECK DICTIONARY ----- //

      // Get dictionary translation
      const dictionaryTranslation = dictionaries?.[locale]?.[id];

      // Check: valid entry
      if (isValidDictionaryEntry(dictionaryTranslation)) {
        // Get entry and metadata
        const { entry } = getEntryAndMetadata(dictionaryTranslation);

        // Render translation
        return renderContent(entry, [locale, defaultLocale]);
      }

      // ----- CHECK TRANSLATIONS ----- //

      // Get hash
      let hash = hashJsxChildren({
        source,
        ...(metadata?.context && { context: metadata.context }),
        id,
        dataFormat: 'JSX',
      });

      // Check id first
      let translationEntry = translations?.[hash];

      // Check translation successful
      if (translationEntry?.state === 'success') {
        return renderContent(translationEntry.target as Content, [
          locale,
          defaultLocale,
        ]);
      }

      // Check translation errored
      if (translationEntry?.state === 'error') {
        return renderContent(source, [defaultLocale]);
      }

      // ----- TRANSLATE ON DEMAND ----- //
      // develoment only

      // Check if runtime translation is enabled
      if (!runtimeTranslationEnabled) {
        return renderContent(source, [defaultLocale]);
      }

      // Translate Content
      registerContentForTranslation({
        source,
        targetLocale: locale,
        metadata: {
          ...(metadata?.context && { context: metadata.context }),
          id,
          hash,
        },
      });

      // Loading behavior
      if (renderSettings.method === 'replace') {
        return renderContent(source, [defaultLocale]);
      } else if (renderSettings.method === 'skeleton') {
        return '';
      }
      return dialectTranslationRequired // default behavior
        ? renderContent(source, [defaultLocale])
        : '';
    },
    [
      dictionaries,
      translations,
      locale,
      defaultLocale,
      translationRequired,
      runtimeTranslationEnabled,
      registerContentForTranslation,
      dialectTranslationRequired,
    ]
  );
}
