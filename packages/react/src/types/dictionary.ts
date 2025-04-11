// ----- DICTIONARY ----- //

import { Metadata } from './types';

// a user defined dict (e.g. a user provided translation)
export type DictionaryContent = string;

// maps dict ids to dict content
export type DictionaryObject = {
  [id: string]: DictionaryContent;
};

// base dictionary entry
export type Entry = string;

// dictionary entry with metadata
export type DictionaryEntry = Entry | [Entry] | [Entry, Metadata];

// dictionary
export type Dictionary = {
  [key: string]: Dictionary | DictionaryEntry;
};

// flattened dictionary
export type FlattenedDictionary = {
  [key: string]: DictionaryEntry;
};

// maps locales to dict objects
export type Dictionaries = {
  [locale: string]: FlattenedDictionary;
};
