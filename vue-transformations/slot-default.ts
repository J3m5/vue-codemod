import type { Node } from 'vue-eslint-parser/ast/nodes'
import type { Operation } from '../src/operationUtils'
import { remove } from '../src/operationUtils'
import {
  createTransformAST,
  default as wrap
} from '../src/wrapVueTransformation'

export const transformAST = createTransformAST(nodeFilter, fix, 'slot-default')

export default wrap(transformAST)

function nodeFilter(node: Node): boolean {
  return (
    node.type === 'VAttribute' &&
    node.key.type === 'VDirectiveKey' &&
    node.key.name.name === 'slot' &&
    node.key.argument?.type === 'VIdentifier' &&
    node.key.argument?.name === 'default' &&
    node.parent.parent.type == 'VElement' &&
    node.parent.parent.name == 'template'
  )
}

function fix(node: Node): Operation[] {
  const fixOperations: Operation[] = []

  const target: any = node!.parent!.parent
  const targetParent: any = target.parent

  targetParent.children
    .filter((el: any) => el.type == 'VElement' && el.name != 'template')
    .forEach((element: any) => {
      fixOperations.push(remove(element))
    })
  return fixOperations
}
