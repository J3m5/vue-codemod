import {
  findObjectProperty,
  get,
  getFunctionBuilderParams,
  isFunction
} from './utils'
import type { TransformParams } from './utils'
import j from 'jscodeshift'

export const transformComputed = ({
  defaultExport,
  collector
}: TransformParams) => {
  // Find the methods of the default export object
  const computedCollection = findObjectProperty(defaultExport, 'computed')

  if (!computedCollection.length) return
  collector.newImports.vue.add('computed')
  const functionNodes = get(computedCollection).properties.filter(isFunction)

  const computedNodes = functionNodes.map(computed => {
    collector.refs.push(computed.key.name)
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
