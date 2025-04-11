"use strict";
// ---- ERRORS ---- //
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDictionarySubsetWarning = exports.dictionaryUnavailableWarning = exports.defaultDictionaryUnavailableWarning = exports.flattenDictionaryWarning = exports.standardizedLocalesWarning = exports.dictionaryNotFoundWarning = exports.runtimeTranslationTimeoutWarning = exports.translationLoadingWarning = exports.APIKeyMissingWarn = exports.noInitGTWarn = exports.projectIdMissingWarn = exports.createMismatchingHashWarning = exports.createUnsupportedLocalesWarning = exports.createInvalidDictionaryEntryWarning = exports.createNoEntryFoundWarning = exports.usingDefaultsWarning = exports.defaultDictionaryUnavailableError = exports.flattenDictionaryError = exports.unresolvedLoadTranslationsBuildError = exports.unresolvedLoadDictionaryBuildError = exports.unresolvedCustomLoadTranslationsError = exports.unresolvedCustomLoadDictionaryError = exports.dictionaryDisabledError = exports.createDictionarySubsetError = exports.devApiKeyIncludedInProductionError = exports.createRequiredPrefixError = exports.createDictionaryTranslationError = exports.createStringTranslationError = exports.customLoadDictionaryWarning = exports.customLoadTranslationsError = exports.remoteTranslationsError = void 0;
var generaltranslation_1 = require("generaltranslation");
exports.remoteTranslationsError = 'gt-next Error: fetching remote translation.';
var customLoadTranslationsError = function (locale) {
    if (locale === void 0) { locale = ''; }
    return "gt-next Error: fetching locally stored translations. If you are using a custom loadTranslations(\"".concat(locale, "\"), make sure it is correctly implemented.");
};
exports.customLoadTranslationsError = customLoadTranslationsError;
var customLoadDictionaryWarning = function (locale) {
    if (locale === void 0) { locale = ''; }
    return "gt-next Warning: fetching locally stored translation dictionary. If you are using a custom loadDictionary(\"".concat(locale, "\"), make sure it is correctly implemented.");
};
exports.customLoadDictionaryWarning = customLoadDictionaryWarning;
var createStringTranslationError = function (string, id, functionName) {
    if (functionName === void 0) { functionName = 'tx'; }
    return "gt-next string translation error. ".concat(functionName, "(\"").concat(string, "\")").concat(id ? " with id \"".concat(id, "\"") : '', " could not locate translation.");
};
exports.createStringTranslationError = createStringTranslationError;
var createDictionaryTranslationError = function (id) {
    return "gt-next Error: Dictionary translation entry with id: ".concat(id, " could not be found.");
};
exports.createDictionaryTranslationError = createDictionaryTranslationError;
var createRequiredPrefixError = function (id, requiredPrefix) {
    return "gt-next Error: You are using <GTProvider> with a provided prefix id: \"".concat(requiredPrefix, "\", but one of the children of <GTProvider> has the id \"").concat(id, "\". Change the <GTProvider> id prop or your dictionary structure to proceed.");
};
exports.createRequiredPrefixError = createRequiredPrefixError;
exports.devApiKeyIncludedInProductionError = "gt-next Error: You are attempting a production using a development API key. Replace this API key with a production API key when you build your app for production.";
var createDictionarySubsetError = function (id) {
    return "gt-next Error: prefixId: \"".concat(id, "\" cannot map to a single entry. A prefixId must correspond to a parent with multiple children.");
};
exports.createDictionarySubsetError = createDictionarySubsetError;
exports.dictionaryDisabledError = "gt-next Error: You are trying to use a dictionary, but you have not added the withGTConfig() plugin to your app. You must add withGTConfig() to use dictionaries. For more information, visit generaltranslation.com/docs";
exports.unresolvedCustomLoadDictionaryError = "gt-next Error: loadDictionary() could not be resolved. This usually means that the file was found, but the loadDictionary() function itself was not exported.";
exports.unresolvedCustomLoadTranslationsError = "gt-next Error: loadTranslations() could not be resolved. This usually means that the file was found, but the loadTranslations() function itself was not exported.";
var unresolvedLoadDictionaryBuildError = function (path) {
    return "gt-next Error: File defining loadDictionary() could not be resolved at ".concat(path);
};
exports.unresolvedLoadDictionaryBuildError = unresolvedLoadDictionaryBuildError;
var unresolvedLoadTranslationsBuildError = function (path) {
    return "gt-next Error: File defining loadTranslations() function could not be resolved at ".concat(path);
};
exports.unresolvedLoadTranslationsBuildError = unresolvedLoadTranslationsBuildError;
var flattenDictionaryError = function (error, locale) {
    return "gt-next Error: Flattening dictionary for locale: ".concat(locale, " failed. Reason: ").concat(error.message);
};
exports.flattenDictionaryError = flattenDictionaryError;
exports.defaultDictionaryUnavailableError = "gt-next Error: Default dictionary is unavailable. Make sure you have provided a dictionary.js, dictionary.json, or [defaultLocale].json file.";
// ---- WARNINGS ---- //
exports.usingDefaultsWarning = 'gt-next: Unable to access gt-next configuration. Using defaults.';
var createNoEntryFoundWarning = function (id) {
    return "gt-next: No valid dictionary entry found for id: \"".concat(id, "\"");
};
exports.createNoEntryFoundWarning = createNoEntryFoundWarning;
var createInvalidDictionaryEntryWarning = function (id) {
    return "gt-next: Invalid dictionary entry found for id: \"".concat(id, "\"");
};
exports.createInvalidDictionaryEntryWarning = createInvalidDictionaryEntryWarning;
var createUnsupportedLocalesWarning = function (locales) {
    return "gt-next: The following locales are currently unsupported by our service: ".concat(locales
        .map(function (locale) {
        var name = (0, generaltranslation_1.getLocaleProperties)(locale).name;
        return "".concat(locale, " (").concat(name, ")");
    })
        .join(', '));
};
exports.createUnsupportedLocalesWarning = createUnsupportedLocalesWarning;
var createMismatchingHashWarning = function (expectedHash, receivedHash) {
    return "gt-next: Mismatching hashes! Expected hash: ".concat(expectedHash, ", but got hash: ").concat(receivedHash, ". We will still render your translation, but make sure to update to the newest version: generaltranslation.com/docs");
};
exports.createMismatchingHashWarning = createMismatchingHashWarning;
exports.projectIdMissingWarn = "gt-next: Project ID missing! Set projectId as GT_PROJECT_ID in your environment or by passing the projectId parameter to withGTConfig(). Find your project ID: generaltranslation.com/dashboard.";
exports.noInitGTWarn = "gt-next: You are running General Translation without the withGTConfig() plugin. " +
    "This means that you are not translating your app. To activate translation, add the withGTConfig() plugin to your app, " +
    "and set the projectId and apiKey in your environment. " +
    "For more information, visit https://generaltranslation.com/docs/next/tutorials/quickstart";
