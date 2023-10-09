import j from 'jscodeshift'
import type { TransformParams } from './utils'
import {
  findObjectProperty,
  get,
  getFunctionBuilderParams,
  isFunction
} from './utils'

export const transformComputed = ({
  defaultExport,
  collector
}: TransformParams) => {
  // Find the methods of the default export object
  const computedCollection = findObjectProperty(defaultExport, 'computed')

  if (!computedCollection.length) return

  const functionNodes = get(computedCollection).properties.filter(isFunction)

  if (!functionNodes.length) return

  collector.newImports.vue.add('computed')

  const computedNodes = functionNodes.map(computed => {
    const { name } = computed.key
    collector.refs.push(name)
    const computedBuilderParams = getFunctionBuilderParams(computed)

    return [
      name,
      j.variableDeclaration('const', [
        j.variableDeclarator(
          j.identifier(name),
          j.callExpression(j.identifier('computed'), [
            j.arrowFunctionExpression.from(computedBuilderParams)
          ])
        )
      ])
    ]
  })

  collector.computedNodes = {
    ...collector.computedNodes,
    ...Object.fromEntries(computedNodes)
  }
}
