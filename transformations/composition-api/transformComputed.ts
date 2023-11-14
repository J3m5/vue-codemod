import j from 'jscodeshift'
import type { TransformParams } from './types'
import {
  findObjectProperty,
  getNodes,
  getFunctionBuilderParams,
  isFunction,
} from './utils'

export const transformComputed = ({
  defaultExport,
  collector,
}: TransformParams) => {
  const computedCollection = findObjectProperty(defaultExport, 'computed')

  if (!computedCollection.length) return

  const functionNodes =
    getNodes(computedCollection).properties.filter(isFunction)

  if (!functionNodes.length) return

  const computedNodes = functionNodes.map((computed) => {
    const { name } = computed.key
    const computedBuilderParams = getFunctionBuilderParams(computed)

    return [
      name,
      j.variableDeclaration('const', [
        j.variableDeclarator(
          j.identifier(name),
          j.callExpression(j.identifier('computed'), [
            j.arrowFunctionExpression.from(computedBuilderParams),
          ]),
        ),
      ]),
    ] as const
  })

  collector.nodes.computed = new Map(computedNodes)
}
