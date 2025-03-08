// packages/gt-cli-core/src/BaseCLI.ts
import { program } from 'commander';
import {
  Options,
  SetupOptions,
  SupportedFrameworks,
  Updates,
  WrapOptions,
  GenerateSourceOptions,
} from '../types';
import {
  displayAsciiTitle,
  displayInitializingText,
  displayLoadingAnimation,
  displayProjectId,
} from '../console/console';
import loadJSON from '../fs/loadJSON';
import findFilepath, {
  findFile,
  findFileInDir,
  findFilepaths,
} from '../fs/findFilepath';
import loadConfig from '../fs/config/loadConfig';
import createESBuildConfig from '../react/config/createESBuildConfig';
import { isValidLocale } from 'generaltranslation';
import { warnApiKeyInConfig } from '../console/warnings';
import { noSourceFileError, noTranslationsError } from '../console/errors';
import { defaultBaseUrl } from 'generaltranslation/internal';
import chalk from 'chalk';
import { select } from '@inquirer/prompts';
import { waitForUpdates } from '../api/waitForUpdates';
import updateConfig from '../fs/config/updateConfig';
import createConfig from '../fs/config/setupConfig';
import { detectFormatter, formatFiles } from '../hooks/postProcess';
import { fetchTranslations } from '../api/fetchTranslations';
import path from 'path';
import { BaseCLI } from './base';
import scanForContent from '../react/parse/scanForContent';
import createDictionaryUpdates from '../react/parse/createDictionaryUpdates';
import createInlineUpdates from '../react/parse/createInlineUpdates';
import { resolveProjectId } from '../fs/utils';
import { sendUpdates } from '../api/sendUpdates';
import { saveTranslations } from '../formats/gt/save';
import { generateSettings } from '../config/generateSettings';
import { saveJSON } from '../fs/saveJSON';
const DEFAULT_TIMEOUT = 600;
const pkg = 'gt-react';
export class ReactCLI extends BaseCLI {
  constructor() {
    super('gt-react');
  }
  public init() {
    this.setupTranslateCommand();
    this.setupSetupCommand();
    this.setupScanCommand();
    this.setupGenerateSourceCommand();
  }
  public execute() {
    super.execute();
  }

  protected scanForContent(
    options: WrapOptions,
    framework: SupportedFrameworks
  ): Promise<{ errors: string[]; filesUpdated: string[]; warnings: string[] }> {
    return scanForContent(options, pkg, framework);
  }

  protected createDictionaryUpdates(
    options: Options & { dictionary: string },
    esbuildConfig: any
  ): Promise<Updates> {
    return createDictionaryUpdates(options, esbuildConfig);
  }

  protected createInlineUpdates(
    options: Options
  ): Promise<{ updates: Updates; errors: string[] }> {
    return createInlineUpdates(options, pkg);
  }

  protected setupTranslateCommand(): void {
    program
      .command('translate')
      .description(
        'Scans the project for a dictionary and/or <T> tags, and updates the General Translation remote dictionary with the latest content.'
      )
      .option(
        '--config <path>',
        'Filepath to config file, by default gt.config.json',
        findFilepath(['gt.config.json'])
      )
      .option(
        '--api-key <key>',
        'API key for General Translation cloud service'
      )
      .option(
        '--project-id <id>',
        'Project ID for the translation service',
        resolveProjectId()
      )
      .option('--version-id <id>', 'Version ID for the translation service')
      .option(
        '--tsconfig, --jsconfig <path>',
        'Path to jsconfig or tsconfig file',
        findFilepath(['./tsconfig.json', './jsconfig.json'])
      )
      .option('--dictionary <path>', 'Path to dictionary file')
      .option(
        '--src <paths...>',
        "Filepath to directory containing the app's source code, by default ./src || ./app || ./pages || ./components",
        findFilepaths(['./src', './app', './pages', './components'])
      )
      .option(
        '--default-language, --default-locale <locale>',
        'Default locale (e.g., en)'
      )
      .option(
        '--new, --locales <locales...>',
        'Space-separated list of locales (e.g., en fr es)'
      )
      .option(
        '--inline',
        'Include inline <T> tags in addition to dictionary file',
        true
      )
      .option(
        '--ignore-errors',
        'Ignore errors encountered while scanning for <T> tags',
        false
      )
      .option(
        '--dry-run',
        'Dry run, does not send updates to General Translation API',
        false
      )
      .option(
        '--no-wait',
        'Do not wait for the updates to be deployed to the CDN before exiting',
        true // Default value of options.wait
      )
      .option(
        '--no-publish',
        'Do not publish updates to the CDN.',
        true // Default value of options.publish
      )
      .option(
        '-t, --translations-dir, --translation-dir <path>',
        'Path to directory where translations will be saved. If this flag is not provided, translations will not be saved locally.'
      )
      .option(
        '--timeout <seconds>',
        'Timeout in seconds for waiting for updates to be deployed to the CDN',
        DEFAULT_TIMEOUT.toString()
      )
      .action((options: Options) => this.handleTranslateCommand(options));
  }

