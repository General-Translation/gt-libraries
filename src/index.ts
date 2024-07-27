// `generaltranslation` language toolkit
// © 2024, General Translation, Inc.

// ----- IMPORTS ----- //

import { _isValidLanguageCode, _getLanguageObject, _getLanguageCode, _getLanguageName, _isSameLanguage } from './codes/codes';
import _getLanguageDirection from './codes/getLanguageDirection';
import _bundleRequests from './translation/_bundleRequests';
import _intl from './translation/_intl';
import _translate from './translation/_translate';
import _translateReactChildren from './translation/_translateReactChildren';

// TO DO
// - Times/dates?
// - Currency conversion?

// ----- CORE CLASS ----- // 

const getDefaultFromEnv = (VARIABLE: string): string => {
    if (typeof process !== 'undefined' && process.env) {
        return process.env[VARIABLE] || '';
    }
    return '';
}

/**
 * Type representing the constructor parameters for the GT class.
 */
type GTConstructorParams = {
    apiKey?: string;
    defaultLanguage?: string;
    projectID?: string;
    baseURL?: string;
};

/**
 * GT is the core driver for the General Translation library.
 */
class GT {
    apiKey: string;
    defaultLanguage: string;
    projectID: string;
    baseURL: string;

    /**
     * Constructs an instance of the GT class.
     * 
     * @param {GTConstructorParams} [params] - The parameters for initializing the GT instance.
     * @param {string} [params.apiKey=''] - The API key for accessing the translation service.
     * @param {string} [params.defaultLanguage='en'] - The default language for translations.
     * @param {string} [params.projectID=''] - The project ID for the translation service.
     * @param {string} [params.baseURL='https://prod.gtx.dev'] - The base URL for the translation service.
     */
    constructor({
        apiKey = '',
        defaultLanguage = 'en',
        projectID = '',
        baseURL = 'https://prod.gtx.dev'
    }: GTConstructorParams = {}) {
        this.apiKey = apiKey || getDefaultFromEnv('GT_API_KEY');
        this.projectID = projectID || getDefaultFromEnv('GT_PROJECT_ID');
        this.defaultLanguage = defaultLanguage.toLowerCase();
        this.baseURL = baseURL;
    }

    /**
    * Translates a string into a target language.
    * @param {string} content - A string to translate.
    * @param {string} targetLanguage - The target language for the translation.
    * @param {{ notes?: string, [key: string]: any }} metadata - Additional metadata for the translation request.
    * @returns {Promise<{ translation: string, error?: Error | unknown }>} - The translated content with optional error information.
    */
    async translate(content: string, targetLanguage: string, metadata?: { notes?: string, [key: string]: any }): Promise<{ translation: string, error?: Error | unknown }> {
        return await _translate(this, content, targetLanguage, { projectID: this.projectID, defaultLanguage: this.defaultLanguage, ...metadata})
    }

    /**
    * Translates a string and caches for use in a public project.
    * @param {string} content - A string to translate.
    * @param {string} targetLanguage - The target language for the translation.
    * @param {string} projectID - The ID of the project.
    * @param {dictionaryName?: string, context?: string, [key: string]: any }} metadata - Additional metadata for the translation request.
    * @returns {Promise<{ translation: string, error?: Error | unknown }>} The translated content with optional error information.
    */
    async intl(content: string, targetLanguage: string, projectID?: string, metadata?: { dictionaryName?: string, context?: string, [key:string]: any }): Promise<{ translation: string; error?: Error | unknown; }> {
        return await _intl(this, content, targetLanguage, projectID || this.projectID, { projectID: projectID || this.projectID, defaultLanguage: this.defaultLanguage, ...metadata })
    }
   
    /**
    * Translates the content of React children elements.
    * 
    * @param {Object} params - The parameters for the translation.
    * @param {any} params.content - The React children content to be translated.
    * @param {string} params.targetLanguage - The target language for the translation.
    * @param {Object} params.metadata - Additional metadata for the translation process.
    * 
    * @returns {Promise<any>} - A promise that resolves to the translated content.
    */
    async translateReactChildren(content: any, targetLanguage: string, metadata?: { [key: string]: any }): Promise<{ translation: any | null, error?: Error | unknown }> {
        return await _translateReactChildren(this, content, targetLanguage, { projectID: this.projectID, defaultLanguage: this.defaultLanguage, ...metadata });
    }

    /**
    * Bundles multiple requests and sends them to the server.
    * @param requests - Array of requests to be processed and sent.
    * @returns A promise that resolves to an array of processed results.
    */
    async bundleRequests(requests: any[]): Promise<Array<any | null>> {
        return _bundleRequests(this, requests);
    }

}


// ----- EXPORTS ----- //

// Export the class
export default GT;

// Export the functions 
export const getLanguageDirection = _getLanguageDirection;
export const isValidLanguageCode = _isValidLanguageCode;
export const getLanguageObject = _getLanguageObject;
export const getLanguageCode = _getLanguageCode;
export const getLanguageName = _getLanguageName;
export const isSameLanguage = _isSameLanguage;
