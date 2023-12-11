import wrap from '../src/wrapAstTransformation'
import type { ASTTransformation } from '../src/wrapAstTransformation'

import { transformAST as addImport } from './add-import'
import { getCntFunc } from '../src/report'

export const transformAST: ASTTransformation = context => {
  const { root, j } = context
  // stats
  const cntFunc = getCntFunc('remove-contextual-h-from-render', subRules)
  const renderFns = root.find(j.ObjectProperty, n => {
    return (
      'name' in n.key &&
      n.key.name === 'render' &&
      (n.value.type === 'ArrowFunctionExpression' ||
        n.value.type === 'FunctionExpression')
    )
  })

  const renderMethods = root.find(j.ObjectMethod, {
    key: {
      name: 'render'
    },
    params: (params: object[]) =>
      j.Identifier.check(params[0]) && params[0].name === 'h'
  })

  if (renderFns.length || renderMethods.length) {
    addImport(context, {
      specifier: { type: 'named', imported: 'h' },
      source: 'vue'
    })

    renderFns.forEach(({ node }) => {
      if ('params' in node.value) {
        node.value.params.shift()
      }
    })

    renderMethods.forEach(({ node }) => {
      node.params.shift()
    })

    // stats
    cntFunc()
  }
}

export default wrap(transformAST)
export const parser = 'babylon'
