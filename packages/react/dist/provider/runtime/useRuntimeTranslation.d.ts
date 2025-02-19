import { RenderMethod, TranslateChildrenCallback, TranslateContentCallback } from '../../types/types';
export default function useRuntimeTranslation({ projectId, devApiKey, locale, versionId, defaultLocale, runtimeUrl, renderSettings, setTranslations, runtimeTranslationEnabled, ...globalMetadata }: {
    projectId?: string;
    devApiKey?: string;
    locale: string;
    versionId?: string;
    defaultLocale?: string;
    runtimeUrl?: string | null;
    runtimeTranslationEnabled: boolean;
    renderSettings: {
        method: RenderMethod;
        timeout?: number;
    };
    setTranslations: React.Dispatch<React.SetStateAction<any>>;
    [key: string]: any;
}): {
    translateContent: TranslateContentCallback;
    translateJsx: TranslateChildrenCallback;
};
//# sourceMappingURL=useRuntimeTranslation.d.ts.map