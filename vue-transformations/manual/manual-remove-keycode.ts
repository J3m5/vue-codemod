import { Node } from 'vue-eslint-parser/ast/nodes'
import type { Operation } from '../../src/operationUtils'
import type {
  Context,
  VueASTTransformation
} from '../../src/wrapVueTransformation'
import { parse, AST } from 'vue-eslint-parser'
import wrap from '../../src/wrapVueTransformation'
import { VuePushManualList } from '../../src/report'

export const transformAST: VueASTTransformation = context => {
  const fixOperations: Operation[] = []
  findNodes(context)
  return fixOperations
}

export default wrap(transformAST)

function findNodes(context: Context) {
  const { file } = context
  const source = file.source
  const options = { sourceType: 'module' }
  const ast = parse(source, options)
  const toFixNodes: Node[] = []
  const root: Node = <Node>ast.templateBody
  const key = /^key{1}/
  const number = /^\d+/
  AST.traverseNodes(root, {
    enterNode(node: Node) {
      if (
        node.type === 'VDirectiveKey' &&
        node?.name?.name === 'on' &&
        node.argument &&
        'name' in node.argument &&
        key.test(node.argument.name) &&
        number.test(node?.modifiers[0]?.name)
      ) {
        toFixNodes.push(node)
      }
    },
    leaveNode() {}
  })

  toFixNodes.forEach(node => {
    const path = file.path
    const name = 'Removed keyCodes modifiers'
    const suggest =
      'For those using keyCode in their codebase, we recommend converting them to their kebab-cased named equivalents.'
    const website =
      'https://v3-migration.vuejs.org/breaking-changes/keycode-modifiers.html'
    VuePushManualList(path, node, name, suggest, website)
  })
}
