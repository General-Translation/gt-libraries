"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = findFilepath;
exports.findFilepaths = findFilepaths;
exports.getRelativePath = getRelativePath;
exports.findFile = findFile;
exports.readFile = readFile;
exports.findFileInDir = findFileInDir;
exports.getRelative = getRelative;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/**
 * Resolve the file path from the given file path or default paths.
 * @param {string} filePath - The file path to resolve.
 * @param {string[]} defaultPaths - The default paths to check.
 * @returns {string} - The resolved file path.
 */
function findFilepath(paths, errorMessage = '') {
    var _a;
    return ((_a = findFilepaths(paths, errorMessage)) === null || _a === void 0 ? void 0 : _a[0]) || '';
}
/**
 * Resolve the file paths from the given file paths or default paths.
 * @param {string[]} paths - The file paths to resolve.
 * @param {string} errorMessage - The error message to throw if no paths are found.
 * @returns {string[]} - The resolved file paths.
 */
function findFilepaths(paths, errorMessage = '') {
    const resolvedPaths = [];
    for (const possiblePath of paths) {
        if (fs_1.default.existsSync(possiblePath)) {
            resolvedPaths.push(possiblePath);
        }
    }
    if (errorMessage) {
        throw new Error(errorMessage);
    }
    return resolvedPaths;
}
function getRelativePath(file, srcDirectory) {
    // Create relative path from src directory and remove extension
    return path_1.default
        .relative(srcDirectory, file.replace(/\.[^/.]+$/, '') // Remove file extension
    )
        .replace(/\\/g, '.') // Replace Windows backslashes with dots
        .split(/[./]/) // Split on dots or forward slashes
        .filter(Boolean) // Remove empty segments that might cause extra dots
        .map((segment) => segment.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()) // Convert each segment to snake case
        .join('.'); // Rejoin with dots
}
/**
 * Find a file in a directory based on a wildcard pattern.
 * @param {string} filePattern - The wildcard pattern to search for.
 * @param {string} file - The file to search for.
 * @returns {string} - The path to the file.
 */
function findFile(filePattern, file) {
    // Handle wildcard pattern by replacing the wildcard with the file parameter
    const resolvedPath = filePattern.replace(/\*/, file);
    if (fs_1.default.existsSync(resolvedPath) && fs_1.default.statSync(resolvedPath).isFile()) {
        return fs_1.default.readFileSync(resolvedPath, 'utf8');
    }
    return '';
}
/**
 * Read a file and return the contents.
 * @param {string} filePath - The path to the file to read.
 * @returns {string} - The contents of the file.
 */
function readFile(filePath) {
    if (fs_1.default.existsSync(filePath) && fs_1.default.statSync(filePath).isFile()) {
        return fs_1.default.readFileSync(filePath, 'utf8');
    }
    return '';
}
/**
 * Find a file in a directory.
 * @param {string} dir - The directory to search in.
 * @param {string} file - The file to search for.
 * @returns {string} - The path to the file.
 */
function findFileInDir(dir, file) {
    const resolvedPath = path_1.default.join(dir, file);
    try {
        if (fs_1.default.existsSync(resolvedPath)) {
            return fs_1.default.readFileSync(resolvedPath, 'utf8');
        }
    }
    catch (error) {
        console.error(error);
    }
    return '';
}
function getRelative(absolutePath) {
    const path2 = path_1.default.resolve(absolutePath);
    return path_1.default.relative(process.cwd(), path2);
}
