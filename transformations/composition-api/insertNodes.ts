// import j from 'jscodeshift'

import { insertImports } from './imports'
import type { TransformParams } from './utils'

export const insertNodes = ({ defaultExport, collector }: TransformParams) => {
  // Find the methods of the default export object
  insertImports({ defaultExport, collector })

  defaultExport.insertBefore(Object.values(collector.propsNodes))

  defaultExport.insertBefore(Object.values(collector.propsNodes))
  defaultExport.insertBefore(Object.values(collector.dataNodes))
  defaultExport.insertBefore(Object.values(collector.refNodes))

  defaultExport.insertBefore(Object.values(collector.computedNodes))

  defaultExport.insertBefore(Object.values(collector.methodNodes))
  defaultExport.insertBefore(Object.values(collector.watchNodes))
}
