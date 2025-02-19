import * as t from '@babel/types';
import { ParseResult } from '@babel/parser';
import { ImportDeclaration, VariableDeclaration } from '@babel/types';
export declare function determineModuleType(ast: ParseResult<t.File>): boolean;
export type ImportItem = string | {
    local: string;
    imported: string;
    source: string;
};
export declare function generateImports(needsImport: ImportItem[], isESM: boolean, importMap: Record<string, {
    name: string;
    source: string;
}>): (t.ImportDeclaration | t.VariableDeclaration)[];
export declare function generateImportMap(ast: ParseResult<t.File>, pkg: string): {
    initialImports: string[];
    importAlias: {
        TComponent: string;
        VarComponent: string;
    };
};
export declare function insertImports(ast: ParseResult<t.File>, importNodes: (t.ImportDeclaration | t.VariableDeclaration)[]): void;
export declare function createImports(ast: ParseResult<t.File>, needsImport: ImportItem[], importMap: Record<string, {
    name: string;
    source: string;
}>): void;
export interface ImportNameResult {
    local: string;
    original: string;
}
export declare function extractImportName(node: ImportDeclaration | VariableDeclaration, pkg: string, translationFuncs: string[]): ImportNameResult[];
