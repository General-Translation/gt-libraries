import React from 'react';
/**
 * The `<DateTime>` component renders a formatted date or time string, allowing customization of the name, default value, and formatting options.
 * It utilizes the current locale and optional format settings to display the date.
 * Must be used inside a `<GTProvider>`.
 *
 * @example
 * ```jsx
 * <DateTime>
 *    {new Date()}
 * </DateTime>
 * ```
 *
 * @param {any} [children] - Optional content (typically a date) to render inside the component.
 * @param {string[]} [locales] - Optional locales to use for date formatting. If not provided, the library default locale (en-US) is used. If wrapped in a `<GTProvider>`, the user's locale is used.
 * @param {Intl.DateTimeFormatOptions} [options={}] - Optional formatting options for the date, following `Intl.DateTimeFormatOptions` specifications.
 * @returns {JSX.Element} The formatted date or time component.
 */
declare function DateTime({ children, locales, name, options, }: {
    children?: any;
    locales?: string[];
    name?: string;
    options?: Intl.DateTimeFormatOptions;
}): React.JSX.Element;
declare namespace DateTime {
    var gtTransformation: string;
}
export default DateTime;
//# sourceMappingURL=DateTime.d.ts.map