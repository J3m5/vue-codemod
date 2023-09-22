import wrap from '../src/wrapAstTransformation'
import type { ASTTransformation, Context } from '../src/wrapAstTransformation'

const getSpecifier = ({
  root,
  j,
  localBinding
}: {
  root: Context['root']
  j: Context['j']
  localBinding?: string
}) => {
  if (!localBinding) {
    return
  }

  const namedImportCollection = root.find(j.ImportSpecifier, {
    local: {
      name: localBinding
    }
  })

  if (namedImportCollection.length) {
    return namedImportCollection
  }
  const importDefaultCollection = root.find(j.ImportDefaultSpecifier, {
    local: {
      name: localBinding
    }
  })
  if (importDefaultCollection.length) {
    return importDefaultCollection
  }

  const importNamespaceCollection = root.find(j.ImportNamespaceSpecifier, {
    local: {
      name: localBinding
    }
  })
  if (importNamespaceCollection.length) {
    return importNamespaceCollection
  }
}

/**
 * Note:
 * here we don't completely remove the import declaration statement
 * if all import specifiers are removed.
 * For example, `import foo from 'bar'`,
 * if `foo` is unused, the statement would become `import 'bar'`.
 * It is because we are not sure if the module contains any side effects.
 */
export const transformAST: ASTTransformation = (
  { root, j }: Context,
  { localBinding }: { localBinding?: string } = {}
) => {
  const usages = root
    .find(j.Identifier, { name: localBinding })
    .filter(identifierPath => {
      const parent = identifierPath.parent.node

      // Ignore the import specifier
      if (
        j.ImportDefaultSpecifier.check(parent) ||
        j.ImportSpecifier.check(parent) ||
        j.ImportNamespaceSpecifier.check(parent)
      ) {
        return false
      }

      // Ignore properties in MemberExpressions
      if (
        j.MemberExpression.check(parent) &&
        parent.property === identifierPath.node
      ) {
        return false
      }

      // Ignore keys in ObjectProperties
      if (
        j.ObjectProperty.check(parent) &&
        parent.key === identifierPath.node &&
        parent.value !== identifierPath.node
      ) {
        return false
      }

      return true
    })

  if (!usages.length) {
    const importCollection = getSpecifier({ root, j, localBinding })

    if (!importCollection || !importCollection.length) {
      return
    }

    const decl = importCollection.closest(j.ImportDeclaration)
    const declNode = decl.get(0).node
    const peerSpecifiers = declNode.specifiers
    const source = declNode.source.value

    // these modules are known to have no side effects
    const safelyRemovableModules = [
      'vue',
      'vue-router',
      'vuex',
      '@vue/composition-api'
    ]
    if (
      peerSpecifiers.length === 1 &&
      safelyRemovableModules.includes(source)
    ) {
      decl.remove()
    } else {
      // otherwise, only remove the specifier
      importCollection.remove()
    }
  }
}

export default wrap(transformAST)
export const parser = 'babylon'
