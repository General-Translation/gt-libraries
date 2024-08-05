'use client'

import { ReactNode, useContext, useMemo } from "react";
import { GTContext } from "./ClientProvider";
import generateHash from "../primitives/generateHash";

export default function T({ children, id }: { children?: ReactNode, id: string }) {
    const ctx = useContext(GTContext);
    if (!ctx) {
        if (!id) {
            generateHash(children).then(hash => {
                console.error(`<T>, with children:\n\n${children}\n\nid:\n\n${hash}\n\nNo context provided. Did you mean to import the server component instead?`);
            })
        } else {
            console.error(`<T>, with children:\n\n${children}\n\nid:\n\n${id}\n\nNo context provided. Did you mean to import the server component instead?`);
        }
        return children;
    }
    const translation = useMemo(() => { return ctx?.translate(id) }, [children, id]);
    if (!translation) {
        if (!id) {
            generateHash(children).then(hash => {
                console.warn(`<T>, with children:\n\n${children}\n\nid:\n\n${hash}\n\nNo translation found.`);
            })
        } else {
            console.warn(`<T>, with children:\n\n${children}\n\nid:\n\n${id}\n\nNo translation found.`);
        }
        return children;
    }
    return translation || children;
}