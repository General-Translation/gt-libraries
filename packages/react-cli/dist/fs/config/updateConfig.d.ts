/**
 * Update the config file version id, locales, and projectId (if necessary)
 * @param {Record<string, any>} configObject - The config object to write if the file does not exist.
 */
export default function updateConfig(configFilepath: string, projectId?: string, _versionId?: string): void;
