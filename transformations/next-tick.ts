import wrap from '../src/wrapAstTransformation'
import type { ASTTransformation } from '../src/wrapAstTransformation'
import { getCntFunc } from '../src/report'
import { transformAST as transformAddImport } from './add-import'

export const transformAST: ASTTransformation = ({ root, j }) => {
  // find the Vue.nextTick(...)
  const nextTickCalls = root.find(j.CallExpression, n => {
    return (
      n.callee.type === 'MemberExpression' &&
      'name' in n.callee.property &&
      n.callee.property.name === 'nextTick' &&
      'name' in n.callee.object &&
      n.callee.object.name === 'Vue'
    )
  })

  if (nextTickCalls.length) {
    transformAddImport(
      // @ts-ignore
      { root, j },
      {
        specifier: {
          type: 'named',
          imported: 'nextTick'
        },
        source: 'vue'
      }
    )

    nextTickCalls.replaceWith(({ node }) => {
      const el = node.arguments[0]
      return j.callExpression(j.identifier('nextTick'), [el])
    })

    // stats
    const cntFunc = getCntFunc('next-tick', subRules)
    cntFunc()
  }
}

export default wrap(transformAST)
export const parser = 'babylon'
