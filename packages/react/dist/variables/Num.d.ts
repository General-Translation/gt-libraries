import React from 'react';
/**
 * The `<Num>` component renders a formatted number string, allowing customization of the name, default value, and formatting options.
 * It formats the number according to the current locale and optionally passed formatting options.
 * Must be used inside a `<GTProvider>`.
 *
 * @example
 * ```jsx
 * <Num
 *    options={{ style: "decimal", maximumFractionDigits: 2 }}
 * >
 *    1000
 * </Num>
 * ```
 *
 * @param {any} [children] - Optional content (typically a number) to render inside the component.
 * @param {Intl.NumberFormatOptions} [options={}] - Optional formatting options for the number, following `Intl.NumberFormatOptions` specifications.
 * @returns {JSX.Element} The formatted number component.
 */
declare function Num({ children, locales, options, }: {
    children?: any;
    locales?: string[];
    options?: Intl.NumberFormatOptions;
}): React.JSX.Element;
declare namespace Num {
    var gtTransformation: string;
}
export default Num;
//# sourceMappingURL=Num.d.ts.map