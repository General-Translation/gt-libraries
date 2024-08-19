var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { jsx as _jsx } from "react/jsx-runtime";
import renderVariable from './renderVariable';
const Value = (_a) => {
    var { children, values, locales } = _a, props = __rest(_a, ["children", "values", "locales"]);
    let { 'data-generaltranslation': generaltranslation } = props;
    if (!values || Object.keys(values).length < 1) {
        console.warn(`WARNING: No values provided to <Value> component with children ${children}.`);
    }
    const renderedChildren = renderVariable(children, locales, values ? values : undefined);
    return (_jsx("span", { "data-values": values, "data-generaltranslation": generaltranslation, children: renderedChildren }));
};
Value.gtTransformation = "value";
export default Value;
//# sourceMappingURL=InnerValue.js.map