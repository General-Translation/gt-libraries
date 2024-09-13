'use client'

import React from "react";
import { isSameLanguage, renderContentToString } from "generaltranslation";

import { ReactElement, useCallback, useEffect, useState } from "react";
import useBrowserLocale from "../hooks/useBrowserLocale";
import { defaultDictionary, defaultDictionaryName, libraryDefaultLocale, pluralBranchNames } from "../primitives/primitives";
import { GTContext } from "./GTContext";
import { Dictionary, DictionaryEntry, Translation } from "../primitives/types";
import getDictionaryEntry from "./helpers/getDictionaryEntry";
import { addGTIdentifier } from "../internal";
import extractEntryMetadata from "./helpers/extractEntryMetadata";
import renderDefaultChildren from "./rendering/renderDefaultChildren";
import getPluralBranch from "../plurals/getPluralBranch";
import renderTranslatedChildren from "./rendering/renderTranslatedChildren";

// intended for purely client-side apps, put at the root of the project

export default function GTProvider({
    children, 
    projectID,
    dictionary = defaultDictionary, 
    dictionaryName = defaultDictionaryName,
    approvedLocales, 
    defaultLocale = approvedLocales?.[0] || libraryDefaultLocale, 
    locale, 
    cacheURL = 'https://cache.gtx.dev'
}: {
    children?: any;
    projectID?: string;
    dictionary?: Dictionary;
    dictionaryName?: string;
    approvedLocales?: string[];
    defaultLocale?: string;
    locale?: string;
    cacheURL?: string;
}): JSX.Element {

    if (!projectID && cacheURL === 'https://cache.gtx.dev') {
        throw new Error("gt-react Error: General Translation cloud services require a project ID! Find yours at www.generaltranslation.com/dashboard.")
    }

    const browserLocale = useBrowserLocale(defaultLocale);
    locale = locale || browserLocale;

    const translationRequired = isSameLanguage(locale, defaultLocale) ? false : true;

    const [translations, setTranslations] = useState<Record<string, Translation> | null>(
        cacheURL ? null : {}
    )

    useEffect(() => {
        if (!translations) {
            if (!translationRequired) {
                setTranslations({}); // no translation required
            } else {
                (async () => {
                    const response = await fetch(`${cacheURL}/${projectID}/${locale}/${dictionaryName}`);
                    const result = await response.json();
                    setTranslations(result);
                })()
            }
        }
    }, [translations, translationRequired])

    const translate = useCallback((
        id: string, 
        options: Record<string, any> = {}, 
        f?: Function
    ) => {
        
        // get the dictionary entry
        let { entry, metadata } = extractEntryMetadata(
            getDictionaryEntry(dictionary, id) as DictionaryEntry
        );

        // Get variables and variable options
        let variables; let variablesOptions;
        if (options) {
            variables = options;
            if (metadata?.variablesOptions) {
                variablesOptions = metadata.variablesOptions;
            }
        }

        // Handle if the entry is a function
        if (typeof f === 'function') {
            entry = f(options) as ReactElement;
        } else if (typeof entry === 'function') {
            entry = entry(options) as ReactElement;
        }

        const taggedEntry = addGTIdentifier(entry, metadata);

        let source = taggedEntry;

        // Get a plural if appropriate (check type, if type, get branch, entry =)
        const isPlural = metadata && pluralBranchNames.some(branchName => branchName in metadata);
        if (isPlural) {
            if (typeof variables?.n !== 'number')
                throw new Error(`t("${id}"): Plural requires "n" option.`)
            source = getPluralBranch(
                variables.n, 
                [locale, defaultLocale],
                source.props?.['data-generaltranslation'].branches
            ) || source.props.children; // we know t exists because isPlural
        }

        // If no translations are required
        if (!translationRequired) {
            if (typeof taggedEntry === 'string') {
                return renderContentToString(
                    source, defaultLocale, 
                    variables, variablesOptions
                )
            }
            return renderDefaultChildren({
                entry: source, variables, variablesOptions
            })
        }

        // If a translation is required
        if (translations) {
            const translation = translations[id];
            if (typeof taggedEntry === 'string') {
                return renderContentToString(
                    translation.t as any, [locale, defaultLocale],
                    variables, variablesOptions
                )
            }
            let target = translation.t;
            if (isPlural) {
                target = getPluralBranch(
                    variables?.n as number,
                    [locale, defaultLocale],
                    (target as any).props?.['data-generaltranslation']?.branches
                ) || (target as any)?.props?.children;
            }
            return renderTranslatedChildren({
                source,
                target,
                variables, variablesOptions
            });
        }
    }, [dictionary, translations, translationRequired]);

    return (
        <GTContext.Provider value={{
            translate, locale, defaultLocale
        }}>
            {
                translations ?
                children : undefined
            }
        </GTContext.Provider>
    )

}