import j from 'jscodeshift'
import type { TransformParams } from './types'
import { hooks } from './transformLifecycle'

const vueImports = ['computed', 'watch', 'ref'] as const

const buildImport = (importKeys: string[], importSource: string) => {
  const keyIds = importKeys.map(key => j.importSpecifier(j.identifier(key)))
  return j.importDeclaration(keyIds, j.literal(importSource))
}

const addVueImports = ({ collector }: Pick<TransformParams, 'collector'>) => {
  const importKeys = vueImports.filter(key => {
    const nodes = collector.nodes[key]
    return Array.isArray(nodes) ? nodes.length : nodes.size
  })
  const lifecycleKeys = Object.values(hooks.lifecycle)

  const imports = buildImport([...importKeys, ...lifecycleKeys], 'vue')

  collector.nodes.imports.push(imports)
}

const routerImports = ['onBeforeRouteUpdate', 'onBeforeRouteLeave'] as const

const addRouterImports = ({ collector, defaultExport }: TransformParams) => {
  const importKeys = routerImports.filter(key => {
    return collector.nodes.routerHooks.has(key)
  })

  if (!importKeys.length) return

  const imports = buildImport(importKeys, 'vue-router')

  collector.nodes.imports.push(imports)

  defaultExport.find(j.MemberExpression)
}

export const addImports = ({ collector, defaultExport }: TransformParams) => {
  addVueImports({ collector })
  addRouterImports({ collector, defaultExport })
}
