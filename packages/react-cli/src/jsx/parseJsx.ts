import { Updates } from '../types';

import generate from '@babel/generator';
import * as t from '@babel/types';
import addGTIdentifierToSyntaxTree from '../data-_gt/addGTIdentifierToSyntaxTree';
import {
  warnHasUnwrappedExpression,
  warnNoId,
  warnVariableProp,
} from '../console/warnings';
import { isAcceptedPluralForm } from 'generaltranslation/internal';
import {
  handleChildrenWhitespace,
  trimJsxStringChild,
} from './trimJsxStringChildren';
import { isStaticExpression } from './evaluateJsx';

// Valid variable components
const VARIABLE_COMPONENTS = ['Var', 'DateTime', 'Currency', 'Num'];

/**
 * Builds a JSX tree from a given node, recursively handling children.
 * @param node - The node to build the tree from
 * @param unwrappedExpressions - An array to store unwrapped expressions
 * @param updates - The updates array
 * @param errors - The errors array
 * @param file - The file name
 * @returns The built JSX tree
 */
export function buildJSXTree(
  node: any,
  unwrappedExpressions: string[],
  updates: Updates,
  errors: string[],
  file: string
): any {
  if (t.isJSXExpressionContainer(node)) {
    const expr = node.expression;
    const staticAnalysis = isStaticExpression(expr);
    if (staticAnalysis.isStatic && staticAnalysis.value !== undefined) {
      // Preserve the exact whitespace for static string expressions
      return {
        expression: true,
        result: staticAnalysis.value,
      };
    }
    // Keep existing behavior for non-static expressions
    const code = generate(node).code;
    unwrappedExpressions.push(code); // Keep track of unwrapped expressions for error reporting
    return code;
  } else if (t.isJSXText(node)) {
    // Updated JSX Text handling
    // JSX Text handling following React's rules
    let text = node.value;
    return text;
  } else if (t.isJSXElement(node)) {
    const element = node;
    const elementName = element.openingElement.name;

    let typeName;
    if (t.isJSXIdentifier(elementName)) {
      typeName = elementName.name;
    } else if (t.isJSXMemberExpression(elementName)) {
      typeName = generate(elementName).code;
    } else {
      typeName = null;
    }

    // If this JSXElement is one of the recognized variable components,
    const elementIsVariable = VARIABLE_COMPONENTS.includes(typeName ?? '');

    const props: { [key: string]: any } = {};

    const elementIsPlural = typeName === 'Plural';
    const elementIsBranch = typeName === 'Branch';

    element.openingElement.attributes.forEach((attr) => {
      if (t.isJSXAttribute(attr)) {
        const attrName = attr.name.name;
        let attrValue = null;
        if (attr.value) {
          if (t.isStringLiteral(attr.value)) {
            attrValue = attr.value.value;
          } else if (t.isJSXExpressionContainer(attr.value)) {
            if (
              (elementIsPlural && isAcceptedPluralForm(attrName as string)) ||
              (elementIsBranch && attrName !== 'branch')
            ) {
              // Make sure that variable strings like {`I have ${count} book`} are invalid!
              if (
                t.isTemplateLiteral(attr.value.expression) &&
                !isStaticExpression(attr.value.expression).isStatic
              ) {
                unwrappedExpressions.push(generate(attr.value).code);
              }
            }
            attrValue = buildJSXTree(
              attr.value.expression,
              unwrappedExpressions,
              updates,
              errors,
              file
            );
          }
        }
        props[attrName as any] = attrValue;
      }
    });

    if (elementIsVariable) {
      parseJSXElement(element, updates, errors, file);
      return {
        type: typeName,
        props,
      };
    }

    const children = element.children.map((child) =>
      buildJSXTree(child, unwrappedExpressions, updates, errors, file)
    );
    if (children.length === 1) {
      props.children = children[0];
    } else if (children.length > 1) {
      props.children = children;
    }

    return {
      type: typeName,
      props,
    };
  }
  // If it's a JSX fragment
  else if (t.isJSXFragment(node)) {
    const children = node.children
      .map((child: any) =>
        buildJSXTree(child, unwrappedExpressions, updates, errors, file)
      )
      .filter((child: any) => child !== null && child !== '');
    return {
      type: '',
      props: {
        children: children.length === 1 ? children[0] : children,
      },
    };
  }
  // If it's a string literal (standalone)
  else if (t.isStringLiteral(node)) {
    return node.value;
  }
  // If it's some other JS expression
  else if (
    t.isIdentifier(node) ||
    t.isMemberExpression(node) ||
    t.isCallExpression(node) ||
    t.isBinaryExpression(node) ||
    t.isLogicalExpression(node) ||
    t.isConditionalExpression(node)
  ) {
    return generate(node).code;
  } else {
    return generate(node).code;
  }
}
// end buildJSXTree

// Parses a JSX element and adds it to the updates array
export function parseJSXElement(
  node: t.JSXElement,
  updates: Updates,
  errors: string[],
  file: string
) {
  const openingElement = node.openingElement;
  const name = openingElement.name;

  // Only proceed if it's <T> ...
  if (name.type === 'JSXIdentifier' && name.name === 'T') {
    const componentObj: any = { props: {} };

    // We'll track this flag to know if any unwrapped {variable} is found in children
    const unwrappedExpressions: string[] = [];

    // Gather <T>'s props
    openingElement.attributes.forEach((attr) => {
      if (!t.isJSXAttribute(attr)) return;
      const attrName = attr.name.name;
      if (typeof attrName !== 'string') return;

      if (attr.value) {
        // If it's a plain string literal like id="hello"
        if (t.isStringLiteral(attr.value)) {
          componentObj.props[attrName] = attr.value.value;
        }
        // If it's an expression container like id={"hello"}, id={someVar}, etc.
        else if (t.isJSXExpressionContainer(attr.value)) {
          const expr = attr.value.expression;
          const code = generate(expr).code;

          // Only check for static expressions on id and context props
          if (attrName === 'id' || attrName === 'context') {
            const staticAnalysis = isStaticExpression(expr);
            if (!staticAnalysis.isStatic) {
              errors.push(warnVariableProp(file, attrName, code));
            }
          }

          // Store the value (for all props)
          componentObj.props[attrName] = code;
        }
      }
    });

    // Build the JSX tree for this component
    const initialTree = buildJSXTree(
      node,
      unwrappedExpressions,
      updates,
      errors,
      file
    ).props.children;

    const whitespaceHandledTree = handleChildrenWhitespace(initialTree);

    const tree = addGTIdentifierToSyntaxTree(whitespaceHandledTree);

    componentObj.tree = tree.length === 1 ? tree[0] : tree;

    // Check the id ...
    const id = componentObj.props.id;
    // If user forgot to provide an `id`, warn
    // if (!id) {
    //   errors.push(warnNoId(file));
    // }

    // If we found an unwrapped expression, skip
    if (unwrappedExpressions.length > 0) {
      errors.push(warnHasUnwrappedExpression(file, id, unwrappedExpressions));
    }

    if (errors.length > 0) return;

    // <T> is valid here
    // displayFoundTMessage(file, id);
    updates.push({
      type: 'jsx',
      source: componentObj.tree,
      metadata: componentObj.props,
    });
  }
}
