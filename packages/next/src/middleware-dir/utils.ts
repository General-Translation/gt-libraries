import { NextRequest } from 'next/server';
import {
  isValidLocale,
  determineLocale,
  standardizeLocale,
} from 'generaltranslation';
import { localeCookieName } from 'generaltranslation/internal';
import { middlewareLocaleResetFlagName } from '../utils/constants';

export type PathConfig = {
  [key: string]: string | { [key: string]: string };
};

/**
 * Extracts the locale from the given pathname.
 */
export function extractLocale(pathname: string): string | null {
  const matches = pathname.match(/^\/([^\/]+)(?:\/|$)/);
  return matches ? matches[1] : null;
}

/**
 * Extracts dynamic parameters from a path based on a shared path pattern
 */
export function extractDynamicParams(
  templatePath: string,
  path: string
): string[] {
  if (!templatePath.includes('[')) return [];

  const params: string[] = [];
  const pathSegments = path.split('/');
  const sharedSegments = templatePath.split('/');

  sharedSegments.forEach((segment, index) => {
    if (segment.startsWith('[') && segment.endsWith(']')) {
      params.push(pathSegments[index]);
    }
  });

  return params;
}

/**
 * Replaces dynamic segments in a path with their actual values
 */
export function replaceDynamicSegments(
  path: string,
  templatePath: string
): string {
  if (!templatePath.includes('[')) return templatePath;

  const params = extractDynamicParams(templatePath, path);
  let paramIndex = 0;
  const result = templatePath.replace(/\[([^\]]+)\]/g, (match: string) => {
    return params[paramIndex++] || match;
  });
  return result;
}

/**
 * Gets the full localized path given a shared path and locale
 */
export function getLocalizedPath(
  sharedPath: string,
  locale: string,
  pathConfig: PathConfig
): string | undefined {
  const localizedPath = pathConfig[sharedPath];
  let path: string | undefined;

  if (typeof localizedPath === 'string') {
    path = `/${locale}${localizedPath}`;
  } else if (typeof localizedPath === 'object') {
    path = localizedPath[locale]
      ? `/${locale}${localizedPath[locale]}`
      : `/${locale}${sharedPath}`;
  }

  return path;
}

/**
 * Creates a map of localized paths to shared paths using regex patterns
 */
export function createPathToSharedPathMap(
  pathConfig: PathConfig,
  prefixDefaultLocale: boolean,
  defaultLocale: string
): {
  pathToSharedPath: { [key: string]: string };
  defaultLocalePaths: string[];
} {
  return Object.entries(pathConfig).reduce<{
    pathToSharedPath: { [key: string]: string };
    defaultLocalePaths: string[];
  }>(
    (acc, [sharedPath, localizedPaths]) => {
      const { pathToSharedPath, defaultLocalePaths } = acc;
      // Add the shared path itself, converting to regex pattern if it has dynamic segments
      if (sharedPath.includes('[')) {
        const pattern = sharedPath.replace(/\[([^\]]+)\]/g, '[^/]+');
        pathToSharedPath[pattern] = sharedPath;
      } else {
        pathToSharedPath[sharedPath] = sharedPath;
      }

      if (typeof localizedPaths === 'object') {
        Object.entries(localizedPaths).forEach(([locale, localizedPath]) => {
          // Convert the localized path to a regex pattern
          // Replace [param] with [^/]+ to match any non-slash characters
          const pattern = localizedPath.replace(/\[([^\]]+)\]/g, '[^/]+');
          pathToSharedPath[`/${locale}${pattern}`] = sharedPath;
          if (!prefixDefaultLocale && locale === defaultLocale) {
            pathToSharedPath[pattern] = sharedPath;
            defaultLocalePaths.push(pattern);
          }
        });
      }
      return acc;
    },
    { pathToSharedPath: {}, defaultLocalePaths: [] }
  );
}

/**
 * Gets the shared path from a given pathname, handling both static and dynamic paths
 */
