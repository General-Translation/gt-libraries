import React, { useContext } from 'react';
import { formatNum } from 'generaltranslation';
import { GTContext } from '../provider/GTContext';
import { libraryDefaultLocale } from 'generaltranslation/internal';

/**
 * The `<Num>` component renders a formatted number string, allowing customization of the name, default value, and formatting options.
 * It formats the number according to the current locale and optionally passed formatting options.
 * Must be used inside a `<GTProvider>`.
 *
 * @example
 * ```jsx
 * <Num
 *    name="quantity"
 *    options={{ style: "decimal", maximumFractionDigits: 2 }}
 * >
 *    1000
 * </Num>
 * ```
 *
 * @param {any} [children] - Optional content (typically a number) to render inside the component.
 * @param {string|number} [value] - The default value for the number. Can be a string or number. Strings will be parsed to numbers.
 * @param {Intl.NumberFormatOptions} [options={}] - Optional formatting options for the number, following `Intl.NumberFormatOptions` specifications.
 * @returns {JSX.Element} The formatted number component.
 */
function Num({
  children,
  value,
  locales,
  options = {},
}: {
  children?: any;
  value?: any; // Optional default value for the number
  locales?: string[];
  options?: Intl.NumberFormatOptions; // Optional options for the number formatting
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

  let renderedValue = typeof children !== 'undefined' ? children : value;
  renderedValue =
    typeof renderedValue === 'string'
      ? parseFloat(renderedValue)
      : renderedValue;
  let formattedValue = renderedValue;
  if (typeof renderedValue === 'number') {
    // Using Intl.NumberFormat for consistent number formatting
    formattedValue = formatNum(renderedValue, { locales, ...options });
  }
  return <>{formattedValue}</>;
}

Num.gtTransformation = 'variable-number';

export default Num;
