import { cookies, headers } from 'next/headers';
import { determineLocale, standardizeLocale } from 'generaltranslation';
import getI18NConfig from '../config-dir/getI18NConfig';

// locale header name and cookie name
let localeHeaderName = '';
let localeCookieName = '';

/**
 * Retrieves the 'accept-language' header from the headers list.
 * If the 'next/headers' module is not available, it attempts to load it. If the
 * headers function is available, it returns the primary language from the 'accept-language'
 * header.
 *
 * @returns {Promise<string>} A promise that resolves to the primary language from the
 * 'accept-language' header.
 */
export async function getNextLocale(
  defaultLocale: string = '',
  locales: string[]
): Promise<string> {
  const [headersList, cookieStore] = await Promise.all([headers(), cookies()]);

  const I18NConfig = getI18NConfig();

  let userLocale = (() => {
    let preferredLocales: string[] = [];

    // Language routed to by middleware
    const headerLocale = headersList.get(I18NConfig.getLocaleHeaderName());
    if (headerLocale) {
      preferredLocales.push(headerLocale);
    }
    const cookieLocale = cookieStore.get(I18NConfig.getLocaleCookieName());
    if (cookieLocale?.value) {
      preferredLocales.push(cookieLocale.value);
    }

    // Browser languages, in preference order
    if (process.env._GENERALTRANSLATION_IGNORE_BROWSER_LOCALES === 'false') {
      const acceptedLocales = headersList
        .get('accept-language')
        ?.split(',')
        .map((item) => item.split(';')?.[0].trim());

      if (acceptedLocales) preferredLocales.push(...acceptedLocales);
    }
    // Add defaultLocale just in case there are no matches
    preferredLocales.push(defaultLocale);

    // Standardize locale if GT services are enabled
    if (process.env._GENERALTRANSLATION_GT_SERVICES_ENABLED === 'true') {
      preferredLocales = preferredLocales.map((locale) =>
        standardizeLocale(locale)
      );
    }

    // Determine locale
    return determineLocale(preferredLocales, locales) || defaultLocale;
  })();

  return userLocale;
}