export function getSharedPath(
  pathname: string,
  pathToSharedPath: { [key: string]: string }
): string | undefined {
  // Try exact match first
  if (pathToSharedPath[pathname]) {
    return pathToSharedPath[pathname];
  }

  // Without locale prefix
  const pathnameWithoutLocale = pathname.replace(/^\/[^/]+/, '');
  if (pathToSharedPath[pathnameWithoutLocale]) {
    return pathToSharedPath[pathnameWithoutLocale];
  }

  // Try regex pattern match
  let candidateSharedPath = undefined;
  for (const [pattern, sharedPath] of Object.entries(pathToSharedPath)) {
    if (pattern.includes('/[^/]+')) {
      // Convert the pattern to a strict regex that matches the exact path structure
      const regex = new RegExp(`^${pattern.replace(/\//g, '\\/')}$`);
      if (regex.test(pathname)) {
        return sharedPath;
      }
      if (!candidateSharedPath && regex.test(pathnameWithoutLocale)) {
        candidateSharedPath = sharedPath;
      }
    }
  }
  return candidateSharedPath;
}

/**
 *
 * @returns
 */

function inDefaultLocalePaths(
  pathname: string,
  defaultLocalePaths: string[]
): boolean {
  // Try exact match first
  if (defaultLocalePaths.includes(pathname)) {
    return true;
  }

  // Try regex pattern match
  for (const path of defaultLocalePaths) {
    if (path.includes('/[^/]+')) {
      const regex = new RegExp(`^${path.replace(/\//g, '\\/')}$`);
      if (regex.test(pathname)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Gets the locale from the request using various sources
 */
export function getLocaleFromRequest(
  req: NextRequest,
  defaultLocale: string,
  approvedLocales: string[],
  localeRouting: boolean,
  gtServicesEnabled: boolean,
  prefixDefaultLocale: boolean,
  defaultLocalePaths: string[]
): {
  userLocale: string;
  pathnameLocale: string | undefined;
  unstandardizedPathnameLocale: string | null | undefined;
  clearResetCookie: boolean;
} {
  const headerList = new Headers(req.headers);
  const candidates: string[] = [];
  let clearResetCookie = false;
  const { pathname } = req.nextUrl;

  // Check pathname locales
  let pathnameLocale, unstandardizedPathnameLocale;
  if (localeRouting) {
    unstandardizedPathnameLocale = extractLocale(pathname);
    const extractedLocale = gtServicesEnabled
      ? standardizeLocale(unstandardizedPathnameLocale || '')
      : unstandardizedPathnameLocale;
    if (extractedLocale && isValidLocale(extractedLocale)) {
      pathnameLocale = extractedLocale;
      candidates.push(pathnameLocale);
    }
  }

  // Check pathname for a customized unprefixed default locale path (e.g. /en-about , /en-dashboard/1/en-custom)
  if (
    localeRouting &&
    !prefixDefaultLocale &&
    !pathnameLocale &&
    inDefaultLocalePaths(pathname, defaultLocalePaths)
  ) {
    candidates.push(defaultLocale); // will override other candidates
  }

  // Check cookie locale
  const cookieLocale = req.cookies.get(localeCookieName);
  if (cookieLocale?.value && isValidLocale(cookieLocale?.value)) {
    const resetCookie = req.cookies.get(middlewareLocaleResetFlagName);
    if (resetCookie?.value) {
      candidates.unshift(cookieLocale.value);
      clearResetCookie = true;
    } else {
      candidates.push(cookieLocale.value);
    }
  }

  // Check referer locale
  let refererLocale;
  if (localeRouting) {
    const referer = headerList.get('referer');
    if (referer && typeof referer === 'string') {
      refererLocale = extractLocale(new URL(referer)?.pathname);
      if (isValidLocale(refererLocale || ''))
        candidates.push(refererLocale || '');
    }
  }

  // Get locales from accept-language header
  if (process.env._GENERALTRANSLATION_IGNORE_BROWSER_LOCALES === 'false') {
    const acceptedLocales =
      headerList
        .get('accept-language')
        ?.split(',')
        .map((item) => item.split(';')?.[0].trim()) || [];
    if (acceptedLocales) candidates.push(...acceptedLocales);
  }

  // Get default locale
  candidates.push(defaultLocale);

  // determine userLocale
  const unstandardizedUserLocale =
    determineLocale(candidates.filter(isValidLocale), approvedLocales) ||
    defaultLocale;
  const userLocale = gtServicesEnabled
    ? standardizeLocale(unstandardizedUserLocale)
    : unstandardizedUserLocale;

  return {
    userLocale,
    pathnameLocale,
    unstandardizedPathnameLocale,
    clearResetCookie,
  };
}