  protected setupGenerateSourceCommand(): void {
    program
      .command('generate')
      .description(
        'Generate a translation file for the source locale. The -t flag must be provided. This command should be used if you are handling your own translations.'
      )
      .option(
        '--src <paths...>',
        "Filepath to directory containing the app's source code, by default ./src || ./app || ./pages || ./components",
        findFilepaths(['./src', './app', './pages', './components'])
      )
      .option(
        '--tsconfig, --jsconfig <path>',
        'Path to jsconfig or tsconfig file',
        findFilepath(['./tsconfig.json', './jsconfig.json'])
      )
      .option('--dictionary <path>', 'Path to dictionary file')
      .option(
        '--default-language, --default-locale <locale>',
        'Source locale (e.g., en)',
        'en'
      )
      .option(
        '--inline',
        'Include inline <T> tags in addition to dictionary file',
        true
      )
      .option(
        '--ignore-errors',
        'Ignore errors encountered while scanning for <T> tags',
        false
      )
      .option(
        '-t, --translations-dir, --translation-dir <path>',
        'Path to directory where translations will be saved. If this flag is not provided, translations will not be saved locally.'
      )
      .action((options: GenerateSourceOptions) =>
        this.handleGenerateSourceCommand(options)
      );
  }

  protected setupSetupCommand(): void {
    program
      .command('setup')
      .description(
        'Scans the project and wraps all JSX elements in the src directory with a <T> tag, with unique ids'
      )
      .option(
        '--src <paths...>',
        "Filepath to directory containing the app's source code, by default ./src || ./app || ./pages || ./components",
        findFilepaths(['./src', './app', './pages', './components'])
      )
      .option(
        '--config <path>',
        'Filepath to config file, by default gt.config.json',
        findFilepath(['gt.config.json'])
      )
      .action((options: SetupOptions) => this.handleSetupCommand(options));
  }

  protected setupScanCommand(): void {
    program
      .command('scan')
      .description(
        'Scans the project and wraps all JSX elements in the src directory with a <T> tag, with unique ids'
      )
      .option(
        '--src <paths...>',
        "Filepath to directory containing the app's source code, by default ./src || ./app || ./pages || ./components",
        findFilepaths(['./src', './app', './pages', './components'])
      )
      .option(
        '--config <path>',
        'Filepath to config file, by default gt.config.json',
        findFilepath(['gt.config.json'])
      )
      .option('--disable-ids', 'Disable id generation for the <T> tags', false)
      .option(
        '--disable-formatting',
        'Disable formatting of edited files',
        false
      )
      .action((options: WrapOptions) => this.handleScanCommand(options));
  }

