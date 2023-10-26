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

  console.log([...collector.nodes.lifecycleHooks.keys()])

  const lifecycleKeys = (
    Object.keys(hooks.lifecycle) as (keyof typeof hooks.lifecycle)[]
  )
    .filter(key => {
      return collector.nodes.lifecycleHooks.has(key)
    })
    .map(key => hooks.lifecycle[key])

  const imports = buildImport([...importKeys, ...lifecycleKeys], 'vue')

  collector.nodes.imports.push(imports)
}

const routerImports = ['onBeforeRouteUpdate', 'onBeforeRouteLeave'] as const

const addRouterImports = ({ collector }: TransformParams) => {
  const importKeys = routerImports.filter(key => {
    return collector.nodes.routerHooks.has(key)
  })

  if (!importKeys.length) return

  const imports = buildImport(importKeys, 'vue-router')

  collector.nodes.imports.push(imports)
}

export const addImports = ({ collector, defaultExport }: TransformParams) => {
  addVueImports({ collector })
  addRouterImports({ collector, defaultExport })
}
