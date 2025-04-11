import { createDuplicateKeyError } from '../errors/createErrors';
import { Dictionary, FlattenedDictionary } from '../types/dictionary';

/**
 * Flattens a nested dictionary by concatenating nested keys.
 * Throws an error if two keys result in the same flattened key.
 * @param {Record<string, any>} dictionary - The dictionary to flatten.
 * @param {string} [prefix=''] - The prefix for nested keys.
 * @returns {Record<string, React.ReactNode>} The flattened dictionary object.
 * @throws {Error} If two keys result in the same flattened key.
 */
export default function flattenDictionary(
  dictionary: Dictionary,
  prefix: string = ''
): FlattenedDictionary {
  const flattened: FlattenedDictionary = {};
  for (const key in dictionary) {
    if (dictionary.hasOwnProperty(key)) {
      // Create new key with prefix if it exists
      const newKey = prefix ? `${prefix}.${key}` : key;
      if (
        // Check if nested dictionary
        typeof dictionary[key] === 'object' &&
        dictionary[key] !== null &&
        !Array.isArray(dictionary[key])
      ) {
        // Recursively flatten nested dictionary
        const nestedFlattened = flattenDictionary(dictionary[key], newKey);
        // Add nested dictionary to flattened dictionary
        for (const flatKey in nestedFlattened) {
          if (flattened.hasOwnProperty(flatKey)) {
            throw new Error(createDuplicateKeyError(flatKey));
          }
          flattened[flatKey] = nestedFlattened[flatKey];
        }
      } else {
        // Add DictionaryEntry to flattened dictionary
        if (flattened.hasOwnProperty(newKey)) {
          throw new Error(createDuplicateKeyError(newKey));
        }
        flattened[newKey] = dictionary[key];
      }
    }
  }
  return flattened;
}
