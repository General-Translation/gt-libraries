import Num from '../../variables/Num';
import Var from '../../variables/Var';
import Currency from '../../variables/Currency';
import DateTime from '../../variables/DateTime';

export default function renderVariable({
  variableType,
  variableName,
  variableValue,
  variableOptions,
  locales,
}: {
  variableType: 'variable' | 'number' | 'datetime' | 'currency';
  variableName: string;
  variableValue: any;
  variableOptions: Intl.NumberFormatOptions | Intl.DateTimeFormatOptions;
  locales: string[];
}): React.JSX.Element {
  if (variableType === 'number') {
    return (
      <Num
        name={variableName}
        value={variableValue}
        options={variableOptions}
      />
    );
  } else if (variableType === 'datetime') {
    return (
      <DateTime
        name={variableName}
        value={variableValue}
        options={variableOptions}
      />
    );
  } else if (variableType === 'currency') {
    return (
      <Currency
        name={variableName}
        value={variableValue}
        options={variableOptions}
      />
    );
  }
  return <Var name={variableName} value={variableValue} />;
}
