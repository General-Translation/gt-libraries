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
exports.BaseCLI = exports.NextCLI = void 0;
exports.default = main;
const gt_react_cli_1 = require("gt-react-cli");
Object.defineProperty(exports, "BaseCLI", { enumerable: true, get: function () { return gt_react_cli_1.BaseCLI; } });
const console_1 = require("gt-react-cli/console/console");
const chalk_1 = __importDefault(require("chalk"));
const prompts_1 = require("@inquirer/prompts");
const setupConfig_1 = __importDefault(require("gt-react-cli/fs/config/setupConfig"));
const postProcess_1 = require("gt-react-cli/hooks/postProcess");
const findFilepath_1 = __importDefault(require("gt-react-cli/fs/findFilepath"));
const nextScanForContent_1 = __importDefault(require("./next/nextScanForContent"));
const createDictionaryUpdates_1 = __importDefault(require("gt-react-cli/updates/createDictionaryUpdates"));
const createInlineUpdates_1 = __importDefault(require("gt-react-cli/updates/createInlineUpdates"));
const handleInitGT_1 = __importDefault(require("./next/handleInitGT"));
const pkg = 'gt-next';
class NextCLI extends gt_react_cli_1.BaseCLI {
    constructor() {
        super();
    }
    scanForContent(options, framework) {
        return (0, nextScanForContent_1.default)(options, pkg, framework);
    }
    createDictionaryUpdates(options, esbuildConfig) {
        return (0, createDictionaryUpdates_1.default)(options, esbuildConfig);
    }
    createInlineUpdates(options) {
        return (0, createInlineUpdates_1.default)(options, pkg);
    }
    handleSetupCommand(options) {
        return __awaiter(this, void 0, void 0, function* () {
            (0, console_1.displayAsciiTitle)();
            (0, console_1.displayInitializingText)();
            // Ask user for confirmation using inquirer
            const answer = yield (0, prompts_1.select)({
                message: chalk_1.default.yellow(`This operation will prepare your project for internationalization.
        Make sure you have committed or stashed any changes.
        Do you want to continue?`),
                choices: [
                    { value: true, name: 'Yes' },
                    { value: false, name: 'No' },
                ],
                default: true,
            });
            if (!answer) {
                console.log(chalk_1.default.gray('\nOperation cancelled.'));
                process.exit(0);
            }
            const routerType = yield (0, prompts_1.select)({
                message: 'Are you using the Next.js App router or the Pages router?',
                choices: [
                    { value: 'app', name: 'App Router' },
                    { value: 'pages', name: 'Pages Router' },
                ],
                default: 'app',
            });
            if (routerType === 'pages') {
                console.log(chalk_1.default.red('\nPlease use gt-react and gt-react-cli instead. gt-next is currently not supported for the Pages router.'));
                process.exit(0);
            }
            const addGTProvider = yield (0, prompts_1.select)({
                message: 'Do you want the setup tool to automatically add the GTProvider component?',
                choices: [
                    { value: true, name: 'Yes' },
                    { value: false, name: 'No' },
                ],
                default: true,
            });
            // Check if they have a next.config.js file
            const nextConfigPath = (0, findFilepath_1.default)([
                './next.config.js',
                './next.config.ts',
                './next.config.mjs',
                './next.config.mts',
            ]);
            if (!nextConfigPath) {
                console.log(chalk_1.default.red('No next.config.js file found.'));
                process.exit(0);
            }
            const addWithGTConfig = yield (0, prompts_1.select)({
                message: `Do you want to automatically add withGTConfig() to your ${nextConfigPath}?`,
                choices: [
                    { value: true, name: 'Yes' },
                    { value: false, name: 'No' },
                ],
                default: true,
            });
            const includeTId = yield (0, prompts_1.select)({
                message: 'Do you want to include an unique id for each <T> tag?',
                choices: [
                    { value: true, name: 'Yes' },
                    { value: false, name: 'No' },
                ],
                default: true,
            });
            // ----- Create a starter gt.config.json file -----
            if (!options.config)
                (0, setupConfig_1.default)('gt.config.json', process.env.GT_PROJECT_ID, '');
            // ----- //
            const mergeOptions = Object.assign(Object.assign({}, options), { disableIds: !includeTId, disableFormatting: true, addGTProvider });
            // Wrap all JSX elements in the src directory with a <T> tag, with unique ids
            const { errors, filesUpdated, warnings } = yield this.scanForContent(mergeOptions, 'next-app');
            if (addWithGTConfig) {
                // Add the withGTConfig() function to the next.config.js file
                const { errors: initGTErrors, filesUpdated: initGTFilesUpdated } = yield (0, handleInitGT_1.default)(nextConfigPath);
                // merge errors and files
                errors.push(...initGTErrors);
                filesUpdated.push(...initGTFilesUpdated);
            }
            if (errors.length > 0) {
                console.log(chalk_1.default.red('\n✗ Failed to write files:\n'));
                console.log(errors.join('\n'));
            }
            console.log(chalk_1.default.green(`\nSuccess! Added <T> tags and updated ${chalk_1.default.bold(filesUpdated.length)} files:\n`));
            if (filesUpdated.length > 0) {
                console.log(filesUpdated.map((file) => `${chalk_1.default.green('-')} ${file}`).join('\n'));
                console.log();
                console.log(chalk_1.default.green('Please verify the changes before committing.'));
            }
            if (warnings.length > 0) {
                console.log(chalk_1.default.yellow('\nWarnings encountered:'));
                console.log(warnings.map((warning) => `${chalk_1.default.yellow('-')} ${warning}`).join('\n'));
            }
            // Stage only the modified files
            // const { execSync } = require('child_process');
            // for (const file of filesUpdated) {
            //   await execSync(`git add "${file}"`);
            // }
            const formatter = yield (0, postProcess_1.detectFormatter)();
            if (!formatter || filesUpdated.length === 0) {
                return;
            }
            const applyFormatting = yield (0, prompts_1.select)({
                message: `Would you like to auto-format the modified files? ${chalk_1.default.gray(`(${formatter})`)}`,
                choices: [
                    { value: true, name: 'Yes' },
                    { value: false, name: 'No' },
                ],
                default: true,
            });
            // Format updated files if formatters are available
            if (applyFormatting)
                yield (0, postProcess_1.formatFiles)(filesUpdated, formatter);
        });
    }
}
exports.NextCLI = NextCLI;
function main() {
    const cli = new NextCLI();
    cli.initialize();
}
