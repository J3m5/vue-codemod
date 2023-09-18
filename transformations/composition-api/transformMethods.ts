import { get, getFunctionBuilderParams, isFunction } from './utils'

import type { TransformParams } from './utils'

export const transformMethods = ({ defaultExport, j }: TransformParams) => {
  // Find the methods of the default export object
  const methodsCollection = defaultExport
    .find(j.ObjectProperty, {
      key: { name: 'methods' }
    })
    .find(j.ObjectExpression)

  if (!methodsCollection.length) return

  const functionNodes = get(methodsCollection).properties.filter(isFunction)

  const methodNodes = functionNodes.map(methodProp => {
    const methodBuilderParams = getFunctionBuilderParams(methodProp)

    return j.variableDeclaration('const', [
      j.variableDeclarator(
        j.identifier(methodProp.key.name),
        j.arrowFunctionExpression.from(methodBuilderParams)
      )
    ])
  })

  defaultExport.insertBefore(methodNodes)
}
