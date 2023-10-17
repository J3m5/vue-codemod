import type { Node } from 'vue-eslint-parser/ast/nodes'
import { getFixOperations } from '../../src/operationUtils'

import {
  createTransformAST,
  default as wrap
} from '../../src/wrapVueTransformation'

export const transformAST = createTransformAST(
  nodeFilter,
  fix,
  'popover-rename-attribute'
)
export default wrap(transformAST)

const renameMap = new Map([
  ['open-delay', 'show-after'],
  ['close-delay', 'hide-after']
])

function nodeFilter(node: Node): boolean {
  return (
    node.type === 'VIdentifier' &&
    renameMap.has(node.name) &&
    node.parent?.parent?.parent?.type === 'VElement' &&
    node.parent?.parent?.parent?.name === 'el-popover'
  )
}

function fix(node: Node) {
  return getFixOperations(node, renameMap)
}
