import { useMemo } from 'react';
import { isSameLanguage, requiresTranslation } from 'generaltranslation';
import { useCallback, useEffect, useState } from 'react';
import { GTContext } from './GTContext';
import { RenderMethod, TranslationsObject } from '../types/types';
import {
  Content,
  defaultCacheUrl,
  defaultRuntimeApiUrl,
  libraryDefaultLocale,
} from 'generaltranslation/internal';
import {
  APIKeyMissingWarn,
  createUnsupportedLocalesWarning,
  devApiKeyProductionError,
  projectIdMissingWarning,
} from '../messages/createMessages';
import { getSupportedLocale } from '@generaltranslation/supported-locales';
import useRuntimeTranslation from '../hooks/internal/useRuntimeTranslation';
import { defaultRenderSettings } from './rendering/defaultRenderSettings';
import React from 'react';
import useDetermineLocale from '../hooks/internal/useDetermineLocale';
import { readAuthFromEnv } from '../utils/utils';
import fetchTranslations from '../utils/fetchTranslations';
import useCreateInternalUseGTFunction from '../hooks/internal/useCreateInternalUseGTFunction';
import useCreateInternalUseDictFunction from '../hooks/internal/useCreateInternalUseDictFunction';

/**
 * Provides General Translation context to its children, which can then access `useGT`, `useLocale`, and `useDefaultLocale`.
 *
 * @param {React.ReactNode} children - The children components that will use the translation context.
 * @param {string} [projectId] - The project ID required for General Translation cloud services.
 * @param {Dictionary} [dictionary=defaultDictionary] - The translation dictionary for the project.
 * @param {string[]} [locales] - The list of approved locales for the project.
 * @param {string} [defaultLocale=libraryDefaultLocale] - The default locale to use if no other locale is found.
 * @param {string} [locale] - The current locale, if already set.
 * @param {string} [cacheUrl='https://cdn.gtx.dev'] - The URL of the cache service for fetching translations.
 * @param {string} [runtimeUrl='https://runtime.gtx.dev'] - The URL of the runtime service for fetching translations.
 * @param {RenderSettings} [renderSettings=defaultRenderSettings] - The settings for rendering translations.
 * @param {string} [_versionId] - The version ID for fetching translations.
 * @param {string} [devApiKey] - The API key for development environments.
 * @param {object} [metadata] - Additional metadata to pass to the context.
 *
 * @returns {JSX.Element} The provider component for General Translation context.
 */
