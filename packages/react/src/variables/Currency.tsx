import React, { useContext } from 'react';
import { formatCurrency } from 'generaltranslation';
import { GTContext } from '../provider/GTContext';
import { libraryDefaultLocale } from 'generaltranslation/internal';

/**
 * The `<Currency>` component renders a formatted currency string, allowing customization of name, default value, currency type, and formatting options.
 * Must be used inside a `<GTProvider>`.
 *
 * @example
 * ```jsx
 * <Currency currency="USD">
 *    1000
 * </Currency>
 * ```
 *
 * @param {any} [children] - Optional content to render inside the currency component.
 * @param {any} [value] - The default value to be used.
 * @param {string} [currency] - The currency type (e.g., USD, EUR, etc.).
 * @param {string[]} [locales] - Optional locales to use for currency formatting. If not provided, the library default locale (en-US) is used. If wrapped in a `<GTProvider>`, the user's locale is used.
 * @param {Intl.NumberFormatOptions} [options] - Optional formatting options to customize how the currency is displayed.
 * @returns {JSX.Element} The formatted currency component.
 */
function Currency({
  children,
  value,
  currency = 'USD',
  locales,
  options = {},
}: {
  children?: any;
  value?: any;
  currency?: string;
  locales?: string[];
  options?: Intl.NumberFormatOptions;
}): React.JSX.Element {
  const context = useContext(GTContext);
  if (context) {
    locales ||= [
      ...(context.locale && [context.locale]),
      context.defaultLocale,
    ];
  } else {
    locales ||= [libraryDefaultLocale];
  }

  let renderedValue =
    typeof children !== 'undefined' && typeof value === 'undefined'
      ? children
      : value;
  renderedValue =
    typeof renderedValue === 'string'
      ? parseFloat(renderedValue)
      : renderedValue;
  // Format the value using Intl.NumberFormat
  if (typeof renderedValue === 'number') {
    renderedValue = formatCurrency(renderedValue, currency, {
      locales,
      ...options,
    });
  }

  return <>{renderedValue}</>;
}

// Static property to indicate the transformation type
Currency.gtTransformation = 'variable-currency';

export default Currency;
