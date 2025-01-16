import { RenderMethod, TranslatedChildren, TranslatedContent } from 'gt-react/internal';
type I18NConfigurationParams = {
    remoteCache: boolean;
    runtimeTranslation: boolean;
    apiKey?: string;
    devApiKey?: string;
    projectId: string;
    cacheUrl: string;
    runtimeUrl: string;
    cacheExpiryTime?: number;
    defaultLocale: string;
    locales: string[];
    renderSettings: {
        method: RenderMethod;
        timeout: number | null;
    };
    maxConcurrentRequests: number;
    maxBatchSize: number;
    batchInterval: number;
    [key: string]: any;
};
export default class I18NConfiguration {
    runtimeTranslation: boolean;
    remoteCache: boolean;
    apiKey?: string;
    devApiKey?: string;
    runtimeUrl: string;
    projectId: string;
    defaultLocale: string;
    locales: string[];
    renderSettings: {
        method: RenderMethod;
        timeout: number | null;
    };
    private _remoteTranslationsManager;
    metadata: Record<string, any>;
    maxConcurrentRequests: number;
    maxBatchSize: number;
    batchInterval: number;
    private _queue;
    private _activeRequests;
    private _translationCache;
    private _taggedDictionary;
    private _template;
    constructor({ runtimeTranslation, remoteCache, apiKey, devApiKey, projectId, runtimeUrl, cacheUrl, cacheExpiryTime, defaultLocale, locales, renderSettings, dictionary, maxConcurrentRequests, maxBatchSize, batchInterval, ...metadata }: I18NConfigurationParams);
    /**
     * Gets config for dynamic translation on the client side.
     */
    getClientSideConfig(): {
        projectId: string;
        devApiKey: string | undefined;
        runtimeUrl: string;
    };
    /**
     * Gets the application's default locale
     * @returns {string} A BCP-47 locale tag
     */
    getDefaultLocale(): string;
    /**
     * Gets the list of approved locales for this app
     * @returns {string[]} A list of BCP-47 locale tags, or undefined if none were provided
     */
    getLocales(): string[];
    /**
     * @returns A boolean indicating whether automatic translation is enabled or disabled for this config
     */
    translationEnabled(): boolean;
    /**
     * Get the rendering instructions
     * @returns An object containing the current method and timeout.
     * As of 1/14/25: method is "skeleton", "replace", "hang", "subtle", "default".
     * Timeout is a number or null, representing no assigned timeout.
     */
    getRenderSettings(): {
        method: RenderMethod;
        timeout: number | null;
    };
    /**
     * Checks if regional translation is required (ie en-US -> en-GB)
     * @param locale - The user's locale
     * @returns True if a regional translation is required, otherwise false
     */
    requiresRegionalTranslation(locale: string): boolean;
    /**
     * Check if translation is required based on the user's locale
     * @param locale - The user's locale
     * @returns True if translation is required, otherwise false
     */
    requiresTranslation(locale: string): boolean;
    addGTIdentifier(children: any, id?: string): any;
    /**
     * @returns {[any, string]} A xxhash hash and the children that were created from it
     */
    serializeAndHash(children: any, context?: string, id?: string): [any, string];
    /**
     * Get the translation dictionaries for this user's locale, if they exist
     * Globally shared cache
     * @param locale - The locale set by the user
     * @returns A promise that resolves to the translations.
     */
    getTranslations(locale: string): Promise<Record<string, any>>;
    /**
     * Translate content into language associated with a given locale
     * @param params - Parameters for translation
     * @returns Translated string
     */
    translateContent(params: {
        source: string | (string | {
            key: string;
            variable?: string;
        })[];
        targetLocale: string;
        options: Record<string, any>;
    }): Promise<TranslatedContent>;
    /**
     * Translate the children components
     * @param params - Parameters for translation
     * @returns A promise that resolves when translation is complete
     */
    translateChildren(params: {
        source: any;
        targetLocale: string;
        metadata: Record<string, any>;
    }): Promise<TranslatedChildren>;
    /**
     * Send a batch request for React translation
     * @param batch - The batch of requests to be sent
     */
    private _sendBatchRequest;
    /**
     * Start the batching process with a set interval
     */
    private _startBatching;
}
export {};
//# sourceMappingURL=I18NConfiguration.d.ts.map