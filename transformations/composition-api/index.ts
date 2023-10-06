import j from 'jscodeshift'

import wrap from '../../src/wrapAstTransformation'
import type { ASTTransformation } from '../../src/wrapAstTransformation'
import { getCntFunc } from '../../src/report'

import { transformProps } from './transformProps'
import { transformData } from './transformData'
import { transformMethods } from './transformMethods'
import { transformComputed } from './transformComputed'

import { Collection, MemberExpression } from 'jscodeshift'
import { Collector } from './utils'
import { addImports } from './imports'
import { transformRefs } from './tranformRefs'

const isVM = (node: MemberExpression) =>
  j.Identifier.check(node.object) &&
  'name' in node.object &&
  node.object.name === 'vm'

const isThis = (node: MemberExpression) => j.ThisExpression.check(node.object)

const removeThisAndVM = (collection: Collection, collector: Collector) => {
  collection.find(j.MemberExpression).forEach(path => {
    if (!('name' in path.value.property)) return
    const { name } = path.value.property
    if (typeof name !== 'string') return
    if (!(isVM(path.value) || isThis(path.value))) {
      return
    }

    const refNode = j.identifier(name)
    if (collector.refs.includes(name)) {
      const refValueNode = j.memberExpression(refNode, j.identifier('value'))
      path.replace(refValueNode)
    }
    if (collector.props.includes(name)) {
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

    if (collector.methods.includes(name)) {
      const refValueNode = j.expressionStatement(
        j.callExpression(j.identifier(name), path.value.arguments)
      )

      path.replace(refValueNode)
    }
  })
}

const collector: Collector = {
  refs: [],
  props: [],
  methods: [],
  newImports: {
    vue: new Set(),
    'vue-router': new Set(),
    vuex: new Set()
  }
}
export const transformAST: ASTTransformation = ({ root, j }) => {
  const cntFunc = getCntFunc('props', global.outputReport)
  // Find the default export object

  const defaultExport = root.find(j.ExportDefaultDeclaration)

  transformProps({ defaultExport, collector })

  transformData({ defaultExport, collector })

  transformRefs({ defaultExport, collector })
  transformMethods({ defaultExport, collector })

  transformComputed({ defaultExport, collector })

  // Remove the default export
  removeThisAndVM(defaultExport, collector)

  addImports({ defaultExport, collector })
  defaultExport.remove()

  cntFunc()
}

export default wrap(transformAST)
export const parser = 'babylon'
