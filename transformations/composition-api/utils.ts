import type {
  ArrayExpression,
  ArrowFunctionExpression,
  Collection,
  ExportDefaultDeclaration,
  FunctionExpression,
  Identifier,
  JSCodeshift,
  NewExpression,
  Node,
  ObjectExpression,
  ObjectMethod,
  ObjectProperty
} from 'jscodeshift'

import j from 'jscodeshift'

export interface TransformParams {
  defaultExport: Collection<ExportDefaultDeclaration>
  j: JSCodeshift
}

export type ObjectFunction =
  | (ObjectMethod & {
      key: Identifier
    })
  | (ObjectProperty & {
      value: ArrowFunctionExpression | FunctionExpression
      key: Identifier
    })

type Property = ObjectExpression['properties'][number]

export interface TypeMap {
  Identifier: Identifier
  NewExpression: NewExpression
  ArrayExpression: ArrayExpression
  ObjectExpression: ObjectExpression
  ObjectMethod: ObjectMethod
  ObjectProperty: ObjectProperty
}

export const isKeyIdentifier = <T extends ObjectProperty | ObjectMethod>(
  nodeValue: T
): nodeValue is T & { key: Identifier } =>
  'key' in nodeValue && j.Identifier.check(nodeValue.key)

export const isFunction = (node: Property): node is ObjectFunction => {
  if (!('key' in node) || !j.Identifier.check(node.key)) return false

  if (j.ObjectMethod.check(node)) {
    return true
  }
  if (
    j.ObjectProperty.check(node) &&
    (j.ArrowFunctionExpression.check(node.value) ||
      j.FunctionExpression.check(node.value))
  ) {
    return true
  }
  return false
}

export const get = <U extends Node>(collection: Collection<U>) => {
  return collection.nodes()[0]
}
export const getFunctionNodeValue = (methodProp: ObjectFunction) => {
  if (j.ObjectMethod.check(methodProp)) {
    return methodProp
  }
  return methodProp.value
}

export const getFunctionBuilderParams = (methodProp: ObjectFunction) => {
  const { params, async, body } = getFunctionNodeValue(methodProp)
  return {
    params,
    async,
    body
  }
}
