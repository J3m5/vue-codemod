import type { Collection, MemberExpression } from 'jscodeshift'
import j from 'jscodeshift'
import { Collector } from './utils'

const isVM = (node: MemberExpression) =>
  j.Identifier.check(node.object) &&
  'name' in node.object &&
  node.object.name === 'vm'

const isThis = (node: MemberExpression) => j.ThisExpression.check(node.object)

export const removeThis = (collection: Collection, collector: Collector) => {
  collection.find(j.MemberExpression).forEach(path => {
    if (!('name' in path.value.property)) return
    const { name } = path.value.property
    if (typeof name !== 'string') return
    if (!(isVM(path.value) || isThis(path.value))) {
      return
    }

    const refNode = j.identifier(name)
    if (
      collector.nodes.data.get(name) ||
      collector.nodes.ref.get(name) ||
      collector.nodes.computed.get(name)
    ) {
      const refValueNode = j.memberExpression(refNode, j.identifier('value'))
      path.replace(refValueNode)
    }
    if (collector.propsNames.includes(name)) {
      const refValueNode = j.memberExpression(j.identifier('props'), refNode)
      path.replace(refValueNode)
    }
  })

  collection.find(j.CallExpression).forEach(path => {
    if (
      !j.MemberExpression.check(path.value.callee) ||
      !j.Identifier.check(path.value.callee.property)
    )
      return
    const name = path.value.callee.property.name
    if (collector.nodes.method.get(name)) {
      const refValueNode = j.expressionStatement(
        j.callExpression(j.identifier(name), path.value.arguments)
      )

      path.replace(refValueNode)
    }
  })
}
