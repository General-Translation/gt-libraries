'use client';
import React, {
  isValidElement,
  useCallback,
  useLayoutEffect,
  useState,
} from 'react';
import {
  renderContentToString,
  splitStringToContent,
} from 'generaltranslation';
import { listSupportedLocales } from '@generaltranslation/supported-locales';
import { GTContext } from './GTContext';
import {
  FlattenedTaggedDictionary,
  GTTranslationError,
  RenderMethod,
  TaggedDictionary,
  TaggedDictionaryEntry,
  TranslatedChildren,
  TranslatedContent,
  TranslationError,
  TranslationsObject,
  TranslationSuccess,
} from '../types/types';
import extractEntryMetadata from './helpers/extractEntryMetadata';
import renderDefaultChildren from './rendering/renderDefaultChildren';
import renderSkeleton from './rendering/renderSkeleton';
import renderTranslatedChildren from './rendering/renderTranslatedChildren';
import { isEmptyReactFragment } from '../utils/utils';
import renderVariable from './rendering/renderVariable';
import useRuntimeTranslation from './runtime/useRuntimeTranslation';

// meant to be used inside the server-side <GTProvider>
export default function ClientProvider({
  children,
  dictionary,
  initialTranslations,
  translationPromises,
  locale,
  defaultLocale,
  translationRequired,
  dialectTranslationRequired,
  locales = listSupportedLocales(),
  requiredPrefix,
  renderSettings,
  projectId,
  devApiKey,
  runtimeUrl,
  runtimeTranslations = false,
}: {
  children: any;
  dictionary: FlattenedTaggedDictionary;
  initialTranslations: TranslationsObject;
  translationPromises: Record<string, Promise<TranslatedChildren>>;
  locale: string;
  locales: string[];
  defaultLocale: string;
  translationRequired: boolean;
  dialectTranslationRequired: boolean;
  requiredPrefix: string | undefined;
  renderSettings: {
    method: RenderMethod;
    timeout?: number;
  };
  projectId?: string;
  devApiKey?: string;
  runtimeUrl?: string;
  runtimeTranslations?: boolean;
}): React.JSX.Element {
  /**
   * (a) Cache has already been checked by server at this point
   * (b) All string dictionary translations have been resolved at this point
   * (c) JSX dictionary entries are either (1) resolved (so success/error) or (2) not resolved/not yet requested.
   *     They will NOT be loading at this point.
   */
  const [translations, setTranslations] = useState<TranslationsObject | null>(
    null
  );

  useLayoutEffect(() => {
    setTranslations((prev) => ({ ...prev, ...initialTranslations }));

    (async () => {
      // resolve all translation promises
      const resolvedTranslations: TranslationsObject = {};
      await Promise.all(
        Object.entries(translationPromises).map(async ([id, promise]) => {
          const { metadata } = extractEntryMetadata(dictionary[id]);
          const hash = metadata?.hash;
          let result: TranslationSuccess | TranslationError;
          try {
            result = { state: 'success', target: await promise };
          } catch (error) {
            console.error(error);
            // set all promise ids to error in translations
            if (error instanceof GTTranslationError) {
              result = error.toTranslationError();
            } else {
              result = { state: 'error', error: 'An error occured', code: 500 };
            }
          }
          resolvedTranslations[id] = { [hash]: result };
        })
      );
      // add resolved translations to state
      setTranslations((prev) => ({ ...prev, ...resolvedTranslations }));
    })();
  }, [initialTranslations, translationPromises]);

  // for dictionaries (strings are actually already resolved, but JSX needs tx still)
  const translateDictionaryEntry = useCallback(
    (
      id: string,
      options: Record<string, any> = {}
    ): React.ReactNode | string | undefined => {
      // ----- SETUP ----- //

      // Get the dictionary entry
      const dictionaryEntry:
        | TaggedDictionary
        | TaggedDictionaryEntry
        | undefined = dictionary[id]; // this is a flattened dictionary
      if (
        (!dictionaryEntry && dictionaryEntry !== '') || // entry not found
        (typeof dictionaryEntry === 'object' &&
          !isValidElement(dictionaryEntry) &&
          !Array.isArray(dictionaryEntry))
      ) {
        return undefined; // dictionary entry not found
      }

      // Parse the dictionary entry
      const { entry, metadata } = extractEntryMetadata(dictionaryEntry);
      const variables = options;
      const variablesOptions = metadata?.variablesOptions;
      const hash = metadata?.hash;
      const translationEntry = translations?.[id]?.[hash];

      // ----- RENDER STRINGS ----- //

      if (typeof entry === 'string') {
        // render strings

        // Reject empty strings
        if (!entry.length) {
          console.warn(
            `gt-next warn: Empty string found in dictionary with id: ${id}`
          );
          return entry;
        }

        // no translation required
        const content = splitStringToContent(entry);
        if (!translationRequired) {
          return renderContentToString(
            content,
            locales,
            variables,
            variablesOptions
          );
        }

        // error behavior (strings shouldn't be in a loading state here)
        if (translationEntry?.state !== 'success') {
          return renderContentToString(
            content,
            locales,
            variables,
            variablesOptions
          );
        }

        // render translated content
        return renderContentToString(
          translationEntry.target as TranslatedContent,
          [locale, defaultLocale],
          variables,
          variablesOptions
        );
      }

      // ----- RENDER METHODS FOR JSX ----- //
      const taggedChildren = entry;

      // for default/fallback rendering
      const renderDefaultLocale = () => {
        return renderDefaultChildren({
          children: taggedChildren,
          variables,
          variablesOptions,
          defaultLocale,
          renderVariable,
        });
      };

      const renderLoadingDefault = () => {
        if (dialectTranslationRequired) {
          return renderDefaultLocale();
        }
        return renderSkeleton();
      };

      const renderTranslation = (target: TranslatedChildren) => {
        return renderTranslatedChildren({
          source: taggedChildren,
          target,
          variables,
          variablesOptions,
          locales: [locale, defaultLocale],
          renderVariable,
        }) as React.JSX.Element;
      };

      // ----- RENDER JSX ----- //

      // fallback to default locale if no tx required
      if (!translationRequired) {
        return <React.Fragment>{renderDefaultLocale()}</React.Fragment>;
      }

      // loading behavior
      if (!translationEntry || translationEntry?.state === 'loading') {
        let loadingFallback;
        if (renderSettings.method === 'skeleton') {
          loadingFallback = renderSkeleton();
        } else if (renderSettings.method === 'replace') {
          loadingFallback = renderDefaultLocale();
        } else {
          // default
          loadingFallback = renderLoadingDefault();
        }
        // The suspense exists here for hydration reasons
        return <React.Fragment>{loadingFallback}</React.Fragment>;
      }

      // error behavior
      if (translationEntry.state === 'error') {
        // Reject empty fragments
        if (isEmptyReactFragment(entry)) {
          console.warn(
            `gt-next warn: Empty fragment found in dictionary with id: ${id}`
          );
          return entry;
        }
        return <React.Fragment>{renderDefaultLocale()}</React.Fragment>;
      }

      // render translated content
      return (
        <React.Fragment>
          {renderTranslation(translationEntry.target)}
        </React.Fragment>
      );
    },
    [dictionary, translations]
  );

  // For <T> components
  const { translateChildren, translateContent } = useRuntimeTranslation({
    locale: locale,
    projectId,
    devApiKey,
    runtimeUrl,
    setTranslations,
    defaultLocale,
    renderSettings,
  });

  return (
    <GTContext.Provider
      value={{
        translateDictionaryEntry,
        translateChildren,
        translateContent,
        setLocale: () => {}, // Unsupported for SSR behavior
        locale,
        locales,
        defaultLocale,
        translations,
        translationRequired,
        dialectTranslationRequired,
        renderSettings,
      }}
    >
      {translations && children}
    </GTContext.Provider>
  );
}
