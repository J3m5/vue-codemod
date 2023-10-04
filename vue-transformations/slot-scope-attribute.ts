import type { Node } from 'vue-eslint-parser/ast/nodes'
import { replaceText, type Operation, getText } from '../src/operationUtils'
import {
  default as wrap,
  createTransformAST
} from '../src/wrapVueTransformation'

export const transformAST = createTransformAST(
  nodeFilter,
  fix,
  'slot-scope-attribute'
)

export default wrap(transformAST)

function nodeFilter(node: Node): boolean {
  // filter for slot attribute node
  return (
    node.type === 'VAttribute' &&
    node.directive &&
    node.key.name.name === 'slot-scope'
  )
}

/**
 * fix logic
 * @param node
 */
function fix(node: Node, source?: string) {
  const fixOperations: Operation[] = []
  if (!('value' in node) || !node.value || !('directive' in node) || !source) {
    return fixOperations
  }
  const element = node.parent.parent
  const scopeValue = getText(node.value, source)

  if (!!element && element.type == 'VElement' && element.name == 'template') {
    // template element replace slot-scope="xxx" to v-slot="xxx"
    fixOperations.push(replaceText(node, `v-slot=${scopeValue}`))
  }

  return fixOperations
}
