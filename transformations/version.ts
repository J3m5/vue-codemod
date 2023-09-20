import wrap from '../src/wrapAstTransformation'
import type { ASTTransformation } from '../src/wrapAstTransformation'
import { getCntFunc } from '../src/report'
import { transformAST as transformAddImport } from './add-import'

export const transformAST: ASTTransformation = ({ root, j }) => {
  // find Vue.version
  const versionCalls = root.find(j.MemberExpression, n => {
    return n.property.name === 'version' && n.object.name === 'Vue'
  })

  if (versionCalls.length) {
    transformAddImport(
      // @ts-ignore
      { root, j },
      {
        specifier: {
          type: 'named',
          imported: 'version'
        },
        source: 'vue'
      }
    )

    versionCalls.replaceWith(({ node }) => {
      // @ts-ignore
      const property = node.property.name
      return j.identifier(property)
    })

    // stats
    const cntFunc = getCntFunc('version', subRules)
    cntFunc()
  }
}

export default wrap(transformAST)
export const parser = 'babylon'
