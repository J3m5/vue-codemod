import { getCntFunc } from '../../src/report'
import type { ASTTransformation } from '../../src/wrapAstTransformation'
import wrap from '../../src/wrapAstTransformation'

import { transformComputed } from './transformComputed'
import { transformData } from './transformData'
import { transformMethods } from './transformMethods'
import { transformProps } from './transformProps'

import { transformFilters } from './filters'
import { insertNodes } from './insertNodes'
import { transformRefs } from './tranformRefs'
import { removeThis } from './transformThis'
import { transformWatchers } from './transformWatchers'
import { Collector } from './utils'
import { addImports } from './addImports'

const getCollector = (): Collector => ({
  nodes: {
    imports: [],
    props: [],
    data: new Map(),
    ref: new Map(),
    computed: new Map(),
    method: new Map(),
    watch: []
  },
  propsNames: []
})

export const transformAST: ASTTransformation = ({ root, j }) => {
  const cntFunc = getCntFunc('props', global.outputReport)
  const collector = getCollector()
  const defaultExport = root.find(j.ExportDefaultDeclaration)

  transformProps({ defaultExport, collector })

  transformData({ defaultExport, collector })

  transformRefs({ defaultExport, collector })
  transformMethods({ defaultExport, collector })

  transformFilters({ defaultExport, collector })

  transformComputed({ defaultExport, collector })

  transformWatchers({ defaultExport, collector })

  removeThis(defaultExport, collector)

  addImports({ defaultExport, collector })

  insertNodes({ defaultExport, collector })
  defaultExport.remove()

  cntFunc()
}

export default wrap(transformAST)
export const parser = 'babylon'
