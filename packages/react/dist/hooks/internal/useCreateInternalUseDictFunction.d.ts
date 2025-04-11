import { DictionaryTranslationOptions, RenderMethod, TranslationsObject } from '../../types/types';
import { TranslateContentCallback } from '../../types/runtime';
import { Dictionaries } from '../../types/dictionary';
export default function useCreateInternalUseDictFunction({ dictionaries, translations, locale, defaultLocale, translationRequired, dialectTranslationRequired, runtimeTranslationEnabled, registerContentForTranslation, renderSettings, }: {
    dictionaries: Dictionaries | undefined;
    translations: TranslationsObject | null;
    locale: string;
    defaultLocale: string;
    translationRequired: boolean;
    dialectTranslationRequired: boolean;
    runtimeTranslationEnabled: boolean;
    registerContentForTranslation: TranslateContentCallback;
    renderSettings: {
        method: RenderMethod;
    };
}): (id: string, options?: DictionaryTranslationOptions) => string;
//# sourceMappingURL=useCreateInternalUseDictFunction.d.ts.map