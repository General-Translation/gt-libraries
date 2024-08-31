#!/usr/bin/env node

import path from 'path';
import React from 'react';
import { program } from 'commander';
import { flattenDictionary, writeChildrenAsObjects, addGTIdentifier } from 'gt-react';
import GT, { getLanguageName, isValidLanguageCode, getLanguageCode } from 'generaltranslation';
import fs from 'fs';

require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local', override: true });

require('ts-node').register({
    transpileOnly: true, // You can set this to false if you want type checking
    extensions: ['.ts', '.tsx'],
});

function loadConfigFile(configFilePath: string): object {
    const absoluteConfigFilePath = path.resolve(configFilePath);
    if (fs.existsSync(absoluteConfigFilePath)) {
        try {
            return require(absoluteConfigFilePath);
        } catch (error) {
            console.error('Failed to load the config file:', error);
            process.exit(1);
        }
    } else {
        throw new Error(`Config file not found: ${absoluteConfigFilePath}`);
    }
}

/**
 * Apply the configuration to Babel based on the loaded config file.
 * @param {object} config - The loaded configuration object.
 */
function applyConfigToBabel(config: any) {
    const babelConfig: Record<string, any> = {
        presets: [
            ['@babel/preset-react', { runtime: 'automatic' }],
            '@babel/preset-env',
            '@babel/preset-typescript'
        ],
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        ignore: [/(node_modules)/],
    };

    if (config.compilerOptions) {
        console.log('Compiler options found in config:', config.compilerOptions);

        if (config.compilerOptions.paths) {
            const moduleResolver = require.resolve('babel-plugin-module-resolver');
            const aliases: any = {};

            console.log('Found path aliases:', config.compilerOptions.paths);

            for (const [key, value] of Object.entries(config.compilerOptions.paths)) {
                if (Array.isArray(value) && typeof value[0] === 'string') {
                    const resolvedPath = path.resolve(process.cwd(), value[0].replace('/*', ''));
                    aliases[key.replace('/*', '')] = resolvedPath;
                    console.log(`Resolved alias '${key}' to '${resolvedPath}'`);
                }
            }

            babelConfig.plugins = babelConfig.plugins || [];
            babelConfig.plugins.push([
                moduleResolver,
                { 
                    alias: aliases,
                    resolvePath(sourcePath: string, currentFile: string, opts: any) {
                        console.log(`Resolving path for: ${sourcePath}`);

                        // Check if the sourcePath matches any of the aliases manually
                        for (const [aliasKey, aliasPath] of Object.entries(aliases)) {
                            if (sourcePath.startsWith(`${aliasKey}/`)) {
                                // Replace the alias with the resolved path
                                const resolvedPath = path.resolve(aliasPath as string, sourcePath.slice(aliasKey.length + 1));
                                console.log(`Resolved path using alias '${aliasKey}/' to: ${resolvedPath}`);

                                const extensions = ['.js', '.jsx', '.ts', '.tsx'];

                                function resolveWithExtensions(basePath: string): string | null {
                                    for (const ext of extensions) {
                                        const fullPath = `${basePath}${ext}`;
                                        try {
                                            const realPath = fs.realpathSync(fullPath); // Resolve symlink if necessary
                                            console.log(`Resolved symlink for: ${fullPath} to ${realPath}`);
                                            return realPath;
                                        } catch (_) {
                                            continue;       
                                        }
                                    }
                                    return null;
                                }

                                try {
                                    const realPath = fs.realpathSync(resolvedPath); // Try without an extension first
                                    console.log(`Resolved symlink for: ${resolvedPath} to ${realPath}`);
                                    return realPath;
                                } catch (err) {
        // Check if the path has an extension
                                    const hasExtension = extensions.some(ext => resolvedPath.endsWith(ext));
                                    if (!hasExtension) {
                                        const resolvedWithExt = resolveWithExtensions(resolvedPath);
                                        if (resolvedWithExt) {
                                            return resolvedWithExt;
                                        }
                                    }

                                    throw new Error(`Unable to resolve path: ${resolvedPath}`);
                                }
                            }
                        }

                        return null; // Default resolution
                    }
                }
            ]);
        }
    } else {
        console.log('No compilerOptions found in the config.');
    }

    require('@babel/register')(babelConfig);
}


/**
 * Process the dictionary file and send updates to General Translation services.
 * @param {string} dictionaryFilePath - The path to the dictionary file.
 * @param {object} options - The options for processing the dictionary file.
 */
