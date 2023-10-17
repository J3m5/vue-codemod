import type { Node } from 'vue-eslint-parser/ast/nodes'
import { remove } from '../../src/operationUtils'
import type { Operation } from '../../src/operationUtils'

import {
  createTransformAST,
  default as wrap
} from '../../src/wrapVueTransformation'

export const transformAST = createTransformAST(
  nodeFilter,
  fix,
  'remove-row-type-flex'
)
export default wrap(transformAST)

function nodeFilter(node: Node): boolean {
  return (
    node.type === 'VAttribute' &&
    node.parent?.parent?.type === 'VElement' &&
    node.parent.parent.name === 'el-row' &&
    node.key?.type === 'VIdentifier' &&
    node.key.name === 'type' &&
    node.value?.type === 'VLiteral' &&
    node.value.value === 'flex'
  )
}

function fix(node: Node): Operation[] {
  const fixOperations: Operation[] = []
  fixOperations.push(remove(node))
  return fixOperations
}
