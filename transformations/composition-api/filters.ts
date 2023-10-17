import j from 'jscodeshift'
import type { TransformParams } from './types'
import {
  findObjectProperty,
  get,
  getFunctionBuilderParams,
  isFunction
} from './utils'

export const transformFilters = ({
  defaultExport,
  collector
}: TransformParams) => {
  const filtersCollection = findObjectProperty(defaultExport, 'filters')

  if (!filtersCollection.length) return

  const functionNodes = get(filtersCollection).properties.filter(isFunction)

  const methodNodes = functionNodes.map(methodProp => {
    const methodBuilderParams = getFunctionBuilderParams(methodProp, true)
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
