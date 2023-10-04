import createDebug from 'debug'
import type { Node } from 'vue-eslint-parser/ast/nodes'
import { remove, type Operation } from '../src/operationUtils'
import {
  createTransformAST,
  default as wrap
} from '../src/wrapVueTransformation'

const debug = createDebug('vue-codemod:rule')

export const transformAST = createTransformAST(nodeFilter, fix, 'v-else-if-key')

export default wrap(transformAST)

function nodeFilter(node: Node): boolean {
  // filter for slot attribute node
  return (
    node.type === 'VAttribute' &&
    node.key.type === 'VIdentifier' &&
    node.key.name === 'key'
  )
}

/**
 * The repair logic for
 * @param node The Target Node
 */
function fix(node: any): Operation[] {
  const fixOperations: Operation[] = []
  const target: any = node!.parent!.parent

  // The current node has no attribute that is v-for
  let hasTargetAttr: boolean = false
  target.startTag.attributes
    .filter(
      (attr: any) =>
        attr.type === 'VAttribute' &&
        attr.key.type === 'VDirectiveKey' &&
        (attr.key.name.name === 'if' ||
          attr.key.name.name === 'else-if' ||
          attr.key.name.name === 'else')
    )
    .forEach(() => {
      hasTargetAttr = true
    })
  if (!hasTargetAttr) {
    debug('No operator, target element is not if/else-if/else.')
    return fixOperations
  }

  fixOperations.push(remove(node))

  return fixOperations
}
