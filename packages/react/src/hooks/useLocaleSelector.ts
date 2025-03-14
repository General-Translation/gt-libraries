import { useMemo } from 'react';
import useLocale from '../hooks/useLocale';
import useLocales from '../hooks/useLocales';
import useSetLocale from '../hooks/useSetLocale';
import { getLocaleProperties } from 'generaltranslation';

/**
 * Gets the list of properties for using a locale selector.
 * @param locales an optional list of locales to use for the drop down. These locales must be a subset of the locales provided by the `<GTProvider>` context. When not provided, the list of locales from the `<GTProvider>` context is used.
 * @returns {object} The locale, locales, and setLocale function.
 */
export default function useLocaleSelector(locales?: string[]) {
  // Retrieve the locale, locales, and setLocale function
  const locale = useLocale();
  const contextLocales = useLocales();
  const setLocale = useSetLocale();

  // sort
  const sortedLocales = useMemo(() => {
    if (!contextLocales || contextLocales.length === 0) {
      return [];
    }
    const res = contextLocales.sort((a, b) =>
      new Intl.Collator().compare(
        getLocaleProperties(a).nativeNameWithRegionCode,
        getLocaleProperties(b).nativeNameWithRegionCode
      )
    );
    return res;
  }, [contextLocales]);

  return { locale, locales: locales ? locales : sortedLocales, setLocale };
}
