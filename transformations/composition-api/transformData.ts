import type { ASTPath, JSCodeshift, ObjectProperty } from 'jscodeshift'
import j from 'jscodeshift'
import type { ExportDefaultCollection, TransformParams } from './utils'
import { isKeyIdentifier } from './utils'

const getRefValue = ({ node }: { node: ObjectProperty; j: JSCodeshift }) => {
  const { value } = node

  // Get literal node
  if (j.Literal.check(value)) {
    return j.literal(value.value)
  }

  // Get object, array, variable, new expression, null, and undefined node
  if (
    j.ObjectExpression.check(value) ||
    j.ArrayExpression.check(value) ||
    j.Identifier.check(value) ||
    j.NewExpression.check(value)
  ) {
    return value
  }
}

const filterData = (dataPropertyPath: ASTPath<ObjectProperty>) => {
  const grandParent = dataPropertyPath.parent.parent.value
  if (
    ['ArrowFunctionExpression', 'ReturnStatement'].includes(grandParent.type) ||
    grandParent.key.name === 'data'
  ) {
    return true
  }
  return false
}

const getDataCollection = (defaultExport: ExportDefaultCollection) => {
  const dataCollection = defaultExport
    .find(j.ObjectProperty, {
      key: { name: 'data' }
    })
    .filter(
      path => path.parent.parent.value.type === 'ExportDefaultDeclaration'
    )
    .find(j.ObjectProperty)
    .filter(filterData)

  if (dataCollection.length) return dataCollection
  const dataMethodCollection = defaultExport
    .find(j.ObjectMethod, {
      key: { name: 'data' }
    })

    .find(j.ObjectProperty)
    .filter(filterData)

  if (dataMethodCollection.length) return dataMethodCollection
  return undefined
}

export const transformData = ({
  defaultExport,
  collector
}: TransformParams) => {
  const dataCollection = getDataCollection(defaultExport)
  if (!dataCollection) return

  const dataNodes = dataCollection.nodes().filter(isKeyIdentifier)

  if (!dataNodes.length) return

  const refNodes = dataNodes.flatMap(dataProp => {
    const refValue = getRefValue({ node: dataProp, j })

    if (!refValue) return []

    collector.refs.push(dataProp.key.name)
    return j.variableDeclaration('const', [
      j.variableDeclarator(
        j.identifier(dataProp.key.name),
        j.callExpression(j.identifier('ref'), [refValue])
      )
    ])
  })

  if (!refNodes.length) return
  collector.newImports.vue.add('ref')
  collector.dataNodes = refNodes
}
