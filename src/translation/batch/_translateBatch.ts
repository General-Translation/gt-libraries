import { ContentTranslationResult, ReactTranslationResult, Request } from '../../types/types'
import { translateBatchURL } from '../../settings/defaultURLs';
import { maxTimeout } from '../../settings/settings';

/**
 * @internal
 */
export default async function _translateBatch(
    gt: { baseURL: string, apiKey: string },
    requests: Request[]
): Promise<Array<ReactTranslationResult | ContentTranslationResult>> {
    
    const controller = new AbortController();
    const signal = controller.signal;

    // timeout with the lowest request
    const timeout = Math.min(...requests.map(request => request?.data?.metadata?.timeout || maxTimeout))
    if (timeout) setTimeout(() => controller.abort(), timeout);

    const response = await fetch(`${gt.baseURL}${translateBatchURL}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'gtx-api-key': gt.apiKey,
        },
        body: JSON.stringify(requests),
        signal
    });

    if (!response.ok) {
        throw new Error(`${response.status}: ${await response.text()}`);
    }

    const resultArray = await response.json();
    return resultArray as Array<ReactTranslationResult | ContentTranslationResult>;
}