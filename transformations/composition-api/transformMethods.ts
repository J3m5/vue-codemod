import j from 'jscodeshift'

import {
  findObjectProperty,
  get,
  getFunctionBuilderParams,
  isFunction
} from './utils'

import type { TransformParams } from './utils'

export const transformMethods = ({
  defaultExport,
  collector
}: TransformParams) => {
  // Find the methods of the default export object
  const methodsCollection = findObjectProperty(defaultExport, 'methods')

  if (!methodsCollection.length) return

  const functionNodes = get(methodsCollection).properties.filter(isFunction)

  const methodNodes = functionNodes.map(methodProp => {
    const methodBuilderParams = getFunctionBuilderParams(methodProp)
    collector.methods.push(methodProp.key.name)
    return j.variableDeclaration('const', [
      j.variableDeclarator(
        j.identifier(methodProp.key.name),
        j.arrowFunctionExpression.from(methodBuilderParams)
      )
    ])
  })

  defaultExport.insertBefore(methodNodes)
}
