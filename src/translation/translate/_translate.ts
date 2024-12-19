import { Content, ContentTranslationResult, TranslationError } from "src/types";
import { maxTimeout } from "../../settings/settings";
import { translateContentUrl } from "../../settings/defaultURLs";

/**
 * @internal
**/
export default async function _translate(
    gt: { baseUrl: string; apiKey?: string, devApiKey?: string },
    source: Content,
    targetLocale: string,
    metadata: { [key: string]: any }
): Promise<ContentTranslationResult | TranslationError> {
    const controller = new AbortController();
    const signal = controller.signal;
    
    const timeout = metadata?.timeout || maxTimeout;
    if (timeout) setTimeout(() => controller.abort(), timeout);

    let response;
    try {
        response = await fetch(`${gt.baseUrl}${translateContentUrl}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(gt.apiKey && { 'x-gt-api-key': gt.apiKey }),
                ...(gt.devApiKey && { 'x-gt-dev-api-key': gt.devApiKey })
            },
            body: JSON.stringify({
                source, targetLocale, metadata
            }),
            signal
        });
    } catch (error: any) {
        if (error?.name === 'AbortError') {
            console.error('Translation request timed out');
            return { error: 'Translation request timed out', code: 408 };
        }
        throw error;
    }
    
    if (!response.ok) {
        throw new Error(`${response.status}: ${await response.text()}`);
    }
    const result = await response.json();
    return result as ContentTranslationResult | TranslationError;
}

