#!/usr/bin/env node

import path from 'path';
import React from 'react';
import { program } from 'commander';
import { flattenDictionary, writeChildrenAsObjects, addGTIdentifier, calculateHash } from 'gt-react';
import GT, { getLanguageName, isValidLanguageCode, getLanguageCode } from 'generaltranslation';
import fs from 'fs';
import esbuild from 'esbuild';
import os from 'os'
import { extractI18nConfig } from './extractI18NConfig';

require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local', override: true });

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



function applyConfigToEsbuild(config: any) {
    const esbuildOptions: esbuild.BuildOptions = {
        bundle: true,
        format: 'cjs',
        platform: 'node',
        target: 'es2021',
        loader: {
            '.js': 'jsx',
            '.jsx': 'jsx',
            '.ts': 'ts',
            '.tsx': 'tsx',
        },
        sourcemap: 'inline',
        external: ['server-only'],
        define: {
            'React': 'global.React'
        },
        plugins: []
    };

    // Add the custom plugin to handle 'server-only' imports
    // Add the custom plugin to handle 'server-only' imports
// Add the custom plugin to handle 'server-only' imports
(esbuildOptions.plugins as any).push({
    name: 'ignore-server-only',
    setup(build: any) {
        build.onResolve({ filter: /^server-only$/ }, () => {
            return {
                path: 'server-only', // This can be a virtual module name
                namespace: 'ignore-server-only',
            };
        });

        build.onLoad({ filter: /^server-only$/, namespace: 'ignore-server-only' }, () => {
            return {
                contents: 'module.exports = {};', // Stubbing out the content
                loader: 'js',
            };
        });
    },
});


    if (config.compilerOptions) {
        // console.log('Compiler options found in config:', config.compilerOptions);

        if (config.compilerOptions.paths) {
            const aliases: any = {};

            // console.log('Found path aliases:', config.compilerOptions.paths);

            for (const [key, value] of Object.entries(config.compilerOptions.paths)) {
                if (Array.isArray(value) && typeof value[0] === 'string') {
                    const resolvedPath = path.resolve(process.cwd(), value[0].replace('/*', ''));
                    aliases[key.replace('/*', '')] = resolvedPath;
                    console.log(`Resolved alias '${key}' to '${resolvedPath}'`);
                }
            }

            esbuildOptions.plugins = esbuildOptions.plugins || [];

            esbuildOptions.plugins.push({
                name: 'alias',
                setup(build) {
                    build.onResolve({ filter: /.*/ }, args => {
                        for (const [aliasKey, aliasPath] of Object.entries(aliases)) {
                            if (args.path.startsWith(`${aliasKey}/`)) {
                                const resolvedPath = path.resolve(aliasPath as string, args.path.slice(aliasKey.length + 1));

                                const extensions = ['.js', '.jsx', '.ts', '.tsx'];

                                function resolveWithExtensions(basePath: string): string | null {
                                    for (const ext of extensions) {
                                        const fullPath = `${basePath}${ext}`;
                                        try {
                                            const realPath = fs.realpathSync(fullPath); // Resolve symlink if necessary
                                            // console.log(`Resolved symlink for: ${fullPath} to ${realPath}`);
                                            return realPath;
                                        } catch (_) {
                                            continue;
                                        }
                                    }
                                    return null;
                                }

                                try {
                                    const realPath = fs.realpathSync(resolvedPath); // Try without an extension first
                                    // console.log(`Resolved symlink for: ${resolvedPath} to ${realPath}`);
                                    return { path: realPath };
                                } catch (err) {
                                    // Check if the path has an extension
                                    const hasExtension = extensions.some(ext => resolvedPath.endsWith(ext));
                                    if (!hasExtension) {
                                        const resolvedWithExt = resolveWithExtensions(resolvedPath);
                                        if (resolvedWithExt) {
                                            return { path: resolvedWithExt };
                                        }
                                    }

                                    throw new Error(`Unable to resolve path: ${resolvedPath}`);
                                }
                            }
                        }
                    });
                },
            });
        }
    } else {
        console.log('No compilerOptions found in the config.');
    }

    return esbuildOptions;
}



/**
 * Process the dictionary file and send updates to General Translation services.
 * @param {string} dictionaryFilePath - The path to the dictionary file.
 * @param {object} options - The options for processing the dictionary file.
 */
