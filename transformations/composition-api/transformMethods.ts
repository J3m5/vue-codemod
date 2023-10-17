import j from 'jscodeshift'

import {
  findObjectProperty,
  get,
  getFunctionBuilderParams,
  isFunction
} from './utils'

import type { TransformParams } from './types'

export const transformMethods = ({
  defaultExport,
  collector
}: TransformParams) => {
  // Find the methods of the default export object
  const methodsCollection = findObjectProperty(defaultExport, 'methods')

  if (!methodsCollection.length) return

  const functionNodes = get(methodsCollection).properties.filter(isFunction)

  if (!functionNodes.length) return

  const methodNodes = functionNodes.map(methodProp => {
    const methodBuilderParams = getFunctionBuilderParams(methodProp)
    const { name } = methodProp.key
    return [
      name,
      j.variableDeclaration('const', [
        j.variableDeclarator(
          j.identifier(name),
          j.arrowFunctionExpression.from(methodBuilderParams)
        )
      ])
    ] as const
  })

  collector.nodes.method = new Map([...collector.nodes.method, ...methodNodes])
}