  protected async handleGenerateSourceCommand(
    options: GenerateSourceOptions
  ): Promise<void> {
    displayAsciiTitle();
    displayInitializingText();

    const settings = generateSettings(options);

    options = { ...options, ...settings };

    if (!options.dictionary) {
      options.dictionary = findFilepath([
        './dictionary.js',
        './src/dictionary.js',
        './dictionary.json',
        './src/dictionary.json',
        './dictionary.ts',
        './src/dictionary.ts',
      ]);
    }

    const { updates, errors } = await this.createUpdates(options);

    if (errors.length > 0) {
      if (options.ignoreErrors) {
        console.log(
          chalk.red(
            `CLI tool encountered errors while scanning for ${chalk.green(
              '<T>'
            )} tags.\n`
          )
        );
        console.log(
          errors
            .map((error) => chalk.yellow('• Warning: ') + error + '\n')
            .join(''),
          chalk.white(
            `These ${chalk.green('<T>')} components will not be translated.\n`
          )
        );
      } else {
        console.log(
          chalk.red(
            `CLI tool encountered errors while scanning for ${chalk.green(
              '<T>'
            )} tags.\n`
          )
        );
        console.log(
          chalk.gray('To ignore these errors, re-run with --ignore-errors\n\n'),
          errors.map((error) => chalk.red('• Error: ') + error + '\n').join('')
        );
        process.exit(1);
      }
    }
    // Convert updates to the proper data format
    const newData: Record<string, any> = {};
    for (const update of updates) {
      const { source, metadata } = update;
      const { hash } = metadata;
      newData[hash] = source;
    }

    // Save source file if translationsDir exists
    if (settings.translationsDir) {
      console.log();
      saveJSON(
        path.join(settings.translationsDir, `${settings.defaultLocale}.json`),
        newData
      );
      console.log(chalk.green('Source file saved successfully!\n'));
      // Also save translations (after merging with existing translations)
      for (const locale of settings.locales) {
        const existingTranslations = loadJSON(
          path.join(settings.translationsDir, `${locale}.json`)
        );
        const mergedTranslations = {
          ...newData,
          ...existingTranslations,
        };
        // Filter out only keys that exist in newData
        const filteredTranslations = Object.fromEntries(
          Object.entries(mergedTranslations).filter(([key]) => newData[key])
        );
        saveJSON(
          path.join(settings.translationsDir, `${locale}.json`),
          filteredTranslations
        );
      }
      console.log(chalk.green('Merged translations successfully!\n'));
    }
  }

  protected async handleScanCommand(options: WrapOptions): Promise<void> {
    displayAsciiTitle();
    displayInitializingText();

    // Ask user for confirmation using inquirer
    const answer = await select({
      message: chalk.yellow(
        '⚠️  Warning: This operation will modify your source files!\n   Make sure you have committed or stashed your current changes.\n\n   Do you want to continue?'
      ),
      choices: [
        { value: true, name: 'Yes' },
        { value: false, name: 'No' },
      ],
      default: true,
    });

    if (!answer) {
      console.log(chalk.gray('\nOperation cancelled.'));
      process.exit(0);
    }

    // ----- Create a starter gt.config.json file -----
    generateSettings(options);

    // ----- //

    // Wrap all JSX elements in the src directory with a <T> tag, with unique ids
    const { errors, filesUpdated, warnings } = await this.scanForContent(
      options,
      'react'
    );

    if (errors.length > 0) {
      console.log(chalk.red('\n✗ Failed to write files:\n'));
      console.log(errors.join('\n'));
    }

    // Format updated files if formatters are available
    if (!options.disableFormatting) await formatFiles(filesUpdated);

    console.log(
      chalk.green(
        `\n✓ Success! Added <T> tags and updated ${chalk.bold(
          filesUpdated.length
        )} files:\n`
      )
    );
    if (filesUpdated.length > 0) {
      console.log(
        filesUpdated.map((file) => `${chalk.green('-')} ${file}`).join('\n')
      );
      console.log();
      console.log(chalk.green('Please verify the changes before committing.'));
    }

    if (warnings.length > 0) {
      console.log(chalk.yellow('\n⚠️  Warnings encountered:'));
      console.log(
        warnings.map((warning) => `${chalk.yellow('-')} ${warning}`).join('\n')
      );
    }
  }

