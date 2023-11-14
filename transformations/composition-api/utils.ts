import type {
  Collection,
  Identifier,
  Node,
  ObjectMethod,
  ObjectProperty,
} from 'jscodeshift'

import j from 'jscodeshift'
import type { ExportDefaultCollection, ObjectFunction, Property } from './types'

export const isKeyIdentifier = <T extends ObjectProperty | ObjectMethod>(
  nodeValue: T,
): nodeValue is T & { key: Identifier } =>
  'key' in nodeValue && j.Identifier.check(nodeValue.key)

export const isFunction = (node: Property): node is ObjectFunction => {
  if (!('key' in node) || !j.Identifier.check(node.key)) return false

  if (j.ObjectMethod.check(node)) return true
  if (
    j.ObjectProperty.check(node) &&
    (j.ArrowFunctionExpression.check(node.value) ||
      j.FunctionExpression.check(node.value))
  ) {
    return true
  }
  return false
}

export const getNodes = <U extends Node>(collection: Collection<U>) => {
  return collection.nodes()[0]
}
export const getFunctionNodeValue = (methodProp: ObjectFunction) => {
  if (j.ObjectMethod.check(methodProp)) {
    return methodProp
  }
  return methodProp.value
}

export const findObjectProperty = (
  defaultExport: ExportDefaultCollection,
  property: string,
) => {
  return defaultExport
    .find(j.ObjectProperty, {
      key: { name: property },
    })
    .filter(
      (path) => path.parent.parent.value.type === 'ExportDefaultDeclaration',
    )
    .find(j.ObjectExpression)
    .filter((path) => path.parent.value.key.name === property)
}

export const getFunctionBuilderParams = (
  methodProp: ObjectFunction,
  useArgs: boolean = false,
) => {
  const { async, body, params } = getFunctionNodeValue(methodProp)
  return {
    async,
    body,
    params: useArgs ? params : [],
  }
}
