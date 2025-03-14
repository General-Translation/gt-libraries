const defaultVariableNames = {
  variable: 'value',
  number: 'n',
  datetime: 'date',
  currency: 'cost',
} as const;

export const baseVariablePrefix = '_gt_';

export function getVariableName(
  props: Record<string, any> = {},
  variableType: string
): string {
  if (props.name) return props.name;
  if (props['data-_gt-variable-name']) return props['data-_gt-variable-name'];
  const baseVariableName =
    (defaultVariableNames as Record<string, any>)[variableType] || 'value';
  return `${baseVariablePrefix}${baseVariableName}_${props['data-_gt']?.id}`;
}
