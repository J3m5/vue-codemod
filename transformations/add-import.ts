import wrap from '../src/wrapAstTransformation'
import type { ASTTransformation } from '../src/wrapAstTransformation'

type DefaultSpecifierParam = {
  type: 'default'
  local: string
}

type NamedSpecifierParam = {
  type: 'named'
  imported: string
  local?: string
}

type NamespaceSpecifierParam = {
  type: 'namespace'
  local: string
}

type Params = {
  specifier?:
    | DefaultSpecifierParam
    | NamedSpecifierParam
    | NamespaceSpecifierParam
  source?: string
}

export const transformAST: ASTTransformation<Params> = (
  { root, j },
  params = {},
) => {
  let localBinding: string | undefined
  if (params?.specifier?.type === 'named') {
    localBinding = params?.specifier.local || params?.specifier.imported
  } else {
    localBinding = params?.specifier?.local
  }

  if (!localBinding) {
    return
  }

  const duplicate = root.find(j.ImportDeclaration, {
    specifiers: (arr) =>
      !!arr?.some((s) => s && s?.local?.name === localBinding),
    source: {
      value: params?.source,
    },
  })
  if (duplicate.length) {
    return
  }

  let newImportSpecifier
  if (params?.specifier?.type === 'default') {
    newImportSpecifier = j.importDefaultSpecifier(
      j.identifier(params?.specifier.local),
    )
  } else if (params?.specifier?.type === 'named') {
    newImportSpecifier = j.importSpecifier(
      j.identifier(params?.specifier.imported),
      j.identifier(localBinding),
    )
  } else {
    // namespace
    newImportSpecifier = j.importNamespaceSpecifier(j.identifier(localBinding))
  }

  const matchedDecl = root.find(j.ImportDeclaration, {
    source: {
      value: params.source,
    },
  })
  if (
    matchedDecl.length &&
    !matchedDecl.find(j.ImportNamespaceSpecifier).length
  ) {
    // add new specifier to the existing import declaration
    matchedDecl.get(0).node.specifiers.push(newImportSpecifier)
  } else if (params.source) {
    const newImportDecl = j.importDeclaration(
      [newImportSpecifier],
      j.stringLiteral(params.source),
    )

    const lastImportDecl = root.find(j.ImportDeclaration).at(-1)
    if (lastImportDecl.length) {
      // add the new import declaration after all other import declarations
      lastImportDecl.insertAfter(newImportDecl)
    } else {
      // add new import declaration at the beginning of the file
      root.get().node.program.body.unshift(newImportDecl)
    }
  }
}

export default wrap(transformAST)
export const parser = 'babylon'
