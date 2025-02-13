import path from 'path';
import fs from 'fs';
import { NextConfig } from 'next';
import defaultInitGTProps from './config/props/defaultInitGTProps';
import InitGTProps from './config/props/InitGTProps';
import {
  APIKeyMissingError,
  createMissingCustomTranslationLoadedError,
  createUnsupportedLocalesWarning,
  devApiKeyIncludedInProductionError,
  projectIdMissingWarn,
} from './errors/createErrors';
import { getSupportedLocale } from '@generaltranslation/supported-locales';
import { ContextReplacementPlugin } from 'webpack';

/**
 * Initializes General Translation settings for a Next.js application.
 *
 * Use it in `next.config.js` to enable GT translation functionality as a plugin.
 *
 * @example
 * // In next.config.mjs
 * import { initGT } from 'gt-next/config';
 *
 * const withGT = initGT({
 *   projectId: 'abc-123',
 *   locales: ['en', 'es', 'fr'],
 *   defaultLocale: 'en'
 * });
 *
 * export default withGT({})
 *
 * @param {string|undefined} config - Optional config filepath (defaults to './gt.config.json'). If a file is found, it will be parsed for GT config variables.
 * @param {string|undefined} i18n - Optional i18n configuration file path. If a string is provided, it will be used as a path.
 * @param {string|undefined} dictionary - Optional dictionary configuration file path. If a string is provided, it will be used as a path.
 * @param {string} [apiKey=defaultInitGTProps.apiKey] - API key for the GeneralTranslation service. Required if using the default GT base URL.
 * @param {string} [devApiKey=defaultInitGTProps.devApiKey] - API key for dev environment only.
 * @param {string} [projectId=defaultInitGTProps.projectId] - Project ID for the GeneralTranslation service. Required for most functionality.
 * @param {string} [runtimeUrl=defaultInitGTProps.runtimeUrl] - The base URL for the GT API. Set to an empty string to disable automatic translations.
 * @param {string} [cacheUrl=defaultInitGTProps.cacheUrl] - The URL for cached translations.
 * @param {number} [cacheExpiryTime=defaultInitGTProps.cacheExpiryTime] - How long to cache translations in memory (milliseconds).
 * @param {boolean} [runtimeTranslation=defaultInitGTProps.runtimeTranslation] - Whether to enable runtime translation.
 * @param {string|undefined} [translationLoaderType=defaultInitGTProps.translationLoaderType] - The type of translation loader to use. Values: 'remote' | 'custom' | 'disabled'. Default is remote.
 * @param {string[]|undefined} - Whether to use local translations.
 * @param {string[]} [locales=defaultInitGTProps.locales] - List of supported locales for the application.
 * @param {string} [defaultLocale=defaultInitGTProps.defaultLocale] - The default locale to use if none is specified.
 * @param {object} [renderSettings=defaultInitGTProps.renderSettings] - Render settings for how translations should be handled.
 * @param {number} [maxConcurrentRequests=defaultInitGTProps.maxConcurrentRequests] - Maximum number of concurrent requests allowed.
 * @param {number} [maxBatchSize=defaultInitGTProps.maxBatchSize] - Maximum translation requests in the same batch.
 * @param {number} [batchInterval=defaultInitGTProps.batchInterval] - The interval in milliseconds between batched translation requests.
 * @param {object} metadata - Additional metadata that can be passed for extended configuration.
 *
 * @returns {function(NextConfig): NextConfig} - A function that accepts a Next.js config object and returns an updated config with GT settings applied.
 *
 * @throws {Error} If the project ID is missing and default URLs are used, or if the API key is required and missing.
 *
 */
