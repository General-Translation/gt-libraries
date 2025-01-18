"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.default = GTProvider;
var jsx_runtime_1 = require("react/jsx-runtime");
var internal_1 = require("gt-react/internal");
var getI18NConfig_1 = __importDefault(require("../config/getI18NConfig"));
var getLocale_1 = __importDefault(require("../request/getLocale"));
var getMetadata_1 = __importDefault(require("../request/getMetadata"));
var generaltranslation_1 = require("generaltranslation");
var getDictionary_1 = __importStar(require("../dictionary/getDictionary"));
var ClientProvider_1 = __importDefault(require("./ClientProvider"));
var createErrors_1 = require("../errors/createErrors");
/**
 * Provides General Translation context to its children, which can then access `useGT`, `useLocale`, and `useDefaultLocale`.
 *
 * @param {React.ReactNode} children - The children components that will use the translation context.
 * @param {string} id - ID of a nested dictionary, so that only a subset of a large dictionary needs to be sent to the client.
 *
 * @returns {JSX.Element} The provider component for General Translation context.
 */
function GTProvider(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var getId, I18NConfig, locale, additionalMetadata, defaultLocale, renderSettings, regionalTranslationRequired, translationRequired, translationsPromise, dictionarySubset, dictionaryEntries, dictionary, translations, existingTranslations, _c;
        var _this = this;
        var children = _b.children, id = _b.id;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    getId = function (suffix) {
                        return id ? "".concat(id, ".").concat(suffix) : suffix;
                    };
                    I18NConfig = (0, getI18NConfig_1.default)();
                    return [4 /*yield*/, (0, getLocale_1.default)()];
                case 1:
                    locale = _d.sent();
                    return [4 /*yield*/, (0, getMetadata_1.default)()];
                case 2:
                    additionalMetadata = _d.sent();
                    defaultLocale = I18NConfig.getDefaultLocale();
                    renderSettings = I18NConfig.getRenderSettings();
                    regionalTranslationRequired = I18NConfig.requiresRegionalTranslation(locale);
                    translationRequired = I18NConfig.requiresTranslation(locale) || regionalTranslationRequired;
                    if (translationRequired)
                        translationsPromise = I18NConfig.getTranslations(locale);
                    dictionarySubset = (id ? (0, getDictionary_1.getDictionaryEntry)(id) : (0, getDictionary_1.default)()) || {};
                    if (typeof dictionarySubset !== 'object' || Array.isArray(dictionarySubset))
                        throw new Error((0, createErrors_1.createDictionarySubsetError)(id !== null && id !== void 0 ? id : '', "<GTProvider>"));
                    dictionaryEntries = (0, internal_1.flattenDictionary)(dictionarySubset);
                    dictionary = {};
                    translations = {};
                    if (!(translationsPromise)) return [3 /*break*/, 4];
                    return [4 /*yield*/, translationsPromise];
                case 3:
                    _c = _d.sent();
                    return [3 /*break*/, 5];
                case 4:
                    _c = {};
                    _d.label = 5;
                case 5:
                    existingTranslations = _c;
                    // Check and standardize flattened dictionary entries before passing them to the client
                    return [4 /*yield*/, Promise.all(Object.entries(dictionaryEntries !== null && dictionaryEntries !== void 0 ? dictionaryEntries : {}).map(function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
                            var entryId, _c, entry, metadata, taggedEntry, contentArray, _d, _, hash_1, translation_1, translationPromise_1, _e, entryAsObjects, hash, translation, translationPromise;
                            var _f, _g;
                            var suffix = _b[0], dictionaryEntry = _b[1];
                            return __generator(this, function (_h) {
                                entryId = getId(suffix);
                                _c = (0, internal_1.extractEntryMetadata)(dictionaryEntry), entry = _c.entry, metadata = _c.metadata;
                                if (typeof entry === 'undefined')
                                    return [2 /*return*/];
                                taggedEntry = I18NConfig.addGTIdentifier(entry, entryId);
                                // If no translation is required, return
                                if (!translationRequired)
                                    return [2 /*return*/, dictionary[entryId] = [taggedEntry, __assign({}, metadata)]];
                                // ---- POPULATING TRANSLATIONS ---- //
                                // STRINGS
                                if (typeof taggedEntry === 'string') {
                                    contentArray = (0, generaltranslation_1.splitStringToContent)(taggedEntry);
                                    _d = I18NConfig.serializeAndHash(contentArray, metadata === null || metadata === void 0 ? void 0 : metadata.context, entryId), _ = _d[0], hash_1 = _d[1];
                                    dictionary[entryId] = [taggedEntry, __assign(__assign({}, metadata), { hash: hash_1 })];
                                    translation_1 = existingTranslations === null || existingTranslations === void 0 ? void 0 : existingTranslations[entryId];
                                    if (translation_1 === null || translation_1 === void 0 ? void 0 : translation_1[hash_1])
                                        return [2 /*return*/, (translations[entryId] = (_f = {}, _f[hash_1] = translation_1[hash_1], _f))];
                                    translationPromise_1 = I18NConfig.translateContent({
                                        source: contentArray,
                                        targetLocale: locale,
                                        options: __assign(__assign({ id: entryId, hash: hash_1 }, additionalMetadata), ((metadata === null || metadata === void 0 ? void 0 : metadata.context) && { context: metadata.context })),
                                    });
                                    return [2 /*return*/, translations[entryId] = {
                                            promise: translationPromise_1,
                                            hash: hash_1,
                                            type: 'content'
                                        }];
                                }
                                _e = I18NConfig.serializeAndHash(taggedEntry, metadata === null || metadata === void 0 ? void 0 : metadata.context, entryId), entryAsObjects = _e[0], hash = _e[1];
                                dictionary[entryId] = [taggedEntry, __assign(__assign({}, metadata), { hash: hash })];
                                translation = existingTranslations === null || existingTranslations === void 0 ? void 0 : existingTranslations[entryId];
                                if (translation === null || translation === void 0 ? void 0 : translation[hash])
                                    return [2 /*return*/, (translations[entryId] = (_g = {}, _g[hash] = translation[hash], _g))];
                                translationPromise = I18NConfig.translateChildren({
                                    source: entryAsObjects,
                                    targetLocale: locale,
                                    metadata: __assign(__assign(__assign({ id: entryId, hash: hash }, ((metadata === null || metadata === void 0 ? void 0 : metadata.context) && { context: metadata.context })), additionalMetadata), (renderSettings.timeout && { timeout: renderSettings.timeout })),
                                });
                                return [2 /*return*/, (translations[entryId] = {
                                        promise: translationPromise,
                                        hash: hash,
                                        type: 'jsx',
                                    })];
                            });
                        }); }))];
                case 6:
                    // Check and standardize flattened dictionary entries before passing them to the client
                    _d.sent();
                    return [2 /*return*/, ((0, jsx_runtime_1.jsx)(ClientProvider_1.default, __assign({ dictionary: dictionary, initialTranslations: __assign(__assign({}, existingTranslations), translations), locale: locale, defaultLocale: defaultLocale, translationRequired: translationRequired, regionalTranslationRequired: regionalTranslationRequired, requiredPrefix: id, renderSettings: I18NConfig.getRenderSettings() }, I18NConfig.getClientSideConfig(), { children: children })))];
            }
        });
    });
}
//# sourceMappingURL=GTProvider.js.map