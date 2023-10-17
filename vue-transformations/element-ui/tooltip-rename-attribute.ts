import type { Node } from 'vue-eslint-parser/ast/nodes'
import { getFixOperations } from '../../src/operationUtils'

import {
  default as wrap,
  createTransformAST
} from '../../src/wrapVueTransformation'

export const transformAST = createTransformAST(
  nodeFilter,
  fix,
  'tooltip-rename-attribute'
)
export default wrap(transformAST)

const renameMap = new Map([
  ['open-delay', 'show-after'],
  ['hide-after', 'auto-close']
])

function nodeFilter(node: Node): boolean {
  return (
    node.type === 'VIdentifier' &&
    renameMap.has(node.name) &&
    node.parent?.parent?.parent?.type === 'VElement' &&
    node.parent?.parent?.parent?.name === 'el-tooltip'
  )
}

function fix(node: Node) {
  return getFixOperations(node, renameMap)
}