async function processDictionaryFile(dictionaryFilePath: string, options: {
    apiKey?: string,
    projectID?: string,
    dictionaryName?: string,
    defaultLanguage?: string,
    languages?: string[],
    override?: boolean
}) {
    const absoluteDictionaryFilePath = path.resolve(dictionaryFilePath);

    let dictionary;
    try {
        const module = require(absoluteDictionaryFilePath);
        console.log(module);
        dictionary = module.default || module;
    } catch (error) {
        console.error('Failed to load the dictionary file:', error);
        process.exit(1);
    }

    dictionary = flattenDictionary(dictionary);

    const apiKey = options.apiKey || process.env.GT_API_KEY;
    const projectID = options.projectID || process.env.GT_PROJECT_ID;
    const dictionaryName = options.dictionaryName;
    const defaultLanguage = options.defaultLanguage;
    const languages = (options.languages || [])
        .map(language => isValidLanguageCode(language) ? language : getLanguageCode(language))
        .filter(language => language ? true : false);
    const override = options.override ? true : false;
    if (!(apiKey && projectID)) {
        throw new Error('GT_API_KEY and GT_PROJECT_ID environment variables or provided arguments are required.');
    }

    let templateUpdates: any = [];
    for (const key in dictionary) {
        let entry = dictionary[key];
        let metadata: { id: string, dictionaryName?: string, defaultLanguage?: string } = { id: key, dictionaryName };
        if (defaultLanguage) {
            metadata.defaultLanguage = defaultLanguage;
        }
        let props: { [key: string]: any } = {};
        if (Array.isArray(entry)) {
            if (typeof entry[1] === 'object') {
                props = entry[1];
            }
            entry = entry[0];
        }
        if (React.isValidElement(entry)) {
            let wrappedEntry;
            const { singular, plural, dual, zero, one, two, few, many, other, ranges, ...tMetadata } = props;
            const pluralProps = Object.fromEntries(
                Object.entries({ singular, plural, dual, zero, one, two, few, many, other, ranges }).filter(([_, value]) => value !== undefined)
            );
            if (Object.keys(pluralProps).length) {
                const Plural = (pluralProps: any) => React.createElement(React.Fragment, pluralProps, entry);
                (Plural as any).gtTransformation = 'plural';
                wrappedEntry = React.createElement(Plural, pluralProps, entry);
            } else {
                wrappedEntry = React.createElement(React.Fragment, null, entry);
            };
            const entryAsObjects = writeChildrenAsObjects(addGTIdentifier(wrappedEntry)); // simulate gt-react's t() function
            templateUpdates.push({
                type: "react",
                data: {
                    children: entryAsObjects,
                    metadata: { ...metadata, ...tMetadata }
                }
            });
        } else if (typeof entry === 'string') {
            templateUpdates.push({
                type: "intl",
                data: {
                    content: entry,
                    metadata: { ...metadata, ...props }
                }
            });
        }
    }

    if (templateUpdates.length) {
        console.log('Items in dictionary:', templateUpdates.length)
        const gt = new GT({ apiKey, projectID });
        const sendUpdates = async () => {
            const resultLanguages = await gt.updateRemoteDictionary(templateUpdates, languages, projectID, override);
            if (resultLanguages) {
                console.log(
                    `Remote dictionary updated: ${resultLanguages.length ? true : false}.`,
                    (`Languages: ${resultLanguages.length ? `[${resultLanguages.map(language => `"${getLanguageName(language)}"`).join(', ')}]` + '.' : 'None.'}`),
                    resultLanguages.length ? 'Translations are usually live within a minute.' : '',
                );
            } else {
                throw new Error('500: Internal Server Error.');
            }
            process.exit(0);
        };
        sendUpdates();
    }

    setTimeout(() => {
        process.exit(0);
    }, 4000);
}

/**
 * Resolve the file path from the given file path or default paths.
 * @param {string} filePath - The file path to resolve.
 * @param {string[]} defaultPaths - The default paths to check.
 * @returns {string} - The resolved file path.
 */
function resolveFilePath(filePath: string, defaultPaths: string[]): string {
    if (filePath) {
        return filePath;
    }

    for (const possiblePath of defaultPaths) {
        if (fs.existsSync(possiblePath)) {
            return possiblePath;
        }
    }

    throw new Error('File not found in default locations.');
}

program
    .name('update')
    .description('Process React dictionary files and send translations to General Translation services')
    .version('1.0.0')
    .argument('[dictionaryFilePath]', 'Path to the dictionary file')
    .option('--apiKey <apiKey>', 'Specify your GT API key')
    .option('--projectID <projectID>', 'Specify your GT project ID')
    .option('--dictionaryName <name>', 'Optionally specify a dictionary name for metadata purposes')
    .option('--languages <languages...>', 'List of target languages for translation')
    .option('--override', 'Override existing translations')
    .option('--defaultLanguage <defaultLanguage>', 'Specify a default language code or name for metadata purposes')
    .option('--config <configFilePath>', 'Specify a path to a tsconfig.json or jsconfig.json file')
    .action((dictionaryFilePath: string, options: {
        apiKey?: string,
        projectID?: string,
        dictionaryName?: string,
        defaultLanguage?: string,
        languages?: string[],
        override?: boolean,
        config?: string
    }) => {
        // Resolve the config file path or check default locations
        const resolvedConfigFilePath = resolveFilePath(options.config || '', [
            './tsconfig.json',
            './jsconfig.json',
        ]);

        // Load and apply the configuration to Babel
        const config = loadConfigFile(resolvedConfigFilePath);

        applyConfigToBabel(config);

        const resolvedDictionaryFilePath = resolveFilePath(dictionaryFilePath, [
            './dictionary.js',
            './dictionary.jsx',
            './dictionary.ts',
            './dictionary.tsx',
            './src/dictionary.js',
            './src/dictionary.jsx',
            './src/dictionary.ts',
            './src/dictionary.tsx'
        ]);
        processDictionaryFile(resolvedDictionaryFilePath, options);
    });

program.parse();