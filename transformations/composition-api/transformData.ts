import type { ASTPath, JSCodeshift, ObjectProperty } from 'jscodeshift'
import { isKeyIdentifier } from './utils'
import type { ExportDefaultCollection, TransformParams } from './utils'
import j from 'jscodeshift'

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

  const functionNodes = dataCollection.nodes().filter(isKeyIdentifier)

  const refNodes = functionNodes.flatMap(dataProp => {
    const refValue = getRefValue({ node: dataProp, j })

    if (!refValue) return []
    collector.newImports.vue.add('ref')

    collector.refs.push(dataProp.key.name)
    return j.variableDeclaration('const', [
      j.variableDeclarator(
        j.identifier(dataProp.key.name),
        j.callExpression(j.identifier('ref'), [refValue])
      )
    ])
  })

  defaultExport.insertBefore(refNodes)
}