  protected async handleSetupCommand(options: SetupOptions): Promise<void> {
    displayAsciiTitle();
    displayInitializingText();

    // Ask user for confirmation using inquirer
    const answer = await select({
      message: chalk.yellow(
        `This operation will prepare your project for internationalization.
        Make sure you have committed or stashed any changes.
        Do you want to continue?`
      ),
      choices: [
        { value: true, name: 'Yes' },
        { value: false, name: 'No' },
      ],
      default: true,
    });

    if (!answer) {
      console.log(chalk.gray('\nOperation cancelled.'));
      process.exit(0);
    }

    const frameworkType = await select({
      message: 'What framework are you using?',
      choices: [
        { value: 'next', name: chalk.blue('Next.js') },
        { value: 'vite', name: chalk.green('Vite') },
        { value: 'gatsby', name: chalk.magenta('Gatsby') },
        { value: 'react', name: chalk.yellow('React') },
        { value: 'redwood', name: chalk.red('RedwoodJS') },
        { value: 'other', name: chalk.gray('Other') },
      ],
      default: 'next',
    });
    let addGTProvider = false;
    if (frameworkType === 'next') {
      const routerType = await select({
        message: 'Are you using the App router or the Pages router?',
        choices: [
          { value: 'pages', name: 'Pages Router' },
          { value: 'app', name: 'App Router' },
        ],
        default: 'pages',
      });
      if (routerType === 'app') {
        console.log(
          chalk.red(
            '\nPlease use gt-next and gt-next-cli instead. gt-react should not be used with the App router.'
          )
        );
        process.exit(0);
      }
      addGTProvider = await select({
        message:
          'Do you want the setup tool to automatically add the GTProvider component?',
        choices: [
          { value: true, name: 'Yes' },
          { value: false, name: 'No' },
        ],
        default: true,
      });
    } else if (frameworkType === 'other') {
      console.log(
        chalk.red(
          `\nSorry, at the moment we currently do not support other React frameworks. 
            Please let us know what you would like to see supported at https://github.com/General-Translation/gt-libraries/issues`
        )
      );
      process.exit(0);
    }
    const selectedFramework: SupportedFrameworks =
      frameworkType === 'next' ? 'next-pages' : 'next-app';

    const includeTId = await select({
      message: 'Do you want to include an unique id for each <T> tag?',
      choices: [
        { value: true, name: 'Yes' },
        { value: false, name: 'No' },
      ],
      default: true,
    });

    // ----- Create a starter gt.config.json file -----
    generateSettings(options);

    // ----- //

    const mergeOptions = {
      ...options,
      disableIds: !includeTId,
      disableFormatting: true,
      addGTProvider,
    };

    // Wrap all JSX elements in the src directory with a <T> tag, with unique ids
    const { errors, filesUpdated, warnings } = await this.scanForContent(
      mergeOptions,
      selectedFramework
    );

    if (errors.length > 0) {
      console.log(chalk.red('\n✗ Failed to write files:\n'));
      console.log(errors.join('\n'));
    }

    console.log(
      chalk.green(
        `\nSuccess! Added <T> tags and updated ${chalk.bold(
          filesUpdated.length
        )} files:\n`
      )
    );
    if (filesUpdated.length > 0) {
      console.log(
        filesUpdated.map((file) => `${chalk.green('-')} ${file}`).join('\n')
      );
      console.log();
      console.log(chalk.green('Please verify the changes before committing.'));
    }

    if (warnings.length > 0) {
      console.log(chalk.yellow('\nWarnings encountered:'));
      console.log(
        warnings.map((warning) => `${chalk.yellow('-')} ${warning}`).join('\n')
      );
    }
    // Stage only the modified files
    // const { execSync } = require('child_process');
    // for (const file of filesUpdated) {
    //   await execSync(`git add "${file}"`);
    // }

    const formatter = await detectFormatter();

    if (!formatter || filesUpdated.length === 0) {
      return;
    }

    const applyFormatting = await select({
      message: `Would you like to auto-format the modified files? ${chalk.gray(
        `(${formatter})`
      )}`,
      choices: [
        { value: true, name: 'Yes' },
        { value: false, name: 'No' },
      ],
      default: true,
    });
    // Format updated files if formatters are available
    if (applyFormatting) await formatFiles(filesUpdated, formatter);
  }

