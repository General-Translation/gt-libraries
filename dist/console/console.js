"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.displayCreatingNewConfigFile = exports.displayFoundTMessage = exports.displayResolvedPaths = exports.displayProjectId = exports.displayInitializingText = exports.displayAsciiTitle = void 0;
const chalk_1 = __importDefault(require("chalk"));
const displayAsciiTitle = () => console.log('\n\n' +
    chalk_1.default.cyan(`  ,ad8888ba,  888888888888  
 d8"'    \`"8b      88       
d8'                88       
88                 88       
88      88888      88       
Y8,        88      88       
 Y8a.    .a88      88       
  \`"Y88888P"       88       \n\n`));
exports.displayAsciiTitle = displayAsciiTitle;
const displayInitializingText = () => {
    console.log(chalk_1.default.bold.blue('General Translation, Inc.') +
        chalk_1.default.gray('\nhttps://generaltranslation.com/docs') +
        '\n');
};
exports.displayInitializingText = displayInitializingText;
const displayProjectId = (projectId) => {
    console.log(chalk_1.default.yellow(`Project ID: ${chalk_1.default.bold(projectId)}\n`));
};
exports.displayProjectId = displayProjectId;
const displayResolvedPaths = (resolvedPaths) => {
    console.log(chalk_1.default.blue.bold('Resolving path aliases:'));
    console.log(resolvedPaths
        .map(([key, resolvedPath]) => chalk_1.default.gray(`'${chalk_1.default.white(key)}' -> '${chalk_1.default.green(resolvedPath)}'`))
        .join('\n'));
    console.log();
};
exports.displayResolvedPaths = displayResolvedPaths;
const displayFoundTMessage = (file, id) => {
    console.log(`Found ${chalk_1.default.cyan('<T>')} component in ${chalk_1.default.green(file)} with id "${chalk_1.default.yellow(id)}"`);
};
exports.displayFoundTMessage = displayFoundTMessage;
const displayCreatingNewConfigFile = (configFilepath) => {
    console.log(chalk_1.default.blue(`Creating new config file as ${chalk_1.default.green(configFilepath)}\n`));
};
exports.displayCreatingNewConfigFile = displayCreatingNewConfigFile;
