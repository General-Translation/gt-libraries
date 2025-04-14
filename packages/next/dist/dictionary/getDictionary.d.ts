import { Dictionary, DictionaryEntry } from 'gt-react/internal';
/**
 * Retrieves default dictionary for a given locale from bundle.
 * @returns {Promise<Dictionary | undefined>} The dictionary data or undefined if not found.
 * NOTE: This is different from DictionaryManager.getDictionary() because it checks require('gt-next/_dictionary')
 */
export default function getDictionary(): Promise<Dictionary | undefined>;
export declare function getDictionaryEntry(id: string): Dictionary | DictionaryEntry | undefined;
//# sourceMappingURL=getDictionary.d.ts.map