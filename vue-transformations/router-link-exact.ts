import { Node, VElement } from 'vue-eslint-parser/ast/nodes'
import type { Operation } from '../src/operationUtils'
import { remove } from '../src/operationUtils'
import {
  createTransformAST,
  default as wrap
} from '../src/wrapVueTransformation'

export const transformAST = createTransformAST(
  nodeFilter,
  fix,
  'router-link-exact'
)

export default wrap(transformAST)

function nodeFilter(node: Node): boolean {
  // filter for router-link node
  return node.type === 'VElement' && node.name === 'router-link'
}

function fix(node: Node) {
  node = <VElement>node
  const fixOperations: Operation[] = []

  // remove 'exact' attribute in router-link
  node.startTag.attributes.forEach(attr => {
    if (attr.type === 'VAttribute' && attr.key.name === 'exact') {
      fixOperations.push(remove(attr))
    }
  })

  return fixOperations
}
