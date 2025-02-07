import fs from 'fs';
import path from 'path';
import { Options, Updates, WrapOptions } from '../types';
import * as t from '@babel/types';
import { parse } from '@babel/parser';
import traverse, { NodePath } from '@babel/traverse';
import generate from '@babel/generator';
import * as babel from '@babel/types';
import { getFiles } from '../fs/findJsxFilepath';
import { isMeaningful } from '../jsx/evaluateJsx';
import { handleJsxElement } from '../jsx/wrapJsx';
import { getRelativePath } from '../fs/findFilepath';
import {
  determineModuleType,
  generateImportMap,
  createImports,
} from '../jsx/parse/parseAst';

const IMPORT_MAP = {
  T: { name: 'T', source: 'gt-react' },
  Var: { name: 'Var', source: 'gt-react' },
  GTT: { name: 'T', source: 'gt-react' },
  GTVar: { name: 'Var', source: 'gt-react' },
  GTProvider: { name: 'GTProvider', source: 'gt-react' },
  // getLocale: { name: 'getLocale', source: 'gt-react/server' },
};

/**
 * Wraps all JSX elements in the src directory with a <T> tag, with unique ids.
 * - Ignores pure strings
 *
 * @param options - The options object
 * @returns An object containing the updates and errors
 */
export default async function scanForContent(
  options: WrapOptions,
  framework: 'gt-next' | 'gt-react'
): Promise<{ errors: string[]; filesUpdated: string[]; warnings: string[] }> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const srcDirectory = options.src || ['./'];

  const files = srcDirectory.flatMap((dir) => getFiles(dir));
  const filesUpdated = [];

  for (const file of files) {
    const code = fs.readFileSync(file, 'utf8');

    // Create relative path from src directory and remove extension
    const relativePath = getRelativePath(file, srcDirectory[0]);

    let ast;
    try {
      ast = parse(code, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript'],
        tokens: true,
        createParenthesizedExpressions: true,
      });
    } catch (error) {
      console.error(`Error parsing file ${file}:`, error);
      errors.push(`Failed to parse ${file}: ${error}`);
      continue;
    }

    let modified = false;
    let usedImports: string[] = [];

    let { importAlias, initialImports } = generateImportMap(ast, framework);

    // If the file already has a T import, skip processing it
    if (initialImports.includes(IMPORT_MAP.T.name)) {
      continue;
    }

    let globalId = 0;
    traverse(ast, {
      JSXElement(path) {
        // Check if this JSX element has any JSX element ancestors
        let currentPath: NodePath = path;
        while (currentPath.parentPath) {
          if (t.isJSXElement(currentPath.parentPath.node)) {
            // If we found a JSX parent, skip processing this node
            return;
          }
          currentPath = currentPath.parentPath;
        }

        // At this point, we're only processing top-level JSX elements
        const opts = {
          ...importAlias,
          idPrefix: relativePath,
          idCount: globalId,
          usedImports,
          modified: false,
          createIds: !options.disableIds,
        };
        const wrapped = handleJsxElement(path.node, opts, isMeaningful);
        path.replaceWith(wrapped);
        path.skip();

        // Update global counters
        modified = opts.modified;
        globalId = opts.idCount;
      },
    });
    if (!modified) continue;

    let needsImport = usedImports.filter(
      (imp) => !initialImports.includes(imp)
    );

    if (needsImport.length > 0) {
      createImports(ast, needsImport, IMPORT_MAP);
    }

    try {
      const output = generate(
        ast,
        {
          retainLines: true,
          retainFunctionParens: true,
          comments: true,
          compact: 'auto',
        },
        code
      );

      // Post-process the output to fix import spacing
      let processedCode = output.code;
      if (needsImport.length > 0) {
        // Add newline after the comment only
        processedCode = processedCode.replace(
          /((?:import\s*{\s*(?:T|GTT|Var|GTVar|GTProvider|getLocale)(?:\s*,\s*(?:T|GTT|Var|GTVar|GTProvider|getLocale))*\s*}\s*from|const\s*{\s*(?:T|GTT|Var|GTVar|GTProvider|getLocale)(?:\s*,\s*(?:T|GTT|Var|GTVar|GTProvider|getLocale))*\s*}\s*=\s*require)\s*['"]gt-(?:next|react)(?:\/server)?['"];?)/,
          '\n$1\n'
        );
      }

      // Write the modified code back to the file
      fs.writeFileSync(file, processedCode);
      filesUpdated.push(file);
    } catch (error) {
      console.error(`Error writing file ${file}:`, error);
      errors.push(`Failed to write ${file}: ${error}`);
    }
  }

  return { errors, filesUpdated, warnings };
}
