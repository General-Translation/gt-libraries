import { FlattenedDictionary } from 'gt-react/internal';
/**
 * Manages Dictionary
 */
export declare class DictionaryManager {
    private dictionaries;
    private defaultLocale;
    /**
     * Creates an instance of DictionaryManager.
     * @constructor
     */
    constructor();
    /**
     * Set the config for the DictionaryManager.
     * @param {Object} config - The config object.
     * @param {string} config.defaultLocale - The default locale.
     */
    setConfig({ defaultLocale }: {
        defaultLocale: string;
    }): void;
    /**
     * Retrieves dictionary for a given locale from bundle.
     *
     * Will also cache the dictionary in the internal cache.
     * @param {string} locale - The locale code.
     * @returns {Promise<FlattenedDictionary>} The dictionary data or empty object if not found.
     */
    getDictionary(locale?: string, prefixId?: string): Promise<FlattenedDictionary>;
    /**
     * Retrieves default dictionary
     * @returns {Promise<Dictionary | undefined>} The default dictionary data.
     */
    private _loadDefaultDictionary;
    /**
     * Load dictionary for a given locale
     * @param {string} locale - The locale code.
     * @returns {Promise<Dictionary | undefined>} The dictionary data or undefined if not found.
     */
    private _loadDictionary;
    /**
     * Get a subset of a dictionary.
     * Prefix must map to type Dictionary, not DictionaryEntry.
     * @param {FlattenedDictionary} dictionary - The dictionary to subset.
     * @param {string} prefixId - The prefix id of a parent dictionary entry.
     * @returns {FlattenedDictionary} The subset of the original dictionary.
     */
    private _getDictionarySubset;
}
export declare const dictionaryManager: DictionaryManager;
export default dictionaryManager;
//# sourceMappingURL=DictionaryManager.d.ts.map