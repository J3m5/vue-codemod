import wrap from '../../src/wrapAstTransformation'
import type { ASTTransformation } from '../../src/wrapAstTransformation'
import { getCntFunc } from '../../src/report'

import { transformProps } from './transformProps'
import { transformData } from './transformData'
import { transformMethods } from './transformMethods'
import { transformComputed } from './transformComputed'

export const transformAST: ASTTransformation = ({ root, j }) => {
  const cntFunc = getCntFunc('props', global.outputReport)

  // Find the default export object

  const defaultExport = root.find(j.ExportDefaultDeclaration)

  transformProps({ defaultExport, j })

  transformData({ defaultExport, j })

  transformMethods({ defaultExport, j })

  transformComputed({ defaultExport, j })

  // Remove the default export

  defaultExport.remove()

  cntFunc()
}

export default wrap(transformAST)
export const parser = 'babylon'
