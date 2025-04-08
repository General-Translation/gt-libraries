import flattenDictionary from './internal/flattenDictionary';
import addGTIdentifier from './internal/addGTIdentifier';
import writeChildrenAsObjects from './internal/writeChildrenAsObjects';
import getPluralBranch from './branches/plurals/getPluralBranch';
import getDictionaryEntry, {
  isValidDictionaryEntry,
} from './provider/helpers/getDictionaryEntry';
import getEntryAndMetadata from './provider/helpers/getEntryAndMetadata';
import getVariableProps from './variables/_getVariableProps';
import isVariableObject from './provider/helpers/isVariableObject';
import getVariableName from './variables/getVariableName';
import renderDefaultChildren from './provider/rendering/renderDefaultChildren';
import renderTranslatedChildren from './provider/rendering/renderTranslatedChildren';
import { defaultRenderSettings } from './provider/rendering/defaultRenderSettings';
import renderSkeleton from './provider/rendering/renderSkeleton';
import {
  RenderMethod,
  TranslatedChildren,
  TranslatedContent,
  TranslationError,
  TranslationsObject,
  TranslationSuccess,
  TranslationLoading,
  Children,
  Metadata,
  Child,
  GTProp,
  GTTranslationError,
  DictionaryTranslationOptions,
  InlineTranslationOptions,
  RuntimeTranslationOptions,
  CustomLoader,
  RenderVariable,
  VariableProps,
} from './types/types';

import { GTContextType, ClientProviderProps } from './types/providers';
import { defaultLocaleCookieName } from './utils/cookies';
import mergeDictionaries from './provider/helpers/mergeDictionaries';
import {
  Dictionary,
  DictionaryContent,
  DictionaryEntry,
  DictionaryObject,
  Entry,
  FlattenedDictionary,
  LocalesDictionary,
} from './types/dictionary';

export {
  addGTIdentifier,
  writeChildrenAsObjects,
  isVariableObject,
  Dictionary,
  flattenDictionary,
  getDictionaryEntry,
  isValidDictionaryEntry,
  getVariableProps,
  DictionaryEntry,
  FlattenedDictionary,
  GTTranslationError,
  Metadata,
  getPluralBranch,
  getEntryAndMetadata,
  getVariableName,
  renderDefaultChildren,
  renderTranslatedChildren,
  renderSkeleton,
  RenderMethod,
  defaultRenderSettings,
  Children,
  Child,
  GTProp,
  Entry,
  TranslatedChildren,
  TranslatedContent,
  TranslationsObject,
  TranslationLoading,
  TranslationError,
  TranslationSuccess,
  GTContextType,
  ClientProviderProps,
  DictionaryTranslationOptions,
  InlineTranslationOptions,
  RuntimeTranslationOptions,
  DictionaryContent,
  DictionaryObject,
  LocalesDictionary,
  CustomLoader,
  RenderVariable,
  VariableProps,
  defaultLocaleCookieName,
  mergeDictionaries,
};
