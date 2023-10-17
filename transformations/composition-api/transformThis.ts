import type {
  ASTPath,
  CallExpression,
  Identifier,
  MemberExpression
} from 'jscodeshift'
import j from 'jscodeshift'
import type { TransformParams } from './types'

type VMNode = MemberExpression & {
  object: Identifier & { name: 'vm' }
  property: { name: string }
}

type ThisNode = MemberExpression & {
  object: j.ThisExpression
  property: { name: string }
}

type ThisOrVMNode = ASTPath<ThisNode | VMNode>

const isThisOrVM = (path: ASTPath<MemberExpression>): path is ThisOrVMNode =>
  j.ThisExpression.check(path.value.object) ||
  (j.Identifier.check(path.value.object) && path.value.object.name === 'vm')

export const removeThis = ({ defaultExport, collector }: TransformParams) => {
  // Handle this, vm, props, store ands router access
  defaultExport
    .find(j.MemberExpression)
    .filter((path): path is ThisOrVMNode => {
      return (
        'name' in path.value.property &&
        typeof path.value.property.name === 'string' &&
        isThisOrVM(path)
      )
    })
    .forEach(path => {
      const { name } = path.value.property

      const refNode = j.identifier(name)

      if (
        collector.nodes.ref.has(name) ||
        collector.nodes.$refs.has(name) ||
        collector.nodes.computed.has(name)
      ) {
        const refValueNode = j.memberExpression(refNode, j.identifier('value'))
        path.replace(refValueNode)
      }

      if (collector.propsNames.includes(name)) {
        const refValueNode = j.memberExpression(j.identifier('props'), refNode)
        path.replace(refValueNode)
      }

      if (['$router', '$route', '$store'].includes(name)) {
        const newName = name.slice(1)
        const refValueNode = j.identifier(newName)
        path.replace(refValueNode)
      }
    })

  type CallMethodPath = ASTPath<
    CallExpression & {
      callee: MemberExpression & { property: Identifier }
    }
  >

  // Handle methods call
  defaultExport
    .find(j.CallExpression)
    .filter((path): path is CallMethodPath => {
      return (
        j.MemberExpression.check(path.value.callee) &&
        j.Identifier.check(path.value.callee.property)
      )
    })
    .forEach(path => {
      const { name } = path.value.callee.property
      if (collector.nodes.method.has(name)) {
        const refValueNode = j.expressionStatement(
          j.callExpression(j.identifier(name), path.value.arguments)
        )

        path.replace(refValueNode)
      }
    })
}
