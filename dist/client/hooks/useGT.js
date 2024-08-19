'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { isValidElement, useMemo } from "react";
import { useGTContext } from "../ClientProvider";
import ClientValue from "../value/ClientValue";
import ClientNumeric from "../numeric/ClientNumeric";
/**
 * Custom hook to provide a translation function using a given context.
 *
 * This hook allows for optional prefixing of translation keys with a provided `id`.
 *
 * @param {string} [id] - Optional prefix to prepend to the translation keys.
 * @returns {Function} A translation function that accepts a key string and returns the translated value.
 */
export default function useGT(id) {
    // Create a prefix for translation keys if an id is provided
    const prefix = useMemo(() => {
        return id ? `${id}.` : '';
    }, [id]);
    // Get the translation context
    let translate;
    try {
        ({ translate } = useGTContext());
    }
    catch (_a) {
        throw new Error(`t('${id}'): No context provided. useGT() can only be used inside a GTProvider.`);
    }
    // Return a translation function if available, otherwise return a no-op function
    return (id, options) => {
        const translation = translate(`${prefix}${id}`);
        if (isValidElement(translation)) {
            const { type } = translation;
            const transformation = typeof type === 'function' ? ((type === null || type === void 0 ? void 0 : type.gtTransformation) || '') : '';
            if (transformation.startsWith("marker")) {
                const markerType = transformation.split('-')[1];
                if (markerType === "numeric" && (!options || typeof options.n !== 'number')) {
                    throw new Error(`No n value provided to dictionary entry with id ${id} marked as Numeric: ${JSON.stringify(translation)}`);
                }
                if (markerType === "value" && (!options || !options.values)) {
                    throw new Error(`No values provided to dictionary entry with id ${id} marked as Value: ${JSON.stringify(translation)}`);
                }
            }
        }
        ;
        // If a numeric or value is required
        if (options) {
            const { n, values, ranges, zero, one, two, few, many, other, singular, dual, plural } = options;
            if (typeof n === 'number') {
                const innerProps = { n, ranges, zero, one, two, few, many, other, singular, dual, plural };
                if (values) {
                    // Numeric + Value
                    return (_jsx(ClientValue, { values: values, children: _jsx(ClientNumeric, Object.assign({ id: id }, innerProps, { children: translation })) }));
                }
                else {
                    // Numeric only
                    return (_jsx(ClientNumeric, Object.assign({ id: id }, innerProps, { children: translation })));
                }
            }
            else if (values) {
                // Value only
                return (_jsx(ClientValue, { id: id, values: values, children: translation }));
            }
        }
        if (!translation)
            console.warn(`t('${id}') finding no translation for dictionary item ${prefix}${id} !`);
        return translation;
    };
}
//# sourceMappingURL=useGT.js.map