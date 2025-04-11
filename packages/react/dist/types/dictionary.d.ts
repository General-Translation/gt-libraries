import { Metadata } from './types';
export type DictionaryContent = string;
export type DictionaryObject = {
    [id: string]: DictionaryContent;
};
export type Entry = string;
export type DictionaryEntry = Entry | [Entry] | [Entry, Metadata];
export type Dictionary = {
    [key: string]: Dictionary | DictionaryEntry;
};
export type FlattenedDictionary = {
    [key: string]: DictionaryEntry;
};
export type Dictionaries = {
    [locale: string]: FlattenedDictionary;
};
//# sourceMappingURL=dictionary.d.ts.map