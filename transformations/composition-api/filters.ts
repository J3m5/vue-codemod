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
