import { Content } from 'generaltranslation/internal';
import React, { ReactElement } from 'react';
export type Child = React.ReactNode;
export type Children = Child[] | Child;
export type GTProp = {
    id: number;
    transformation?: string;
    children?: Children;
} & Record<string, any>;
export type TaggedChild = React.ReactNode | TaggedElement;
export type TaggedChildren = TaggedChild[] | TaggedChild;
export type TaggedElementProps = Record<string, any> & {
    'data-_gt': GTProp;
};
export type TaggedElement = React.ReactElement<TaggedElementProps>;
export type TaggedEntry = string | TaggedChildren;
export type TaggedDictionaryEntry = TaggedEntry | [TaggedEntry] | [TaggedEntry, Metadata];
export type TaggedDictionary = {
    [key: string]: TaggedDictionary | TaggedDictionaryEntry;
};
export type FlattenedTaggedDictionary = {
    [key: string]: TaggedDictionaryEntry;
};
export type FlattenedContentDictionary = Record<string, {
    hash: string;
    source: Content;
    metadata?: Record<string, any>;
}>;
export type Entry = string | ReactElement;
export type Metadata = {
    singular?: Entry;
    plural?: Entry;
    zero?: Entry;
    dual?: Entry;
    one?: Entry;
    two?: Entry;
    few?: Entry;
    many?: Entry;
    other?: Entry;
    context?: string;
    variablesOptions?: Record<string, any>;
    [key: string]: any;
};
export type DictionaryEntry = Entry | [Entry] | [Entry, Metadata];
export type Dictionary = {
    [key: string]: Dictionary | DictionaryEntry;
};
export type FlattenedDictionary = {
    [key: string]: DictionaryEntry;
};
export type Variable = {
    key: string;
    id?: number;
    variable?: 'variable' | 'number' | 'datetime' | 'currency';
};
export type TranslatedElement = {
    type: string;
    props: {
        'data-_gt': {
            id: number;
            [key: string]: any;
        };
        children?: TranslatedChildren;
    };
};
export type TranslatedChild = TranslatedElement | string | Variable;
export type TranslatedChildren = TranslatedChild | TranslatedChild[];
export type TranslatedContent = string | (string | Variable)[];
export type TranslationError = {
    state: 'error';
    error: string;
    code?: number;
};
export type TranslationSuccess = {
    state: 'success';
    target: TranslatedChildren | TranslatedContent;
};
export type TranslationLoading = {
    state: 'loading';
};
export type TranslationsObject = {
    [key: string]: TranslationSuccess | TranslationLoading | TranslationError;
};
export type LocalesTranslations = {
    [locale: string]: TranslationsObject | null;
};
export type RenderMethod = 'skeleton' | 'replace' | 'default';
export type TranslationOptions = {
    context?: string;
    variables?: Record<string, any>;
    variableOptions?: Record<string, Intl.NumberFormatOptions | Intl.DateTimeFormatOptions>;
    [key: string]: any;
};
export declare class GTTranslationError extends Error {
    error: string;
    code: number;
    constructor(error: string, code: number);
    toTranslationError(): TranslationError;
}
//# sourceMappingURL=types.d.ts.map