export default function GTProvider({
  children,
  projectId: _projectId = '',
  devApiKey: _devApiKey,
  dictionary = {},
  locales = [],
  defaultLocale = libraryDefaultLocale,
  locale: _locale,
  cacheUrl = defaultCacheUrl,
  runtimeUrl = defaultRuntimeApiUrl,
  renderSettings = defaultRenderSettings,
  loadTranslation,
  _versionId,
  ...metadata
}: {
  children?: React.ReactNode;
  projectId?: string;
  devApiKey?: string;
  dictionary?: any;
  locales?: string[];
  defaultLocale?: string;
  locale?: string;
  cacheUrl?: string;
  runtimeUrl?: string;
  renderSettings?: {
    method: RenderMethod;
    timeout?: number;
  };
  loadTranslation?: (locale: string) => Promise<any>;
  _versionId?: string;
  [key: string]: any;
}): React.JSX.Element {
  // ---------- SANITIZATION ---------- //

  // Read env
  const { projectId, devApiKey } = readAuthFromEnv(_projectId, _devApiKey);

  // Locale standardization
  locales = useMemo(() => {
    locales.unshift(defaultLocale);
    return Array.from(new Set(locales));
  }, [defaultLocale, locales]);

  // Get locale
  const [locale, setLocale] = useDetermineLocale({
    defaultLocale,
    locales,
    locale: _locale,
  });

  // Translation at runtime during development is enabled
  const runtimeTranslationEnabled = !!(
    projectId &&
    runtimeUrl &&
    devApiKey &&
    process.env.NODE_ENV === 'development'
  );

  // LoadTranslation type, only custom and default for now
  const loadTranslationType: 'default' | 'custom' | 'disabled' =
    (loadTranslation && 'custom') || (cacheUrl && 'default') || 'disabled';

  // ---------- MEMOIZED CHECKS ---------- //

  useMemo(() => {
    // Check: no devApiKey in production
    if (process.env.NODE_ENV === 'production' && devApiKey) {
      // prod + dev key
      throw new Error(devApiKeyProductionError);
    }

    // Check: projectId missing while using cache/runtime in dev
    if (
      loadTranslationType !== 'custom' &&
      (cacheUrl || runtimeUrl) &&
      !projectId &&
      process.env.NODE_ENV === 'development'
    ) {
      console.warn(projectIdMissingWarning);
    }

    // Check: An API key is required for runtime translation
    if (
      projectId && // must have projectId for this check to matter anyways
      runtimeUrl &&
      loadTranslationType !== 'custom' && // this usually conincides with not using runtime tx
      !devApiKey &&
      process.env.NODE_ENV === 'development'
    ) {
      console.warn(APIKeyMissingWarn);
    }

    // Check: if using GT infrastructure, warn about unsupported locales
    if (
      runtimeUrl === defaultRuntimeApiUrl ||
      (cacheUrl === defaultCacheUrl && loadTranslationType === 'default')
    ) {
      const warningLocales = (locales || locales).filter(
        (locale) => !getSupportedLocale(locale)
      );
      if (warningLocales.length) {
        console.warn(createUnsupportedLocalesWarning(warningLocales));
      }
    }
  }, [
    process.env.NODE_ENV,
    devApiKey,
    loadTranslationType,
    cacheUrl,
    runtimeUrl,
    projectId,
    locales,
  ]);

  // ---------- FLAGS ---------- //

  const [translationRequired, dialectTranslationRequired] = useMemo(() => {
    // User locale is not default locale or equivalent
    const translationRequired = requiresTranslation(
      defaultLocale,
      locale,
      locales
    );

    // User locale is not default locale but is a dialect of the same language
    const dialectTranslationRequired =
      translationRequired && isSameLanguage(defaultLocale, locale);

    return [translationRequired, dialectTranslationRequired];
  }, [defaultLocale, locale, locales]);

  // ---------- TRANSLATION STATE ---------- //

  /** Key for translation tracking:
   * Cache Loading            -> translations = null
   * Cache Fail (for locale)  -> translations = {}
   * Cache Fail (for hash)    -> translations[hash] = undefined
   *
   * API Loading              -> translations[hash] = TranslationLoading
   * API Fail (for batch)     -> translations[hash] = TranslationError
   * API Fail (for hash)      -> translations[hash] = TranslationError
   *
   * Success (Cache/API)      -> translations[hash] = TranslationSuccess
   *
   * Possible scenarios:
   * Cache Loading -> Success
   * Cache Loading -> Cache Fail -> API Loading -> Success
   * Cache Loading -> Cache Fail -> API Loading -> API Fail
   */

  const [translations, setTranslations] = useState<TranslationsObject | null>(
    translationRequired ? null : {}
  );

  // Reset translations if locale changes (null to trigger a new cache fetch)
  useEffect(() => setTranslations(translationRequired ? null : {}), [locale]);

  // Setup runtime translation
  const { registerContentForTranslation, registerJsxForTranslation } =
    useRuntimeTranslation({
      locale,
      versionId: _versionId,
      projectId,
      runtimeTranslationEnabled,
      defaultLocale,
      devApiKey,
      runtimeUrl,
      renderSettings,
      setTranslations,
      ...metadata,
    });

  // ---------- ATTEMPT TO LOAD TRANSLATIONS ---------- //

  useEffect(() => {
    // Early return if no need to translate
    if (translations || !translationRequired) return;

    // Fetch translations
    let storeResults = true;
    (async () => {
      try {
        let result;
        switch (loadTranslationType) {
          case 'custom':
            // check is redundant, but makes ts happy
            if (loadTranslation) result = await loadTranslation(locale);
            break;
          case 'default':
            result = await fetchTranslations({
              cacheUrl,
              projectId,
              locale,
              versionId: _versionId,
            });
            break;
          default:
            result = {};
        }

        const parsedResult = Object.entries(result).reduce(
          (
            translationsAcc: Record<string, any>,
            [hash, target]: [string, any]
          ) => {
            translationsAcc[hash] = { state: 'success', target };
            return translationsAcc;
          },
          {}
        );
        if (storeResults) {
          setTranslations(parsedResult); // store results
        }
      } catch (error) {
        console.error(error);
        if (storeResults) {
          setTranslations({}); // not classified as a translation error, because we can still fetch from API
        }
      }
    })();

    return () => {
      // cancel fetch if a dep changes
      storeResults = false;
    };
  }, [
    translations,
    translationRequired,
    loadTranslationType,
    cacheUrl,
    projectId,
    locale,
    _versionId,
  ]);

  // ---------- USE GT ---------- //

  const _internalUseGTFunction = useCreateInternalUseGTFunction(
    translations,
    locale,
    defaultLocale,
    translationRequired,
    dialectTranslationRequired,
    runtimeTranslationEnabled,
    registerContentForTranslation,
    renderSettings
  );

  // ---------- USE DICT ---------- //

  const _internalUseDictFunction = useCreateInternalUseDictFunction({
    dictionary,
    _internalUseGTFunction,
  });

  // ----- RETURN ----- //

  const display = !!((!translationRequired || translations) && locale);

  // hang until cache response, then render translations or loading state (when waiting on API response)
  return (
    <GTContext.Provider
      value={{
        registerContentForTranslation,
        registerJsxForTranslation,
        _internalUseGTFunction,
        _internalUseDictFunction,
        runtimeTranslationEnabled,
        locale,
        locales,
        setLocale,
        defaultLocale,
        translations,
        translationRequired,
        dialectTranslationRequired,
        projectId,
        renderSettings,
      }}
    >
      {display && children}
    </GTContext.Provider>
  );
}
