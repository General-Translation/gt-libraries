export declare const APIKeyMissingError =
  'General Translation: API key is required for runtime translation! Create an API key: generaltranslation.com/dashboard/api-keys. (Or, turn off runtime translation by setting runtimeUrl to an empty string.)';
export declare const remoteTranslationsError =
  'General Translation: Error fetching remote translation.';
export declare const createStringTranslationError: (
  content: string,
  id?: string
) => string;
export declare const createDictionaryStringTranslationError: (
  id: string
) => string;
export declare const createRequiredPrefixError: (
  id: string,
  requiredPrefix: string
) => string;
export declare const devApiKeyIncludedInProductionError =
  'General Translation: You are attempting a production using a development API key. Replace this API key with a production API key when you build your app for production.';
export declare const createDictionarySubsetError: (
  id: string,
  functionName: string
) => string;
export declare const usingDefaultsWarning =
  'General Translation: Unable to access gt-next configuration. Using defaults.';
export declare const createNoEntryWarning: (id: string) => string;
export declare const createUnsupportedLocalesWarning: (
  locales: string[]
) => string;
export declare const createMismatchingHashWarning: (
  expectedHash: string,
  receivedHash: string
) => string;
export declare const projectIdMissingWarn =
  'General Translation: Project ID missing! Set projectId as GT_PROJECT_ID in the environment or by passing the projectId parameter to initGT(). Find your project ID: generaltranslation.com/dashboard.';
//# sourceMappingURL=createErrors.d.ts.map
