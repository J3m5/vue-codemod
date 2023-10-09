import { getCntFunc } from '../../src/report'
import type { ASTTransformation } from '../../src/wrapAstTransformation'
import wrap from '../../src/wrapAstTransformation'

import { transformComputed } from './transformComputed'
import { transformData } from './transformData'
import { transformMethods } from './transformMethods'
import { transformProps } from './transformProps'

import { transformFilters } from './filters'
import { transformRefs } from './tranformRefs'
import { removeThis } from './transformThis'
import { transformWatchers } from './transformWatchers'
import { Collector } from './utils'
import { insertNodes } from './insertNodes'

const collector: Collector = {
  dataNodes: [],
  refs: [],
  refNodes: [],
  propsNames: [],
  propsNodes: [],
  methodNames: [],
  methodNodes: [],
  computedNodes: [],
  watchNodes: [],
  newImports: {
    vue: new Set(),
    'vue-router': new Set(),
    vuex: new Set()
  }
}
export const transformAST: ASTTransformation = ({ root, j }) => {
  const cntFunc = getCntFunc('props', global.outputReport)

  const defaultExport = root.find(j.ExportDefaultDeclaration)

  transformProps({ defaultExport, collector })

  transformData({ defaultExport, collector })

  transformRefs({ defaultExport, collector })
  transformMethods({ defaultExport, collector })

  transformFilters({ defaultExport, collector })

  transformComputed({ defaultExport, collector })

  transformWatchers({ defaultExport, collector })

  removeThis(defaultExport, collector)

  insertNodes({ defaultExport, collector })
  defaultExport.remove()

  cntFunc()
}

export default wrap(transformAST)
export const parser = 'babylon'
