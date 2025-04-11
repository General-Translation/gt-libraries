import { Dictionaries, FlattenedDictionary } from 'gt-react/internal';
import { ReactNode } from 'react';
import getI18NConfig from '../config-dir/getI18NConfig';
import getLocale from '../request/getLocale';
import { TranslationsObject } from 'gt-react/internal';
import ClientProvider from './ClientProviderWrapper';
import { standardizeLocale } from 'generaltranslation';

/**
 * Provides General Translation context to its children, which can then access `useGT`, `useLocale`, and `useDefaultLocale`.
 *
 * @param {React.ReactNode} children - The children components that will use the translation context.
 * @param {string} id - ID of a nested dictionary, so that only a subset of a large dictionary needs to be sent to the client.
 * @param {string} locale - The locale to use for the translation context.
 *
 * @returns {JSX.Element} The provider component for General Translation context.
 */
export default async function GTProvider({
  children,
  id: prefixId,
  locale: _locale,
}: {
  children?: ReactNode;
  id?: string;
  locale?: string;
}) {
  // ---------- SETUP ---------- //
  const I18NConfig = getI18NConfig();

  const locale =
    (_locale && process.env._GENERALTRANSLATION_GT_SERVICES_ENABLED === 'true'
      ? standardizeLocale(_locale)
      : _locale) || (await getLocale());
  const defaultLocale = I18NConfig.getDefaultLocale();
  const [translationRequired, dialectTranslationRequired] =
    I18NConfig.requiresTranslation(locale);

  // ----- FETCH TRANSLATIONS ----- //

  // Get cached translations
  const cachedTranslationsPromise: Promise<TranslationsObject> =
    translationRequired
      ? I18NConfig.getCachedTranslations(locale)
      : ({} as any);

  // Get default dictionary
  const dictionariesPromise: Promise<FlattenedDictionary> =
    I18NConfig.getDictionary(locale, prefixId);

  // Get translation dictionary
  const translationDictionaryPromise: Promise<FlattenedDictionary> =
    I18NConfig.getDictionary(locale, prefixId);

  // Block until cache check resolves and dictionaries resolve
  const [translations, defaultDictionary, translationsDictionary] =
    await Promise.all([
      cachedTranslationsPromise,
      dictionariesPromise,
      translationDictionaryPromise,
    ]);

  // Merge dictionaries
  const dictionaries = {
    [locale]: translationsDictionary,
    [defaultLocale]: defaultDictionary,
  };

  return (
    <ClientProvider
      dictionaries={dictionaries}
      initialTranslations={translations}
      locale={locale}
      locales={I18NConfig.getLocales()}
      defaultLocale={defaultLocale}
      translationRequired={translationRequired}
      dialectTranslationRequired={dialectTranslationRequired}
      gtServicesEnabled={
        process.env._GENERALTRANSLATION_GT_SERVICES_ENABLED === 'true'
      }
      {...I18NConfig.getClientSideConfig()}
    >
      {children}
    </ClientProvider>
  );
}
