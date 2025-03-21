export declare const projectIdMissingError = "gt-react Error: General Translation cloud services require a project ID! Find yours at generaltranslation.com/dashboard.";
export declare const devApiKeyProductionError = "gt-react Error: Production environments cannot include a development api key.";
export declare const createNoAuthError = "gt-react Error: Configuration is missing a projectId and/or devApiKey. Please add these values to your environment or pass them to the <GTProvider> directly.";
export declare const createPluralMissingError: (children: any) => string;
export declare const createClientSideTDictionaryCollisionError: (id: string) => string;
export declare const createClientSideTHydrationError: (id: string) => string;
export declare const createNestedDataGTError: (child: any) => string;
export declare const createNestedTError: (child: any) => string;
export declare const renderingError = "General Translation: Rendering error.";
export declare const dynamicTranslationError = "Error fetching batched translations:";
export declare const createGenericRuntimeTranslationError: (id: string | undefined, hash: string) => string;
export declare const runtimeTranslationError = "gt-react Error: Runtime translation failed: ";
export declare const customLoadTranslationsError: (locale?: string) => string;
export declare const customLoadDictionaryWarning: (locale?: string) => string;
export declare const projectIdMissingWarning = "gt-react: Translation cloud services require a project ID! Find yours at generaltranslation.com/dashboard.";
export declare const createNoEntryFoundWarning: (id: string) => string;
export declare const createInvalidDictionaryEntryWarning: (id: string) => string;
export declare const createNoEntryTranslationWarning: (id: string, prefixedId: string) => string;
export declare const createMismatchingHashWarning: (expectedHash: string, receivedHash: string) => string;
export declare const APIKeyMissingWarn: string;
export declare const createUnsupportedLocalesWarning: (locales: string[]) => string;
export declare const runtimeTranslationTimeoutWarning = "gt-react: Runtime translation timed out.";
export declare const createUnsupportedLocaleWarning: (validatedLocale: string, newLocale: string) => string;
export declare const dictionaryMissingWarning = "gt-react Warning: No dictionary was found. Ensure you are either passing your dictionary to the <GTProvider>.";
//# sourceMappingURL=createErrors.d.ts.map