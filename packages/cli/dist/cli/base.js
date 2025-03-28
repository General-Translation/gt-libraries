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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseCLI = void 0;
const commander_1 = require("commander");
const console_1 = require("../console/console");
const console_2 = require("../console/console");
const setupConfig_1 = __importDefault(require("../fs/config/setupConfig"));
const prompts_1 = require("@inquirer/prompts");
const generaltranslation_1 = require("generaltranslation");
const findFilepath_1 = __importDefault(require("../fs/findFilepath"));
const errors_1 = require("../console/errors");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const utils_1 = require("../fs/utils");
const generateSettings_1 = require("../config/generateSettings");
const chalk_1 = __importDefault(require("chalk"));
const internal_1 = require("generaltranslation/internal");
const translate_1 = require("../formats/files/translate");
class BaseCLI {
    // Constructor is shared amongst all CLI class types
    constructor(library, additionalModules) {
        this.library = library;
        this.additionalModules = additionalModules || [];
        this.setupInitCommand();
    }
    // Init is never called in a child class
    init() {
        this.setupGTCommand();
    }
    // Execute is called by the main program
    execute() {
        commander_1.program.parse();
    }
    setupGTCommand() {
        commander_1.program
            .command('translate')
            .description('Translate your project using General Translation')
            .option('-c, --config <path>', 'Filepath to config file, by default gt.config.json', (0, findFilepath_1.default)(['gt.config.json']))
            .option('--api-key <key>', 'API key for General Translation cloud service')
            .option('--project-id <id>', 'Project ID for the translation service', (0, utils_1.resolveProjectId)())
            .option('--default-language, --default-locale <locale>', 'Default locale (e.g., en)')
            .option('--new, --locales <locales...>', 'Space-separated list of locales (e.g., en fr es)')
            .action((options) => __awaiter(this, void 0, void 0, function* () {
            (0, console_1.displayAsciiTitle)();
            (0, console_2.displayInitializingText)();
            const settings = (0, generateSettings_1.generateSettings)(options);
            yield this.handleGenericTranslate(settings);
        }));
    }
    handleGenericTranslate(settings) {
        return __awaiter(this, void 0, void 0, function* () {
            // Validate required settings are present
            if (!settings.locales) {
                console.error(errors_1.noLocalesError);
                process.exit(1);
            }
            if (!settings.defaultLocale) {
                console.error(errors_1.noDefaultLocaleError);
                process.exit(1);
            }
            if (!settings.files) {
                console.error(errors_1.noFilesError);
                process.exit(1);
            }
            if (!settings.apiKey) {
                console.error(errors_1.noApiKeyError);
                process.exit(1);
            }
            if (!settings.projectId) {
                console.error(errors_1.noProjectIdError);
                process.exit(1);
            }
            // dataFormat for JSONs
            let dataFormat;
            if (this.library === 'next-intl') {
                dataFormat = 'ICU';
            }
            else if (this.library === 'i18next') {
                if (this.additionalModules.includes('i18next-icu')) {
                    dataFormat = 'ICU';
                }
                else {
                    dataFormat = 'I18NEXT';
                }
            }
            else {
                dataFormat = 'JSX';
            }
            const { resolvedPaths: sourceFiles, placeholderPaths, transformPaths, } = settings.files;
            // Process all file types at once with a single call
            yield (0, translate_1.translateFiles)(sourceFiles, placeholderPaths, transformPaths, dataFormat, settings);
        });
    }
    setupInitCommand() {
        commander_1.program
            .command('init')
            .description('Initialize project for General Translation')
            .action(() => __awaiter(this, void 0, void 0, function* () {
            (0, console_1.displayAsciiTitle)();
            (0, console_2.displayInitializingText)();
            // Ask for the default locale
            const defaultLocale = yield (0, prompts_1.input)({
                message: 'What is the default locale for your project?',
                default: internal_1.libraryDefaultLocale,
            });
            // Ask for the locales
            const locales = yield (0, prompts_1.input)({
                message: `What locales would you like to translate using General Translation? ${chalk_1.default.gray('(space-separated list)')}`,
                validate: (input) => {
                    const locales = input.split(' ');
                    if (locales.length === 0) {
                        return 'Please enter at least one locale';
                    }
                    for (const locale of locales) {
                        if (!(0, generaltranslation_1.isValidLocale)(locale)) {
                            return 'Please enter a valid locale (e.g., en, fr, es)';
                        }
                    }
                    return true;
                },
            });
            // Ask where the translations are stored
            const location = yield (0, prompts_1.select)({
                message: `Where are your language files stored? ${chalk_1.default.gray('(remote or local)')}`,
                choices: [
                    { value: 'remote', name: 'Remote' },
                    { value: 'local', name: 'Local' },
                ],
                default: 'remote',
            });
            let configFilepath = 'gt.config.json';
            if (fs_1.default.existsSync('gt.config.json')) {
                configFilepath = 'gt.config.json';
            }
            else if (fs_1.default.existsSync('src/gt.config.json')) {
                configFilepath = 'src/gt.config.json';
            }
            if (location === 'remote') {
                // Create gt.config.json
                (0, setupConfig_1.default)(configFilepath, {
                    defaultLocale,
                    locales: locales.split(' '),
                });
                return;
            }
            // Ask where the translations are stored
            const translationsDir = yield (0, prompts_1.input)({
                message: 'What is the path to the directory containing your language files?',
            });
            const thirdPartyLibrary = this.library !== 'gt-next' && this.library !== 'gt-react';
            // Ask if using another i18n library
            const i18nLibrary = thirdPartyLibrary
                ? yield (0, prompts_1.select)({
                    message: `Are you using a 3rd-party i18n library? ${chalk_1.default.gray(`(Auto-detected: ${this.library === 'base' ? 'none' : this.library})`)}`,
                    choices: [
                        { value: true, name: 'Yes' },
                        { value: false, name: 'No' },
                    ],
                    default: true,
                })
                : false;
            if (i18nLibrary) {
                const dataFormat = yield (0, prompts_1.select)({
                    message: 'What is the format of your language files?',
                    choices: ['json'],
                    default: 'json',
                });
                // combine translationsDir and dataFormat into something like
                // translationsDir/[locale].json
                const translationsDirWithFormat = path_1.default.join(translationsDir, `[locale].${dataFormat}`);
                // Create gt.config.json
                (0, setupConfig_1.default)(configFilepath, {
                    defaultLocale,
                    locales: locales.split(' '),
                    files: {
                        json: {
                            include: [translationsDirWithFormat],
                        },
                    },
                });
            }
            else {
                const translationsDirWithFormat = path_1.default.join(translationsDir, `[locale].json`);
                // Create gt.config.json
                (0, setupConfig_1.default)('gt.config.json', {
                    defaultLocale,
                    locales: locales.split(' '),
                    files: {
                        gt: {
                            output: translationsDirWithFormat,
                        },
                    },
                });
            }
        }));
    }
}
exports.BaseCLI = BaseCLI;
