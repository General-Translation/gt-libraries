"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dictionaryManager = exports.DictionaryManager = void 0;
var generaltranslation_1 = require("generaltranslation");
var internal_1 = require("gt-react/internal");
var resolveDictionaryDictionary_1 = __importDefault(require("../loaders/resolveDictionaryDictionary"));
var createErrors_1 = require("../errors/createErrors");
var internal_2 = require("generaltranslation/internal");
/**
 * Manages Dictionary
 */
var DictionaryManager = /** @class */ (function () {
    /**
     * Creates an instance of DictionaryManager.
     * @constructor
     */
    function DictionaryManager() {
        this.dictionaries = {};
        this.defaultLocale = internal_2.libraryDefaultLocale;
    }
    // ---------- CONFIGURATION ---------- //
    /**
     * Set the config for the DictionaryManager.
     * @param {Object} config - The config object.
     * @param {string} config.defaultLocale - The default locale.
     */
    DictionaryManager.prototype.setConfig = function (_a) {
        var defaultLocale = _a.defaultLocale;
        this.defaultLocale = defaultLocale;
    };
    // ---------- DICTIONARY MANAGEMENT ---------- //
    /**
     * Retrieves dictionary for a given locale from bundle.
     *
     * Will also cache the dictionary in the internal cache.
     * @param {string} locale - The locale code.
     * @returns {Promise<FlattenedDictionary>} The dictionary data or empty object if not found.
     */
    DictionaryManager.prototype.getDictionary = function () {
        return __awaiter(this, arguments, void 0, function (locale, prefixId) {
            var flattenedDictionary, rawDictionary, subsetDictionary;
            var _a;
            if (locale === void 0) { locale = this.defaultLocale; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        flattenedDictionary = (_a = this.dictionaries) === null || _a === void 0 ? void 0 : _a[locale];
                        if (flattenedDictionary)
                            return [2 /*return*/, flattenedDictionary];
                        if (!(locale === this.defaultLocale)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._loadDefaultDictionary()];
                    case 1:
                        rawDictionary = _b.sent();
                        if (!rawDictionary) {
                            console.warn(createErrors_1.defaultDictionaryUnavailableWarning);
                        }
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this._loadDictionary(locale)];
                    case 3:
                        rawDictionary = _b.sent();
                        if (!rawDictionary) {
                            console.warn((0, createErrors_1.dictionaryUnavailableWarning)(locale));
                        }
                        _b.label = 4;
                    case 4:
                        // No result found
                        if (!rawDictionary) {
                            this.dictionaries[locale] = {};
                            return [2 /*return*/, {}];
                        }
                        // Flatten result
                        try {
                            flattenedDictionary = (0, internal_1.flattenDictionary)(rawDictionary);
                        }
                        catch (error) {
                            console.warn(error);
                            flattenedDictionary = {};
                        }
                        // Cache result
                        this.dictionaries[locale] = flattenedDictionary;
                        // Return entire dictionary
                        if (!prefixId) {
                            return [2 /*return*/, flattenedDictionary];
                        }
                        subsetDictionary = {};
                        try {
                            subsetDictionary = this._getDictionarySubset(flattenedDictionary, prefixId);
                        }
                        catch (error) {
                            console.warn(error);
                        }
                        return [2 /*return*/, subsetDictionary];
                }
            });
        });
    };
    // ---------- DICTIONARY LOADING HELPERS ---------- //
    /**
     * Retrieves default dictionary
     * @returns {Promise<Dictionary | undefined>} The default dictionary data.
     */
    DictionaryManager.prototype._loadDefaultDictionary = function () {
        return __awaiter(this, void 0, void 0, function () {
            var dictionaryFileType, dictionary;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dictionaryFileType = process.env._GENERALTRANSLATION_DICTIONARY_FILE_TYPE;
                        try {
                            if (dictionaryFileType === '.json') {
                                dictionary = require('gt-next/_dictionary');
                            }
                            else if (dictionaryFileType === '.ts' || dictionaryFileType === '.js') {
                                dictionary = require('gt-next/_dictionary').default;
                            }
                        }
                        catch (_b) { }
                        if (!(!dictionary && this.defaultLocale)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._loadDictionary(this.defaultLocale)];
                    case 1:
                        dictionary = _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/, dictionary];
                }
            });
        });
    };
    /**
     * Load dictionary for a given locale
     * @param {string} locale - The locale code.
     * @returns {Promise<Dictionary | undefined>} The dictionary data or undefined if not found.
     */
    DictionaryManager.prototype._loadDictionary = function (locale) {
        return __awaiter(this, void 0, void 0, function () {
            var result, customLoadDictionary, _a, languageCode, _b;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        customLoadDictionary = (0, resolveDictionaryDictionary_1.default)();
                        if (!customLoadDictionary)
                            return [2 /*return*/, undefined];
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, customLoadDictionary(locale)];
                    case 2:
                        result = _d.sent();
                        if (result)
                            return [2 /*return*/, result];
                        return [3 /*break*/, 4];
                    case 3:
                        _a = _d.sent();
                        return [3 /*break*/, 4];
                    case 4:
                        languageCode = (_c = (0, generaltranslation_1.getLocaleProperties)(locale)) === null || _c === void 0 ? void 0 : _c.languageCode;
                        if (!languageCode || languageCode === locale)
                            return [2 /*return*/, result];
                        _d.label = 5;
                    case 5:
                        _d.trys.push([5, 7, , 8]);
                        return [4 /*yield*/, customLoadDictionary(languageCode)];
                    case 6:
                        result = _d.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        _b = _d.sent();
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/, result];
                }
            });
        });
    };
    // ---------- DICTIONARY MANIPULATION HELPERS ---------- //
    /**
     * Get a subset of a dictionary.
     * Prefix must map to type Dictionary, not DictionaryEntry.
     * @param {FlattenedDictionary} dictionary - The dictionary to subset.
     * @param {string} prefixId - The prefix id of a parent dictionary entry.
     * @returns {FlattenedDictionary} The subset of the original dictionary.
     */
    DictionaryManager.prototype._getDictionarySubset = function (dictionary, prefixId) {
        // Check if this is a dictionary entry
        if (dictionary[prefixId]) {
            throw new Error((0, createErrors_1.createDictionarySubsetError)(prefixId));
        }
        // Filter by prefix
        var subset = Object.fromEntries(Object.entries(dictionary).filter(function (_a) {
            var key = _a[0];
            return key.startsWith(prefixId);
        }));
        return subset;
    };
    return DictionaryManager;
}());
exports.DictionaryManager = DictionaryManager;
exports.dictionaryManager = new DictionaryManager();
exports.default = exports.dictionaryManager;
//# sourceMappingURL=DictionaryManager.js.map