  protected async handleTranslateCommand(initOptions: Options): Promise<void> {
    displayAsciiTitle();
    displayInitializingText();

    const settings = generateSettings(initOptions);

    // only for typing purposes
    const options = { ...initOptions, ...settings };

    if (!options.dictionary) {
      options.dictionary = findFilepath([
        './dictionary.js',
        './src/dictionary.js',
        './dictionary.json',
        './src/dictionary.json',
        './dictionary.ts',
        './src/dictionary.ts',
      ]);
    }
    // Separate defaultLocale from locales
    options.locales = options.locales.filter(
      (locale) => locale !== options.defaultLocale
    );

    // validate timeout
    const timeout = parseInt(options.timeout);
    if (isNaN(timeout) || timeout < 0) {
      throw new Error(
        `Invalid timeout: ${options.timeout}. Must be a positive integer.`
      );
    }
    options.timeout = timeout.toString();
    // ---- CREATING UPDATES ---- //
    const { updates, errors } = await this.createUpdates(options);

    if (errors.length > 0) {
      if (options.ignoreErrors) {
        console.log(
          chalk.red(
            `CLI tool encountered errors while scanning for ${chalk.green(
              '<T>'
            )} tags.\n`
          )
        );
        console.log(
          errors
            .map((error) => chalk.yellow('• Warning: ') + error + '\n')
            .join(''),
          chalk.white(
            `These ${chalk.green('<T>')} components will not be translated.\n`
          )
        );
      } else {
        console.log(
          chalk.red(
            `CLI tool encountered errors while scanning for ${chalk.green(
              '<T>'
            )} tags.\n`
          )
        );
        console.log(
          chalk.gray('To ignore these errors, re-run with --ignore-errors\n\n'),
          errors.map((error) => chalk.red('• Error: ') + error + '\n').join('')
        );
        process.exit(1);
      }
    }

    if (options.dryRun) {
      process.exit(0);
    }

    // Send updates to General Translation API
    if (updates.length) {
      // Error if no API key at this point
      if (!settings.apiKey)
        throw new Error(
          'No General Translation API key found. Use the --api-key flag to provide one.'
        );
      // Error if no projectId at this point
      if (!settings.projectId)
        throw new Error(
          'No General Translation Project ID found. Use the --project-id flag to provide one.'
        );

      const updateResponse = await sendUpdates(updates, {
        ...settings,
        publish: initOptions.publish,
        wait: initOptions.wait,
        timeout: initOptions.timeout,
        dataFormat: 'JSX',
      });
      const versionId = updateResponse?.versionId;

      // Save translations to local directory if translationsDir is provided
      if (versionId && settings.translationsDir) {
        console.log();
        const translations = await fetchTranslations(
          settings.baseUrl,
          settings.apiKey,
          versionId
        );
        saveTranslations(translations, settings.translationsDir, 'JSX', 'json');
      }
    } else {
      throw new Error(noTranslationsError);
    }
  }

  protected async createUpdates(
    options: Options | GenerateSourceOptions
  ): Promise<{ updates: Updates; errors: string[] }> {
    let updates: Updates = [];
    let errors: string[] = [];

    // Parse dictionary with esbuildConfig
    if (options.dictionary) {
      let esbuildConfig;
      if (options.jsconfig) {
        const jsconfig = loadJSON(options.jsconfig);
        if (!jsconfig)
          throw new Error(
            `Failed to resolve jsconfig.json or tsconfig.json at provided filepath: "${options.jsconfig}"`
          );
        esbuildConfig = createESBuildConfig(jsconfig);
      } else {
        esbuildConfig = createESBuildConfig({});
      }
      updates = [
        ...updates,
        ...(await this.createDictionaryUpdates(options as any, esbuildConfig)),
      ];
    } else if (options.defaultLocale && options.translationsDir) {
      // If options.dictionary is not provided, additionally check if the
      // {defaultLocale}.json file exists in the translationsDir, and use that as a source
      // instead
      const sourceFile = findFileInDir(
        options.translationsDir,
        `${options.defaultLocale}.json`
      );
      if (sourceFile) {
        options.dictionary = sourceFile;
        updates = [
          ...updates,
          ...(await this.createDictionaryUpdates(
            options as any,
            createESBuildConfig({})
          )),
        ];
      }
    }
    // Scan through project for <T> tags
    if (options.inline) {
      const { updates: newUpdates, errors: newErrors } =
        await this.createInlineUpdates(options as any);
      errors = [...errors, ...newErrors];
      updates = [...updates, ...newUpdates];
    }

    // Metadata addition and validation
    const idHashMap = new Map<string, string>();
    const duplicateIds = new Set<string>();

    updates = updates.map((update) => {
      if (!update.metadata.id) return update;
      const existingHash = idHashMap.get(update.metadata.id);
      if (existingHash) {
        if (existingHash !== update.metadata.hash) {
          errors.push(
            `Hashes don't match on two components with the same id: ${chalk.blue(
              update.metadata.id
            )}. Check your ${chalk.green(
              '<T>'
            )} tags and dictionary entries and make sure you're not accidentally duplicating IDs.`
          );
          duplicateIds.add(update.metadata.id);
        }
      } else {
        idHashMap.set(update.metadata.id, update.metadata.hash);
      }
      return update;
    });

    // Filter out updates with duplicate IDs
    updates = updates.filter((update) => !duplicateIds.has(update.metadata.id));
    return { updates, errors };
  }
}
