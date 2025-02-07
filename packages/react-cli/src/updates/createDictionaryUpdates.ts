import React from 'react';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { build, BuildOptions } from 'esbuild';
import { Options, Updates } from '../types';
import {
  addGTIdentifier,
  extractEntryMetadata,
  flattenDictionary,
  writeChildrenAsObjects,
} from 'gt-react/internal';
import { splitStringToContent } from 'generaltranslation';
import loadJSON from '../fs/loadJSON';
import { hashJsxChildren } from 'generaltranslation/id';

export default async function createDictionaryUpdates(
  options: Options & { dictionary: string },
  esbuildConfig: BuildOptions
): Promise<Updates> {
  let dictionary;

  // ---- HANDLE JSON STRING DICTIONARY ----- //

  if (options.dictionary.endsWith('.json')) {
    dictionary = flattenDictionary(loadJSON(options.dictionary) || {});
  }

  // ----- HANDLE REACT DICTIONARY ---- //
  else {
    const result = await build({
      ...esbuildConfig,
      entryPoints: [options.dictionary],
      write: false,
    });

    const bundledCode = result.outputFiles[0].text;
    const tempFilePath = path.join(os.tmpdir(), 'bundled-dictionary.js');
    fs.writeFileSync(tempFilePath, bundledCode);

    globalThis.React = React;

    // Load the module using require
    let dictionaryModule;
    try {
      dictionaryModule = require(tempFilePath);
    } catch (error) {
      console.error(`Failed to load the bundled dictionary code:`, error);
      process.exit(1);
    } finally {
      // Clean up the temporary file
      fs.unlinkSync(tempFilePath);
    }
    dictionary = flattenDictionary(
      dictionaryModule.default ||
        dictionaryModule.dictionary ||
        dictionaryModule
    );
  }

  if (!Object.keys(dictionary).length)
    throw new Error(
      `Dictionary filepath provided: "${options.dictionary}", but no entries found.`
    );

  // ----- CREATE PARTIAL UPDATES ----- //

  let updates: Updates = [];

  for (const id of Object.keys(dictionary)) {
    let {
      entry,
      metadata: props, // context, etc.
    } = extractEntryMetadata(dictionary[id]);
    const taggedEntry = addGTIdentifier(entry);

    const entryAsObjects = writeChildrenAsObjects(taggedEntry);
    const context = props?.context;

    if (typeof entry === 'string') {
      const metadata: Record<string, any> = {
        id,
        ...(context && { context }),
        hash: hashJsxChildren({
          source: splitStringToContent(entry),
          ...(context && { context }),
        }),
      };
      updates.push({
        type: 'content',
        source: splitStringToContent(entry),
        metadata,
      });
    } else {
      const metadata: Record<string, any> = {
        id,
        ...(context && { context }),
        hash: hashJsxChildren({
          source: entryAsObjects,
          ...(context && { context }),
        }),
      };
      updates.push({
        type: 'jsx',
        source: entryAsObjects,
        metadata,
      });
    }
  }

  return updates;
}
