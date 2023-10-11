import type {
  ASTPath,
  Identifier,
  JSCodeshift,
  ObjectExpression,
  ObjectProperty
} from 'jscodeshift'
import j from 'jscodeshift'
import type { ExportDefaultCollection, TransformParams } from './utils'
import { isKeyIdentifier } from './utils'

const getRefValue = ({ node }: { node: ObjectProperty; j: JSCodeshift }) => {
  const { value } = node

  // Get literal node
  if (j.Literal.check(value)) {
    return j.literal(value.value)
  }

  // Get all other valid nodes
  if (
    !j.TSParameterProperty.check(value) &&
    !j.TSTypeAssertion.check(value) &&
    !j.RestElement.check(value) &&
    !j.SpreadElementPattern.check(value) &&
    !j.PropertyPattern.check(value) &&
    !j.ObjectPattern.check(value) &&
    !j.ArrayPattern.check(value) &&
    !j.AssignmentPattern.check(value) &&
    !j.SpreadPropertyPattern.check(value)
  ) {
    return value
  }
}

const filterData = (dataPropertyPath: ASTPath<ObjectExpression>) => {
  const grandParent = dataPropertyPath.parent.value

  return (
    ['ArrowFunctionExpression', 'ReturnStatement'].includes(grandParent.type) ||
    grandParent.key.name === 'data'
  )
}

const grandParentIsExport = (path: ASTPath<Identifier>) => {
  return path.parent.parent.parent.value.type === 'ExportDefaultDeclaration'
}

const getDataCollection = (defaultExport: ExportDefaultCollection) => {
  return defaultExport
    .find(j.Identifier, { name: 'data' })
    .filter(grandParentIsExport)
    .map(path => path.parentPath)
    .find(j.ObjectExpression)
    .filter(filterData)
    .map(path => path.get('properties') as ASTPath<ObjectProperty>[])
}

export const transformData = ({
  defaultExport,
  collector
}: TransformParams) => {
  const dataCollection = getDataCollection(defaultExport)

  if (!dataCollection) return

  const dataNodes = dataCollection.nodes().flat().filter(isKeyIdentifier)

  if (!dataNodes.length) return

  const refNodes = dataNodes.flatMap(dataProp => {
    const refValue = getRefValue({ node: dataProp, j })

    if (!refValue) return []

    const { name } = dataProp.key
    const identifier = j.ObjectExpression.check(refValue) ? 'reactive' : 'ref'
    return [
      [
        name,
        j.variableDeclaration('const', [
          j.variableDeclarator(
            j.identifier(name),
            j.callExpression(j.identifier(identifier), [refValue])
          )
        ])
      ]
    ] as const
  })

  if (!refNodes.length) return
  collector.nodes.data = new Map(refNodes)
}
