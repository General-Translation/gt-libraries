import defaultVariableNames from "./_defaultVariableNames";
export default function getVariableProps(props) {
    var _a;
    var variableType = ((_a = props['data-generaltranslation']) === null || _a === void 0 ? void 0 : _a.variableType) || "variable";
    var result = {
        variableType: variableType,
        variableName: props.name || props['data-_gt-variable-name'] || defaultVariableNames[variableType],
        variableValue: (function () {
            if (typeof props.value !== 'undefined')
                return props.value;
            if (typeof props['data-_gt-unformatted-value'] !== 'undefined')
                return props['data-_gt-unformatted-value'];
            if (typeof props.children !== 'undefined')
                return props.children;
            return undefined;
        })(),
        variableOptions: props.options || props['data-_gt-variable-options'] || undefined
    };
    return result;
}
//# sourceMappingURL=_getVariableProps.js.map