export function initGT(props: InitGTProps = {}) {
  // ---------- LOAD GT CONFIG FILE ---------- //
  let loadedConfig: Partial<InitGTProps> = {};
  const configPath = props.config || defaultInitGTProps.config;
  try {
    if (typeof configPath === 'string' && fs.existsSync(configPath)) {
      const fileContent = fs.readFileSync(configPath, 'utf-8');
      loadedConfig = JSON.parse(fileContent);
    }
  } catch (error) {
    console.error('Error reading GT config file:', error);
  }

  // ---------- LOAD ENVIRONMENT VARIABLES ---------- //

  // resolve project ID
  const projectId: string | undefined = process.env.GT_PROJECT_ID;

  // resolve API keys
  const envApiKey: string | undefined = process.env.GT_API_KEY;
  let apiKey, devApiKey;
  if (envApiKey) {
    const apiKeyType = envApiKey?.split('-')?.[1];
    if (apiKeyType === 'api') {
      apiKey = envApiKey;
    } else if (apiKeyType === 'dev') {
      devApiKey = envApiKey;
    }
  }

  // conditionally add environment variables to config
  const envConfig: Partial<InitGTProps> = {
    ...(projectId ? { projectId } : {}),
    ...(apiKey ? { apiKey } : {}),
    ...(devApiKey ? { devApiKey } : {}),
  };

  // ---------- MERGE CONFIGS ---------- //

  // precedence: input > env > config file > defaults
  const mergedConfig: InitGTProps = {
    ...defaultInitGTProps,
    ...loadedConfig,
    ...envConfig,
    ...props,
  };

  // ----------- LOCALE STANDARDIZATION ----------- //
  if (mergedConfig.locales && mergedConfig.defaultLocale) {
    mergedConfig.locales.unshift(mergedConfig.defaultLocale);
  }
  mergedConfig.locales = Array.from(new Set(mergedConfig.locales));

  // ----------- RESOLVE ANY CONFIG/TX FILES ----------- //

  // Resolve custom locale getter functions
  const resolvedI18NFilePath =
    typeof mergedConfig.i18n === 'string'
      ? mergedConfig.i18n
      : resolveConfigFilepath('i18n');

  // Resolve dictionary filepath
  const resolvedDictionaryFilePath =
    typeof mergedConfig.dictionary === 'string'
      ? mergedConfig.dictionary
      : resolveConfigFilepath('dictionary');

  // Resolve custom translation loader path
  const customTranslationLoaderPath =
    typeof mergedConfig.translationLoaderPath === 'string'
      ? mergedConfig.translationLoaderPath
      : resolveConfigFilepath('loadTranslation');

  // Resolve local translations directory
  const resolvedLocalTranslationDir =
    typeof mergedConfig.localTranslationsDir === 'string'
      ? mergedConfig.localTranslationsDir
      : './public/_gt';

  // Check for local translations and get the list of locales
  let localLocales: string[] = [];
  if (
    fs.existsSync(resolvedLocalTranslationDir) &&
    fs.statSync(resolvedLocalTranslationDir).isDirectory()
  ) {
    localLocales = fs
      .readdirSync(resolvedLocalTranslationDir)
      .filter((file) => file.endsWith('.json'))
      .map((file) => file.replace('.json', ''));
  }
  // ---------- ERROR CHECKS ---------- //

  // Check: local translations are enabled, but no custom translation loader is found
  // for now, we can just check if that file exists, and then assume the existance of the loaders
  if (
    localLocales.length &&
    !(
      customTranslationLoaderPath &&
      fs.existsSync(path.resolve(customTranslationLoaderPath))
    )
  ) {
    throw new Error(
      createMissingCustomTranslationLoadedError(customTranslationLoaderPath)
    );
  }
  const localTranslationsEnabled = localLocales.length > 0;

  // Check: projectId is not required for remote infrastructure, but warn if missing for dev, nothing for prod
  if (
    !localTranslationsEnabled &&
    !mergedConfig.projectId &&
    process.env.NODE_ENV === 'development'
  ) {
    console.warn(projectIdMissingWarn);
  }

  // Check: dev API key should not be included in production
  if (process.env.NODE_ENV === 'production' && mergedConfig.devApiKey) {
    throw new Error(devApiKeyIncludedInProductionError);
  }

  // Check: An API key is required for runtime translation
  if (
    mergedConfig.projectId && // must have projectId for this check to matter anyways
    mergedConfig.runtimeUrl &&
    !(mergedConfig.apiKey || mergedConfig.devApiKey) &&
    process.env.NODE_ENV === 'development'
  ) {
    console.error(APIKeyMissingError);
  }

  // Check: if using GT infrastructure, warn about unsupported locales
  if (
    mergedConfig.runtimeUrl === defaultInitGTProps.runtimeUrl ||
    (mergedConfig.cacheUrl === defaultInitGTProps.cacheUrl &&
      !localTranslationsEnabled)
  ) {
    const warningLocales = (
      mergedConfig.locales || defaultInitGTProps.locales
    ).filter((locale) => !getSupportedLocale(locale));
    if (warningLocales.length) {
      console.warn(createUnsupportedLocalesWarning(warningLocales));
    }
  }

  // ---------- STORE CONFIGURATIONS ---------- //

  // Store the resolved paths in the environment
  const I18NConfigParams = JSON.stringify(mergedConfig);
  return (nextConfig: any = {}): any => {
    return {
      ...nextConfig,
      env: {
        ...nextConfig.env,
        _GENERALTRANSLATION_I18N_CONFIG_PARAMS: I18NConfigParams,
      },
      webpack: function webpack(
        ...[webpackConfig, options]: Parameters<
          NonNullable<NextConfig['webpack']>
        >
      ) {
        if (resolvedI18NFilePath) {
          webpackConfig.resolve.alias['gt-next/_request'] = path.resolve(
            webpackConfig.context,
            resolvedI18NFilePath
          );
        }
        if (resolvedDictionaryFilePath) {
          webpackConfig.resolve.alias['gt-next/_dictionary'] = path.resolve(
            webpackConfig.context,
            resolvedDictionaryFilePath
          );
        }
        if (customTranslationLoaderPath) {
          webpackConfig.resolve.alias[`gt-next/_translationLoader`] =
            path.resolve(webpackConfig.context, customTranslationLoaderPath);
        }
        if (typeof nextConfig?.webpack === 'function') {
          return nextConfig.webpack(webpackConfig, options);
        }
        return webpackConfig;
      },
    };
  };
}

/**
 * Resolves a configuration filepath for i18n or dictionary files.
 *
 * @param {string} fileName - The base name of the config file to look for.
 * @param {string} [cwd] - An optional current working directory path.
 * @returns {string|undefined} - The path if found; otherwise undefined.
 */
function resolveConfigFilepath(
  fileName: string,
  cwd?: string
): string | undefined {
  function resolvePath(pathname: string) {
    const parts = [];
    if (cwd) parts.push(cwd);
    parts.push(pathname);
    return path.resolve(...parts);
  }

  function pathExists(pathname: string) {
    return fs.existsSync(resolvePath(pathname));
  }

  // Check for file existence in the root and src directories with supported extensions
  for (const candidate of [
    ...withExtensions(`./${fileName}`),
    ...withExtensions(`./src/${fileName}`),
  ]) {
    if (pathExists(candidate)) {
      return candidate;
    }
  }

  // Return undefined if no file is found
  return undefined;
}

/**
 * Helper function to handle multiple extensions.
 *
 * @param {string} localPath - The local path to which extensions will be appended.
 * @returns {string[]} - Array of possible paths with supported TypeScript/JavaScript extensions.
 */
function withExtensions(localPath: string) {
  return [
    `${localPath}.ts`,
    `${localPath}.tsx`,
    `${localPath}.js`,
    `${localPath}.jsx`,
  ];
}
