import j from 'jscodeshift'
import {
  TransformParams,
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
    collector.methodNames.push(name)
    return [
      name,
      j.variableDeclaration('const', [
        j.variableDeclarator(
          j.identifier(name),
          j.arrowFunctionExpression.from(methodBuilderParams)
        )
      ])
    ]
  })
  collector.methodNodes = {
    ...collector.methodNodes,
    ...Object.fromEntries(methodNodes)
  }
}
