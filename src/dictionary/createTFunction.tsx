import React, { isValidElement } from "react";
import I18NConfiguration from "../config/I18NConfiguration";
import Value from "../server/value/InnerValue";
import Plural from "../server/plural/InnerPlural";
import getEntryMetadata from "../primitives/rendering/getEntryMetadata";
import getEntryTranslationType from "../primitives/rendering/getEntryTranslationType";
import getDictionaryEntry from "./getDictionaryEntry";
import checkTFunctionOptions from "./checkTFunctionOptions";
import createOptions from "./createOptions";

export type tOptions = {
    n?: number;
    [key: string]: any
}

export default function createTFunction({ I18NConfig, T, intl, dictionary = I18NConfig.getDictionary() }: { I18NConfig: I18NConfiguration, T: any, intl: any, dictionary?: Record<string, any> }) {
    
    return function t(id: string, options?: tOptions): JSX.Element | Promise<string> {
        
        checkTFunctionOptions(options);

        const raw = getDictionaryEntry(id, dictionary);
        const { entry, metadata } = getEntryMetadata(raw);
        options = createOptions(options);

        // Checks to see if options are valid
        const translationType = getEntryTranslationType(raw)
        // Turn into an async function if the target is a string
        if (translationType === "intl") return intl(entry, { id, ...metadata });
    
        // If a plural or value is required
        if (options.values) {
            const locales = [I18NConfig.getLocale(), I18NConfig.getDefaultLocale()];
            const { ranges, zero, one, two, few, many, other, singular, dual, plural,
                ...tOptions 
            } = metadata || {};
            if (translationType === "plural") {
                if (!options.values || typeof options.values.n !== 'number') {
                    throw new Error(`ID "${id}" requires an "n" option.\n\ne.g. t("${id}", { n: 1 })`)
                }
                const innerProps = {
                    ranges, 
                    zero, one,
                    two, few,
                    many, other,
                    singular, dual, plural,
                    ...options.values
                };
                return (
                    <T id={id} {...tOptions}>
                        <Plural n={options.values.n} locales={locales} {...innerProps}>
                            {entry}
                        </Plural>
                    </T>
                );
            }
            return (
                <T id={id} {...tOptions}>
                    <Value values={options.values} locales={locales}>
                        {entry}
                    </Value>
                </T>
            )
        }

        // base case, just return T with an inner fragment (</>) for consistency
        return (
            <T id={id} {...metadata}>
                <>{entry}</>
            </T>
        )
    }
}