import { FilesOptions } from '../../types';
/**
 * Checks if the config file exists.
 * If yes, make sure make sure projectId is correct
 * If not, creates a new JSON file at the given filepath and writes the provided config object to it.
 * @param {string} configFilepath - The path to the config file.
 * @param {Record<string, any>} configObject - The config object to write if the file does not exist.
 */
export default function createOrUpdateConfig(configFilepath: string, options: {
    projectId?: string;
    defaultLocale?: string;
    locales?: string[];
    files?: FilesOptions;
}): string;
