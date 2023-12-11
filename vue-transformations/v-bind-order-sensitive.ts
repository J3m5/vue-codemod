import type { Node } from 'vue-eslint-parser/ast/nodes'
import type { Operation } from '../src/operationUtils'
import { insertTextBefore, remove, removeRange } from '../src/operationUtils'

import {
  createTransformAST,
  default as wrap
} from '../src/wrapVueTransformation'

export const transformAST = createTransformAST(
  nodeFilter,
  fix,
  'v-bind-order-sensitive'
)

export default wrap(transformAST)

function nodeFilter(node: Node) {
  return (
    node.type === 'VAttribute' &&
    node.directive &&
    node.key.name.name === 'bind' &&
    node.parent.attributes.length > 1
  )
}

function fix(node: Node, source: string) {
  const fixOperations: Operation[] = []
  // get parent node
  const target = node?.parent
  // get the value of v-bind according to the range
  const bindValue = source.slice(node.range[0], node.range[1]) + ' '
  // remove node
  if (target && 'attributes' in target) {
    if (target.attributes[target.attributes.length - 1] === node) {
      fixOperations.push(remove(node))
    } else {
      fixOperations.push(removeRange([node.range[0], node.range[1] + 1]))
    }
    // add node to the first
    fixOperations.push(insertTextBefore(target.attributes[0], bindValue))
  }
  return fixOperations
}
