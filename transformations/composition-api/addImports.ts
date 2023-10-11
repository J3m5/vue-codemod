import j from 'jscodeshift'
import type { TransformParams } from './utils'

export const addImports = ({ collector }: TransformParams) => {
  const importKeys = (['computed', 'watch', 'ref'] as const).filter(key => {
    const nodes = collector.nodes[key]
    return Array.isArray(nodes) ? nodes.length : nodes.size
  })

  const keyIds = importKeys.map(key => j.importSpecifier(j.identifier(key)))
  const imports = j.importDeclaration(keyIds, j.literal('vue'))

  collector.nodes.imports.push(imports)
}
