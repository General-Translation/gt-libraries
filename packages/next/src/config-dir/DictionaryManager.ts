import { getLocaleProperties } from 'generaltranslation';
import {
  Dictionaries,
  flattenDictionary,
  FlattenedDictionary,
  Dictionary,
} from 'gt-react/internal';
import resolveDictionaryLoader from '../loaders/resolveDictionaryDictionary';
import {
  createDictionarySubsetError,
  defaultDictionaryUnavailableWarning,
  dictionaryUnavailableWarning,
} from '../errors/createErrors';
import { libraryDefaultLocale } from 'generaltranslation/internal';
import getDictionary from '../dictionary/getDictionary';
// TODO: importing dictionary.js does not do live updates like hot reload
/**
 * Manages Dictionary
 */
export class DictionaryManager {
  private dictionaries: Dictionaries = {};
  private defaultLocale: string = libraryDefaultLocale;

  /**
   * Creates an instance of DictionaryManager.
   * @constructor
   */
  constructor() {}

  // ---------- CONFIGURATION ---------- //

  /**
   * Set the config for the DictionaryManager.
   * @param {Object} config - The config object.
   * @param {string} config.defaultLocale - The default locale.
   */
  public setConfig({ defaultLocale }: { defaultLocale: string }) {
    this.defaultLocale = defaultLocale;
  }

  // ---------- DICTIONARY MANAGEMENT ---------- //

  /**
   * Retrieves dictionary for a given locale from bundle.
   *
   * Will also cache the dictionary in the internal cache.
   * @param {string} locale - The locale code.
   * @returns {Promise<FlattenedDictionary>} The dictionary data or empty object if not found.
   */
  public async getDictionary(
    locale: string = this.defaultLocale,
    prefixId?: string
  ): Promise<FlattenedDictionary> {
    if (locale === this.defaultLocale) {
      const defaultDictionary = await this._loadDefaultDictionary();
      if (!defaultDictionary) {
        console.warn(defaultDictionaryUnavailableWarning);
        return {};
      }
      return flattenDictionary(defaultDictionary);
    }

    // Check internal cache TODO: hot reload for dictionaries dev
    let flattenedDictionary: FlattenedDictionary | undefined =
      this.dictionaries?.[locale];
    if (flattenedDictionary && process.env.NODE_ENV !== 'development') {
      return flattenedDictionary;
    }

    console.log('[getDictionary] loading', locale);

    // Load raw dictionary
    let rawDictionary: Dictionary | undefined;
    if (locale === this.defaultLocale) {
      rawDictionary = await this._loadDefaultDictionary();
      if (!rawDictionary) {
        console.warn(defaultDictionaryUnavailableWarning);
      }
    } else {
      rawDictionary = await this._loadDictionary(locale);
      if (!rawDictionary) {
        console.warn(dictionaryUnavailableWarning(locale));
      }
    }

    if (locale === 'en') {
      console.log(rawDictionary?.key1);
    }

    // No result found
    if (!rawDictionary) {
      this.dictionaries[locale] = {};
      return {};
    }

    // Flatten result
    try {
      flattenedDictionary = flattenDictionary(rawDictionary);
    } catch (error) {
      console.warn(error);
      flattenedDictionary = {};
    }

    // Cache result
    this.dictionaries[locale] = flattenedDictionary;

    // Return entire dictionary
    if (!prefixId) {
      return flattenedDictionary;
    }

    // Process prefix if provided
    let subsetDictionary: FlattenedDictionary = {};
    try {
      subsetDictionary = this._getDictionarySubset(
        flattenedDictionary,
        prefixId
      );
    } catch (error) {
      console.warn(error);
    }

    return subsetDictionary;
  }

  // ---------- DICTIONARY LOADING HELPERS ---------- //

  /**
   * Retrieves default dictionary
   * @returns {Promise<Dictionary | undefined>} The default dictionary data.
   */
  private async _loadDefaultDictionary(): Promise<Dictionary | undefined> {
    // // Get dictionary file type
    // // TODO: move this into I18NConfigurations
    // const dictionaryFileType =
    //   process.env._GENERALTRANSLATION_DICTIONARY_FILE_TYPE;

    // // First, check for a dictionary file (takes precedence)
    // let dictionary: Dictionary | undefined;
    // try {
    //   if (dictionaryFileType === '.json') {
    //     dictionary = require('gt-next/_dictionary');
    //   } else if (dictionaryFileType === '.ts' || dictionaryFileType === '.js') {
    //     dictionary = require('gt-next/_dictionary').default;
    //   }
    // } catch {}

    // // Second, try using a custom dictionary loader
    // if (!dictionary && this.defaultLocale) {
    //   dictionary = await this._loadDictionary(this.defaultLocale);
    // }

    // return dictionary;
    return getDictionary();
  }

  /**
   * Load dictionary for a given locale
   * @param {string} locale - The locale code.
   * @returns {Promise<Dictionary | undefined>} The dictionary data or undefined if not found.
   */
  private async _loadDictionary(
    locale: string
  ): Promise<Dictionary | undefined> {
    let result: Dictionary | undefined;

    // Get custom dictionary loader
    const customLoadDictionary = resolveDictionaryLoader();
    if (!customLoadDictionary) return undefined;

    // Try loading locale
    try {
      result = await customLoadDictionary(locale);
      if (result) return result;
    } catch {}

    // Retry with simplified locale name if applicable (e.g. 'en' instead of 'en-US')
    const languageCode = getLocaleProperties(locale)?.languageCode;
    if (!languageCode || languageCode === locale) return result;
    try {
      result = await customLoadDictionary(languageCode);
    } catch {}

    return result;
  }

  // ---------- DICTIONARY MANIPULATION HELPERS ---------- //

  /**
   * Get a subset of a dictionary.
   * Prefix must map to type Dictionary, not DictionaryEntry.
   * @param {FlattenedDictionary} dictionary - The dictionary to subset.
   * @param {string} prefixId - The prefix id of a parent dictionary entry.
   * @returns {FlattenedDictionary} The subset of the original dictionary.
   */
  private _getDictionarySubset(
    dictionary: FlattenedDictionary,
    prefixId: string
  ): FlattenedDictionary {
    // Check if this is a dictionary entry
    if (dictionary[prefixId]) {
      throw new Error(createDictionarySubsetError(prefixId));
    }

    // Filter by prefix
    const subset = Object.fromEntries(
      Object.entries(dictionary).filter(([key]) => key.startsWith(prefixId))
    );

    return subset;
  }
}

export const dictionaryManager = new DictionaryManager();
export default dictionaryManager;
