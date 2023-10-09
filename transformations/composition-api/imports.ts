import j from 'jscodeshift'
import type { Imports, TransformParams } from './utils'

export const insertImports = ({
  defaultExport,
  collector
}: TransformParams) => {
  Object.keys(collector.newImports).forEach(key => {
    const importKeys = [...collector.newImports[key as Imports]]
    if (!importKeys.length) return
    const keyIds = importKeys.map(key => j.importSpecifier(j.identifier(key)))
    const imports = j.importDeclaration(keyIds, j.literal(key))

    defaultExport.insertBefore(imports)
  })
}
