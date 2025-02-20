'use client';
import React, { useEffect, useState } from 'react';
import { determineLocale } from 'generaltranslation';
import { GTContext } from './GTContext';
import { ClientProviderProps } from '../types/providers';
import {
  GTTranslationError,
  TranslationError,
  TranslationsObject,
  TranslationSuccess,
} from '../types/types';
import useRuntimeTranslation from '../hooks/internal/useRuntimeTranslation';
import { localeCookieName } from 'generaltranslation/internal';
import useTranslateContent from '../hooks/internal/useTranslateContent';
import useTranslateEntryFromServer from '../hooks/internal/useTranslateEntryFromServer';

// meant to be used inside the server-side <GTProvider>
export default function ClientProvider({
  children,
  dictionary,
  initialTranslations,
  translationPromises,
  locale: _locale,
  _versionId,
  defaultLocale,
  translationRequired,
  dialectTranslationRequired,
  locales = [],
  requiredPrefix,
  renderSettings,
  projectId,
  devApiKey,
  runtimeUrl,
  runtimeTranslationEnabled,
  onLocaleChange = () => {},
  cookieName = localeCookieName,
}: ClientProviderProps): React.JSX.Element {
  // ----- TRANSLATIONS STATE ----- //

  /**
   * (a) Cache has already been checked by server at this point
   * (b) All string dictionary translations have been resolved at this point
   * (c) JSX dictionary entries are either (1) resolved (so success/error) or (2) not resolved/not yet requested.
   *     They will NOT be loading at this point.
   */
  const [translations, setTranslations] = useState<TranslationsObject | null>(
    devApiKey ? null : initialTranslations
  );

  // ----- LOCALE STATE ----- //

  // Maintain the locale state
  const [locale, _setLocale] = useState<string>(
    _locale ? determineLocale(_locale, locales) || '' : ''
  );

  // Check for an invalid cookie and correct it
  useEffect(() => {
    const cookieLocale = document.cookie
      .split('; ')
      .find((row) => row.startsWith(`${cookieName}=`))
      ?.split('=')[1];
    if (locale && cookieLocale && cookieLocale !== locale) {
      document.cookie = `${cookieName}=${locale};path=/`;
    }
  }, [locale]);

  // Set the locale via cookies and refresh the page to reload server-side. Make sure the language is supported.
  const setLocale = (newLocale: string): void => {
    // validate locale
    newLocale = determineLocale(newLocale, locales) || locale || defaultLocale;

    // persist locale
    document.cookie = `${cookieName}=${newLocale};path=/`;

    // set locale
    _setLocale(newLocale);

    // re-render server components
    onLocaleChange();

    // re-render client components
    window.location.reload();
  };

  // ----- TRANSLATION LIFECYCLE ----- //

  // Fetch additional translations and queue them for merging
  useEffect(() => {
    setTranslations((prev) => ({ ...prev, ...initialTranslations }));
    let storeResult = true;
    const resolvedTranslations: TranslationsObject = {};
    (async () => {
      // resolve all translation promises (jsx only)
      await Promise.all(
        Object.entries(translationPromises).map(async ([key, promise]) => {
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
          resolvedTranslations[key] = result;
        })
      );
      // add resolved translations to state
      if (storeResult) {
        setTranslations((prev) => ({
          ...initialTranslations,
          ...prev,
          ...resolvedTranslations,
        }));
      }
    })();

    return () => {
      // cleanup
      storeResult = false;
    };
  }, [initialTranslations, translationPromises]);

  // ---------- TRANSLATION METHODS ---------- //

  // for dictionaries (strings are actually already resolved, but JSX needs tx still)
  const translateEntry = useTranslateEntryFromServer({
    dictionary,
    translations,
    locale,
    renderSettings,
    runtimeTranslationEnabled,
    translationRequired,
    dialectTranslationRequired,
    locales,
    defaultLocale,
  });

  // Setup runtime translation
  const { registerContentForTranslation, registerJsxForTranslation } =
    useRuntimeTranslation({
      locale: locale,
      versionId: _versionId,
      projectId,
      devApiKey,
      runtimeUrl,
      setTranslations,
      defaultLocale,
      renderSettings,
      runtimeTranslationEnabled,
    });

  // Translate content function
  const translateContent = useTranslateContent(
    translations,
    locale,
    defaultLocale,
    translationRequired,
    dialectTranslationRequired,
    runtimeTranslationEnabled,
    registerContentForTranslation,
    renderSettings
  );

  return (
    <GTContext.Provider
      value={{
        registerContentForTranslation,
        registerJsxForTranslation,
        setLocale,
        translateContent,
        translateEntry,
        locale,
        locales,
        defaultLocale,
        translations,
        translationRequired,
        dialectTranslationRequired,
        renderSettings,
        runtimeTranslationEnabled,
      }}
    >
      {(!translationRequired || translations) && children}
    </GTContext.Provider>
  );
}
