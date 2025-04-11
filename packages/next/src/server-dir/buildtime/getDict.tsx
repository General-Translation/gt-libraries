import {
  DictionaryTranslationOptions,
  FlattenedDictionary,
  getDictionaryEntry,
  getEntryAndMetadata,
  isValidDictionaryEntry,
  TranslationsObject,
} from 'gt-react/internal';

import {
  createDictionaryTranslationError,
  createInvalidDictionaryEntryWarning,
  createNoEntryFoundWarning,
  translationLoadingWarning,
} from '../../errors/createErrors';
import getI18NConfig from '../../config-dir/getI18NConfig';
import getLocale from '../../request/getLocale';
import {
  renderContentToString,
  splitStringToContent,
} from 'generaltranslation';
import { hashJsxChildren } from 'generaltranslation/id';
import { Content } from 'generaltranslation/internal';

/**
 * Returns the dictionary access function `d()`, which is used to translate an item from the dictionary.
 *
 * @param {string} [id] - Optional prefix to prepend to the translation keys.
 * @returns {Function} A translation function that accepts a key string and returns the translated value.
 *
 * @example
 * const d = await getDict('user');
 * console.log(d('name')); // Translates item 'user.name'
 *
 * const d = await getDict();
 * console.log(d('hello')); // Translates item 'hello'
 */
export default async function getDict(
  id?: string
): Promise<(id: string, options?: DictionaryTranslationOptions) => string> {
  // ---------- SET UP ---------- //

  const getId = (suffix: string) => {
    return id ? `${id}.${suffix}` : suffix;
  };

  const locale = await getLocale();
  const I18NConfig = getI18NConfig();
  const defaultLocale = I18NConfig.getDefaultLocale();
  const [translationRequired] = I18NConfig.requiresTranslation(locale);
  const renderSettings = I18NConfig.getRenderSettings();

  // ----- FETCH TRANSLATIONS ----- //

  // Get cached translations
  const cachedTranslationsPromise: Promise<TranslationsObject> =
    translationRequired
      ? I18NConfig.getCachedTranslations(locale)
      : ({} as any);

  // Get default dictionary
  const dictionariesPromise: Promise<FlattenedDictionary> =
    I18NConfig.getDictionary(locale, id);

  // Get translation dictionary
  const translationDictionaryPromise: Promise<FlattenedDictionary> =
    I18NConfig.getDictionary(locale, id);

  // Block until cache check resolves and dictionaries resolve
  const [translations, defaultDictionary, translationsDictionary] =
    await Promise.all([
      cachedTranslationsPromise,
      dictionariesPromise,
      translationDictionaryPromise,
    ]);

  // ---------- THE d() METHOD ---------- //

  /**
   * @description A function that translates a dictionary entry based on its `id` and options.
   * @param {string} id The identifier of the dictionary entry to translate.
   * @param {DictionaryTranslationOptions} options
   * @returns The translated version of the dictionary entry.
   *
   * @example
   * d('greetings.greeting1'); // Translates item in dictionary under greetings.greeting1
   *
   * @example
   * // dictionary entry
   * {
   *  greetings: {
   *    greeting2: "Hello, {name}!"
   *  }
   * }
   *
   * // Translates item in dictionary under greetings.greeting2 and replaces {name} with 'John'
   * d('greetings.greeting2', { variables: { name: 'John' } });
   */
  const d = (
    id: string,
    options: DictionaryTranslationOptions = {}
  ): string => {
    // Get entry
    id = getId(id);
    const value = getDictionaryEntry(defaultDictionary, id);

    // Check: no entry found
    if (!value) {
      console.warn(createNoEntryFoundWarning(id));
      return '';
    }

    // Check: invalid entry
    if (!isValidDictionaryEntry(value)) {
      console.warn(createInvalidDictionaryEntryWarning(id));
      return '';
    }

    // Get entry and metadata
    const { entry, metadata } = getEntryAndMetadata(value);

    // Validate entry
    if (!entry || typeof entry !== 'string') return '';

    // Parse content
    const source = splitStringToContent(entry);

    // Render Method
    const renderContent = (content: Content, locales: string[]) => {
      return renderContentToString(
        content,
        locales,
        options.variables,
        options.variablesOptions
      );
    };

    // Check: translation required
    if (!translationRequired) return renderContent(source, [defaultLocale]);

    // ----- CHECK DICTIONARY ----- //

    // Get dictionaryTranslation
    const dictionaryTranslation = translationsDictionary?.[id];

    // Check: valid entry
    if (isValidDictionaryEntry(dictionaryTranslation)) {
      // Get entry and metadata
      const { entry } = getEntryAndMetadata(dictionaryTranslation);

      // Render translation
      return renderContent(entry, [locale, defaultLocale]);
    }

    // ----- CHECK TRANSLATIONS ----- //

    // Get hash
    const hash = hashJsxChildren({
      source,
      ...(metadata?.context && { context: metadata?.context }),
      id,
      dataFormat: 'JSX',
    });

    // Check id first
    const translationEntry = translations?.[hash];

    // Check translation successful
    if (translationEntry?.state === 'success')
      return renderContent(translationEntry.target as Content, [
        locale,
        defaultLocale,
      ]);

    // Check translation errored
    if (translationEntry?.state === 'error') {
      return renderContent(source, [defaultLocale]);
    }

    // ----- TRANSLATE ON DEMAND ----- //
    // develoment only

    if (!I18NConfig.isDevelopmentApiEnabled()) {
      console.warn(createDictionaryTranslationError(id));
      return renderContent(source, [defaultLocale]);
    }

    // Translate on demand
    I18NConfig.translateContent({
      source,
      targetLocale: locale,
      options: {
        ...(metadata?.context && { context: metadata?.context }),
        id,
        hash,
      },
    }).catch(() => {}); // Error logged in I18NConfig

    // Loading translation warning
    console.warn(translationLoadingWarning);

    // Loading behavior
    if (renderSettings.method === 'replace') {
      return renderContent(source, [defaultLocale]);
    } else if (renderSettings.method === 'skeleton') {
      return '';
    }

    // Default is returning source, rather than returning a loading state
    return renderContent(source, [defaultLocale]);
  };

  return d;
}
