import type {
  ArrowFunctionExpression,
  Collection,
  ExportDefaultDeclaration,
  FunctionExpression,
  Identifier,
  Node,
  ObjectExpression,
  ObjectMethod,
  ObjectProperty
} from 'jscodeshift'

import j from 'jscodeshift'
import { fromPaths } from 'jscodeshift/src/Collection'

export type Collector = {
  refs: string[]
  props: string[]
  methods: string[]
}
export type ExportDefaultCollection = Collection<ExportDefaultDeclaration>
export interface TransformParams {
  defaultExport: ExportDefaultCollection
  collector: Collector
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

export const isKeyIdentifier = <T extends ObjectProperty | ObjectMethod>(
  nodeValue: T
): nodeValue is T & { key: Identifier } =>
  'key' in nodeValue && j.Identifier.check(nodeValue.key)

export const findFunctions = (
  collection: Collection,
  filter: object
): Collection<ArrowFunctionExpression | FunctionExpression | ObjectMethod> => {
  return fromPaths(
    [
      ...collection.find(j.ArrowFunctionExpression, filter).paths(),
      ...collection.find(j.FunctionExpression, filter).paths(),
      ...collection.find(j.ObjectMethod, filter).paths()
    ],
    collection
  )
}
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
  const { async, body } = getFunctionNodeValue(methodProp)
  return {
    async,
    body,
    params: []
  }
}
