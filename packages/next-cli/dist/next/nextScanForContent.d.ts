import { WrapOptions } from 'gt-react-cli/types';
/**
 * Wraps all JSX elements in the src directory with a <T> tag, with unique ids.
 * - Ignores pure strings
 *
 * @param options - The options object
 * @returns An object containing the updates and errors
 */
export default function scanForContent(options: WrapOptions, framework: 'gt-next'): Promise<{
    errors: string[];
    filesUpdated: string[];
    warnings: string[];
}>;
