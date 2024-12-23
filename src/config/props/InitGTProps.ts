type InitGTProps = {
    // Request scoped filepath
    dictionary?: string;
    i18n?: string
    // Cloud integration
    apiKey?: string;
    projectId?: string;
    baseUrl?: string;
    clientBaseUrl?: string;
    cacheUrl?: string;
    cacheExpiryTime?: number;
    // Locale info
    locales?: string[];
    defaultLocale?: string;
    getLocale?: () => Promise<string>;
    // Rendering
    renderSettings?: {
        method: "skeleton" | "replace" | "hang" | "subtle",
        timeout: number | null
    }
    // Other metadata
    getMetadata?: () => Promise<Record<string, any>>
    // Batching config
    _maxConcurrentRequests?: number;
    _maxBatchSize?: number;
    _batchInterval?: number; // ms
    // Translation assistance
    description?: string
    // AI
    preferredModel?: string; // see docs.generaltranslation.com for a list of the most recent options
    // Other
    [key: string]: any;
}

export default InitGTProps;