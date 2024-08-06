/**
 * Ensures correct capitalization and formatting of a language code.
 * @param {string} code - The language-country-script code to standardize.
 * @returns {string} A BCP 47 language tag.
*/
declare function _standardizeLanguageCode(code: string): string;
/**
 * Check if a given language-country-script code is valid.
 * @param {string} code - The language-country-script code to validate.
 * @returns {boolean} - Returns true if valid, false otherwise.
 */
declare function _isValidLanguageCode(code: string): boolean;
type LanguageObject = {
    language: string;
    script?: string;
    region?: string;
};
/**
 * Returns a language object from an array of codes or a single code.
 * Returns null if there's no matching language.
 * @param {string|string[]} codes - The code or array of codes.
 * @returns {(LanguageObject|null) | (LanguageObject|null)[]} The language object(s).
 */
declare function _getLanguageObject(codes: string): LanguageObject | null;
declare function _getLanguageObject(codes: string[]): (LanguageObject | null)[];
/**
 * Returns the language name(s) from an array of codes or a single code.
 * @param {string|string[]} codes - The code or array of codes.
 * @returns {string|string[]} The language name(s).
 */
declare const _getLanguageName: (codes: string | string[]) => string | string[];
/**
 * Returns the language code(s) from an array of language names or a single name.
 * @param {string|string[]} languages - The language name or array of language names.
 * @returns {string|string[]} The language code(s).
 */
declare const _getLanguageCode: (languages: string | string[]) => string | string[];
/**
 * Determines if all provided language codes represent the same language.
 * Can take either an array of codes or a plain set of parameters.
 * @param codes - The language codes, either as separate arguments or as an array.
 * @returns {boolean} True if all codes represent the same language, false otherwise.
 */
declare function _isSameLanguage(...codes: string[]): boolean;
declare function _isSameLanguage(codes: string[]): boolean;
export { _isValidLanguageCode, _standardizeLanguageCode, _getLanguageObject, _getLanguageName, _getLanguageCode, _isSameLanguage };
