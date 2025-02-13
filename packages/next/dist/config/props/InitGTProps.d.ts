import { RenderMethod } from 'gt-react/internal';
type InitGTProps = {
    translationLoaderType?: 'remote' | 'custom' | 'disabled';
    dictionary?: string;
    i18n?: string;
    config?: string;
    translationLoaderPath?: string;
    apiKey?: string;
    projectId?: string;
    runtimeUrl?: string | null;
    cacheUrl?: string | null;
    cacheExpiryTime?: number;
    locales?: string[];
    defaultLocale?: string;
    getLocale?: () => Promise<string>;
    renderSettings?: {
        method: RenderMethod;
        timeout?: number;
    };
    getMetadata?: () => Promise<Record<string, any>>;
    maxConcurrentRequests?: number;
    maxBatchSize?: number;
    batchInterval?: number;
    description?: string;
    _usingPlugin?: boolean;
    [key: string]: any;
};
export default InitGTProps;
//# sourceMappingURL=InitGTProps.d.ts.map