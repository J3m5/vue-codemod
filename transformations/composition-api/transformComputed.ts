import { get, getFunctionBuilderParams, isFunction } from './utils'
import type { TransformParams } from './utils'

export const transformComputed = ({ defaultExport, j }: TransformParams) => {
  // Find the methods of the default export object
  const computedCollection = defaultExport
    .find(j.ObjectProperty, {
      key: { name: 'computed' }
    })
    .find(j.ObjectExpression)

  if (!computedCollection.length) return

  const functionNodes = get(computedCollection).properties.filter(isFunction)

  const computedNodes = functionNodes.map(computed => {
    const computedBuilderParams = getFunctionBuilderParams(computed)

    return j.variableDeclaration('const', [
      j.variableDeclarator(
        j.identifier(computed.key.name),
        j.callExpression(j.identifier('computed'), [
          j.arrowFunctionExpression.from(computedBuilderParams)
        ])
      )
    ])
  })

  defaultExport.insertBefore(computedNodes)
}