exports.APIKeyMissingWarn = "gt-next: A Development API key is required for runtime translation!  " +
    "Find your Development API key: generaltranslation.com/dashboard.  " +
    "(Or, disable this warning message by setting runtimeUrl to an empty string which disables runtime translation.)";
exports.translationLoadingWarning = "gt-next: [DEV ONLY] Translations have changed since the last update. " +
    "Translations in production will be preloaded, and page will not need to be refreshed.";
exports.runtimeTranslationTimeoutWarning = "gt-next: Runtime translation timed out.";
exports.dictionaryNotFoundWarning = "gt-next: Dictionary not found. Make sure you have added a dictionary to your project (either dictionary.js or [defaultLocale].json), and you have added the withGTConfig() plugin.";
var standardizedLocalesWarning = function (locales) {
    return "gt-next: You are using The following locales were standardized: ".concat(locales.join(', '), ".");
};
exports.standardizedLocalesWarning = standardizedLocalesWarning;
var flattenDictionaryWarning = function (error, locale) {
    return "gt-next: Flattening dictionary for locale: ".concat(locale, " failed. Reason: ").concat(error.message);
};
exports.flattenDictionaryWarning = flattenDictionaryWarning;
exports.defaultDictionaryUnavailableWarning = "gt-next: Default dictionary is unavailable. Make sure you have provided a dictionary.js, dictionary.json, or [defaultLocale].json file.";
var dictionaryUnavailableWarning = function (locale) {
    return "gt-next: Dictionary for locale: ".concat(locale, " is not in your list of supported locales.");
};
exports.dictionaryUnavailableWarning = dictionaryUnavailableWarning;
var createDictionarySubsetWarning = function (id) {
    return "gt-next: prefixId: \"".concat(id, "\" cannot map to a single entry. A prefixId must correspond to a parent with multiple children.");
};
exports.createDictionarySubsetWarning = createDictionarySubsetWarning;
//# sourceMappingURL=createErrors.js.map