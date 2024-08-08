/**
 * Represents a language object with optional script and region.
 */
export type LanguageObject = {
    language: string;
    script?: string;
    region?: string;
};
export declare function _getLanguageObject(codes: string[]): (LanguageObject | null)[];
export declare function _isSameLanguage(codes: string[]): boolean;
