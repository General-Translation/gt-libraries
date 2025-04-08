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
export type TaggedElementProps = Record<string, any> & { 'data-_gt': GTProp };
export type TaggedElement = React.ReactElement<TaggedElementProps>;

export type Metadata = {
  context?: string;
  variablesOptions?: Record<string, any>;
  [key: string]: any;
};

export type Variable = {
  key: string;
  id?: number;
  variable?: 'variable' | 'number' | 'datetime' | 'currency';
};

// ----- TRANSLATION ----- //

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
  target: TranslatedChildren | TranslatedContent; // target
};
export type TranslationLoading = {
  state: 'loading';
};

export type TranslationsObject = {
  [hash: string]: TranslationSuccess | TranslationLoading | TranslationError;
};
// maps locales to translation objects
export type LocalesTranslations = {
  [locale: string]: TranslationsObject | null;
};

export type CustomLoader = (locale: string) => Promise<any>;

export type RenderMethod = 'skeleton' | 'replace' | 'default';

export type DictionaryTranslationOptions = {
  variables?: Record<string, any>;
  variablesOptions?: Record<
    string,
    Intl.NumberFormatOptions | Intl.DateTimeFormatOptions
  >;
};
export type InlineTranslationOptions = {
  context?: string;
  id?: string;
} & DictionaryTranslationOptions;
export type RuntimeTranslationOptions = {
  locale?: string;
} & InlineTranslationOptions;

export class GTTranslationError extends Error {
  constructor(
    public error: string,
    public code: number
  ) {
    super(error);
    this.code = code;
  }

  toTranslationError(): TranslationError {
    return {
      state: 'error',
      error: this.error,
      code: this.code,
    };
  }
}

// ----- VARIABLES ----- //

export type VariableProps = {
  variableType: 'variable' | 'number' | 'datetime' | 'currency';
  variableValue: any;
  variableOptions: Intl.NumberFormatOptions | Intl.DateTimeFormatOptions;
  variableName: string;
};

export type RenderVariable = ({
  variableType,
  variableValue,
  variableOptions,
  locales,
}: Omit<VariableProps, 'variableName'> & {
  locales: string[];
}) => React.JSX.Element;
