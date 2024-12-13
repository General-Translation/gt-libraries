declare const defaultInitGTProps: {
    readonly apiKey: string;
    readonly devApiKey: "";
    readonly projectId: string;
    readonly baseUrl: "https://prod.gtx.dev";
    readonly cacheUrl: "https://cache.gtx.dev";
    readonly cacheExpiryTime: 6000;
    readonly defaultLocale: "en-US";
    readonly getLocale: () => Promise<"en-US">;
    readonly locales: string[];
    readonly renderSettings: {
        readonly method: "skeleton";
        readonly timeout: 8000 | null;
    };
    readonly env: string;
    readonly getMetadata: () => Promise<{}>;
    readonly _maxConcurrectRequests: 100;
    readonly _batchInterval: 10;
};
export default defaultInitGTProps;
//# sourceMappingURL=defaultInitGTProps.d.ts.map