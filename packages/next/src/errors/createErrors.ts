// ---- ERRORS ---- //

import { getLocaleProperties } from 'generaltranslation';

export const remoteTranslationsError =
  'gt-next: Error fetching remote translation.';

export const customLoadTranslationError =
  'gt-next: Error fetching locally stored translations. If you are using a custom loadTranslation(), make sure it is correctly implemented.';

export const createStringTranslationError = (content: string, id?: string) =>
  `gt-next string translation error. tx("${content}")${
    id ? ` with id "${id}"` : ''
  } failed.`;

export const createDictionaryStringTranslationError = (id: string) =>
  `gt-next: Error string translation error. Translation from dictionary with id: ${id} failed.`;

export const createRequiredPrefixError = (id: string, requiredPrefix: string) =>
  `gt-next: Error You are using <GTProvider> with a provided prefix id: "${requiredPrefix}", but one of the children of <GTProvider> has the id "${id}". Change the <GTProvider> id prop or your dictionary structure to proceed.`;

export const devApiKeyIncludedInProductionError = `gt-next: Error You are attempting a production using a development API key. Replace this API key with a production API key when you build your app for production.`;

export const createDictionarySubsetError = (id: string, functionName: string) =>
  `gt-next: Error ${functionName} with id: "${id}". Invalid dictionary entry detected. Make sure you are navigating to the correct subroute of the dictionary with the ID you provide.`;

export const createMissingCustomTranslationLoadedError = (
  customLoadTranslationPath: string | undefined
) =>
  'gt-next: Error ' + customLoadTranslationPath
    ? `Local translations exist, but no translation loader is found. Please create a translation loader at ${customLoadTranslationPath}`
    : 'Local translations exist, but no translation loader is found. See generaltranslation.com/docs for more information on how to create a translation loader.';

export const dictionaryDisabledError = `gt-next: Error You are trying to use a dictionary, but you have not added the initGT() plugin to your app. You must add initGT() to use dictionaries. For more information, visit generaltranslation.com/docs`;

export const unresolvedCustomLoadTranslationError = `gt-next: Error Custom translation loader could not be resolved. This usually means that the file was found, but the translation loader function itself was not exported.`;

// ---- WARNINGS ---- //

export const usingDefaultsWarning =
  'gt-next: Warn Unable to access gt-next configuration. Using defaults.';

export const createNoEntryWarning = (id: string) =>
  `gt-next: Warn No dictionary entry found for id: "${id}"`;

export const createUnsupportedLocalesWarning = (locales: string[]) =>
  `gt-next: Warn The following locales are currently unsupported by our service: ${locales
    .map((locale) => {
      const { name } = getLocaleProperties(locale);
      return `${locale} (${name})`;
    })
    .join(', ')}`;

export const createMismatchingHashWarning = (
  expectedHash: string,
  receivedHash: string
) =>
  `gt-next: Warn Mismatching hashes! Expected hash: ${expectedHash}, but got hash: ${receivedHash}. We will still render your translation, but make sure to update to the newest version: generaltranslation.com/docs`;

export const projectIdMissingWarn = `gt-next: Warn Project ID missing! Set projectId as GT_PROJECT_ID in your environment or by passing the projectId parameter to initGT(). Find your project ID: generaltranslation.com/dashboard.`;

export const noInitGTWarn =
  `gt-next: Warn You are running General Translation without the initGT() plugin. ` +
  `This means that you are not translating your app. To activate translation, add the initGT() plugin to your app, ` +
  `and set the projectId and apiKey in your environment. ` +
  `For more information, visit https://generaltranslation.com/docs/next/tutorials/quickstart`;

export const APIKeyMissingWarn =
  `gt-next: Warn An Development API key is required for runtime translation!  ` +
  `Find your Development API key: generaltranslation.com/dashboard.  ` +
  `(Or, disable this warning message by setting runtimeUrl to an empty string which disables runtime translation.)`;