async function processDictionaryFile(dictionaryFilePath: string, i18nFilePath:string, options: {
    apiKey?: string,
    projectID?: string,
    dictionaryName?: string,
    defaultLanguage?: string,
    languages?: string[],
    override?: boolean,
    config?: any 
    description?: string;
}) {

    const absoluteDictionaryFilePath = path.resolve(dictionaryFilePath);

    // Bundle and transpile the dictionary file using esbuild
    const esbuildOptions = applyConfigToEsbuild(options.config || {});
    const result = await esbuild.build({
        ...esbuildOptions,
        entryPoints: [absoluteDictionaryFilePath],
        write: false,
    });

    // Evaluate the bundled code to get the dictionary module
    // Write the bundled code to a temporary file
    const bundledCode = result.outputFiles[0].text;
    const tempFilePath = path.join(os.tmpdir(), 'bundled-dictionary.js');
    fs.writeFileSync(tempFilePath, bundledCode);

    global.React = React;

    // Load the module using require
    let dictionaryModule;
    try {
        dictionaryModule = require(tempFilePath);
    } catch (error) {
        console.error('Failed to load the bundled dictionary code:', error);
        process.exit(1);
    } finally {
        // Clean up the temporary file
        fs.unlinkSync(tempFilePath);
    }

    const dictionary = flattenDictionary(dictionaryModule.default || dictionaryModule);

    // READ i18n.js, and extract the JSON object within the first call to createGT()
    // e.g. createGT({ defaultLocale: 'en-US' }) would return { "defaultLocale": "en-US" }

    const i18nConfig = extractI18nConfig(i18nFilePath);
    options = { ...i18nConfig, ...options };

    const apiKey = options.apiKey || process.env.GT_API_KEY;
    const projectID = options.projectID || process.env.GT_PROJECT_ID;
    const dictionaryName = options.dictionaryName;
    const defaultLanguage = options.defaultLanguage;
    const languages = (options.languages || [])
        .map(language => isValidLanguageCode(language) ? language : getLanguageCode(language))
        .filter(language => language ? true : false);
    const override = options.override ? true : false;
    const description = options.description;
    if (!(apiKey && projectID)) {
        throw new Error('GT_API_KEY and GT_PROJECT_ID environment variables or provided arguments are required.');
    }

    let templateUpdates: any = [];
    for (const id in dictionary) {
        let entry = dictionary[id];
        let metadata: Record<string, any> = { id, dictionaryName };
        if (defaultLanguage) {
            metadata.defaultLanguage = defaultLanguage;
        }
        if (description) {
            metadata.description = description;
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
            const hash = await calculateHash(tMetadata.context ? [entryAsObjects, tMetadata.context] : entryAsObjects);
            console.log(id, '=>', JSON.stringify(entryAsObjects), '=>', hash)
            tMetadata.hash = hash;
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
                    resultLanguages.length ? 'Translations are usually live within a minute. Check status: www.generaltranslation.com/dashboard.' : '',
                );
            } else {
                throw new Error('500: Internal Server Error.');
            }
        };
        await sendUpdates();
    }

    process.exit(0);
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
    .name('i18n')
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
    .option('--i18n <i18nFilePath>', 'Specify a path to an i18n.js configuration file. Used to automatically set projectID, defaultLanguage (from defaultLocale), languages (from approvedLocales), and dictionaryName', '')
    .option('--description <description>', 'Describe your project. Used to assist translation.', '')
    .action((dictionaryFilePath: string, options: {
        apiKey?: string,
        projectID?: string,
        dictionaryName?: string,
        defaultLanguage?: string,
        languages?: string[],
        override?: boolean,
        config?: string
        i18n?: string;
        description?: string;
    }) => {
        // Resolve the config file path or check default locations
        const resolvedConfigFilePath = resolveFilePath(options.config || '', [
            './tsconfig.json',
            './jsconfig.json',
        ]);

        // Load and apply the configuration to esbuild
        const config = loadConfigFile(resolvedConfigFilePath);

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

        const resolvedI18NFilePath = resolveFilePath(options.i18n || '', [
            './i18n.js',
            './i18n.jsx',
            './i18n.ts',
            './i18n.tsx',
            './src/i18n.js',
            './src/i18n.jsx',
            './src/i18n.ts',
            './src/i18n.tsx'
        ]);

        processDictionaryFile(resolvedDictionaryFilePath, resolvedI18NFilePath, { ...options, config });
    });

program.parse();