import wrap from '../../src/wrapAstTransformation'
import type { ASTTransformation } from '../../src/wrapAstTransformation'
import type { namedTypes } from 'ast-types'
import { getCntFunc } from '../../src/report'

/**
 * Process component names that have been changed in element plus
 * @param content
 */
export const transformAST: ASTTransformation = ({ root, j }) => {
  const cntFunc = getCntFunc('element-plus-upgrade', subRules)
  // find element-ui import
  const elementPlusImport = root.find(j.ImportDeclaration, {
    source: {
      value: 'element-plus'
    }
  })

  if (elementPlusImport.length) {
    elementPlusImport.forEach(({ node }) => {
      const newSpecifier: (
        | namedTypes.ImportSpecifier
        | namedTypes.ImportDefaultSpecifier
      )[] = []
      if (!node.specifiers) return
      node.specifiers.forEach(importNode => {
        cntFunc()
        if (importNode.type === 'ImportSpecifier') {
          newSpecifier.push(
            j.importSpecifier(
              j.identifier('El' + importNode.local?.name),
              importNode.local
            )
          )
          node.specifiers = newSpecifier
        } else if (
          importNode.local &&
          typeof importNode.local.name === 'string'
        ) {
          newSpecifier.push(
            j.importDefaultSpecifier(j.identifier(importNode.local.name))
          )
          node.specifiers = newSpecifier
        }
      })
    })
  }
}

export default wrap(transformAST)
export const parser = 'babylon'
