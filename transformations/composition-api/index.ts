import { getCntFunc } from '../../src/report'
import type { ASTTransformation } from '../../src/wrapAstTransformation'
import wrap from '../../src/wrapAstTransformation'

import { transformComputed } from './transformComputed'
import { transformData } from './transformData'
import { transformMethods } from './transformMethods'
import { transformProps } from './transformProps'

import { addImports } from './addImports'
import { transformFilters } from './filters'
import { insertNodes } from './insertNodes'
import { transformRefs } from './transformRefs'
import { transformLifeCycle } from './transformLifecycle'
import { removeThis } from './transformThis'
import { transformWatchers } from './transformWatchers'
import type { Collector } from './types'

const getCollector = (): Collector => ({
  nodes: {
    imports: [],
    props: [],
    ref: new Map(),
    reactive: new Map(),
    $refs: new Map(),
    computed: new Map(),
    method: new Map(),
    watch: [],
    lifecycleHooks: new Map(),
    routerHooks: new Map(),
  },
  comments: new Map(),
  propsNames: [],
})

export const transformAST: ASTTransformation = ({ root, j }, params) => {
  const cntFunc = getCntFunc('api-composition', global.outputReport)

  const collector = getCollector()

  const defaultExport = root.find(j.ExportDefaultDeclaration)

  transformProps({ defaultExport, collector, params })

  transformData({ defaultExport, collector })

  transformRefs({ defaultExport, collector })

  transformMethods({ defaultExport, collector })

  transformFilters({ defaultExport, collector })

  transformComputed({ defaultExport, collector })

  transformWatchers({ defaultExport, collector })

  transformLifeCycle({ defaultExport, collector })

  removeThis({ defaultExport, collector })

  addImports({ defaultExport, collector })

  insertNodes({ defaultExport, collector, root })

  // defaultExport.remove()

  cntFunc()
}

export default wrap(transformAST)
export const parser = 'babylon'
