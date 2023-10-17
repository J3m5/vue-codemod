import type { Node } from 'vue-eslint-parser/ast/nodes'
import { getText, replaceText } from '../src/operationUtils'
import type { Operation } from '../src/operationUtils'

import {
  default as wrap,
  createTransformAST
} from '../src/wrapVueTransformation'

export const transformAST = createTransformAST(nodeFilter, fix, 'v-bind-sync')

export default wrap(transformAST)

function nodeFilter(node: Node): boolean {
  return (
    node.type === 'VAttribute' &&
    node.directive &&
    node.key.name.name === 'bind'
  )
}

/**
 * fix logic
 * @param node
 */
function fix(node: Node, source: string) {
  const fixOperations: Operation[] = []
  if (!('key' in node) || !('modifiers' in node.key) || !node.key.modifiers) {
    return fixOperations
  }

  const keyNode = node.key
  const argument = keyNode.argument
  const modifiers = keyNode.modifiers
  if (argument === null) {
    return fixOperations
  }

  const bindArgument = getText(argument, source)

  if (modifiers.length === 1 && modifiers[0].name === 'sync') {
    // .sync modifiers in v-bind should be replaced with v-model
    fixOperations.push(replaceText(keyNode, `v-model:${bindArgument}`))
  }

  return fixOperations
}
