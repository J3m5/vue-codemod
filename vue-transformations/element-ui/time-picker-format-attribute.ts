import { Node, VAttribute, VDirective } from 'vue-eslint-parser/ast'
import type { Operation } from '../../src/operationUtils'
import { insertTextBefore } from '../../src/operationUtils'
import {
  createTransformAST,
  default as wrap
} from '../../src/wrapVueTransformation'

export const transformAST = createTransformAST(
  nodeFilter,
  fix,
  'time-picker-format-attribute'
)
export default wrap(transformAST)

function nodeFilter(node: Node): boolean {
  const pre = (item: VAttribute | VDirective) =>
    // @ts-ignore
    item.key.name === 'bind' && item.key.argument?.name === 'format'
  return (
    node.type === 'VAttribute' &&
    node.key.type === 'VDirectiveKey' &&
    node.key.name?.name === 'bind' &&
    // @ts-ignore
    node.key.argument?.name === 'picker-options' &&
    node.value?.type === 'VExpressionContainer' &&
    node.value.expression?.type === 'ObjectExpression' &&
    // @ts-ignore
    node.value.expression.properties?.filter(item => item.key.name === 'format')
      .length > 0 &&
    node.parent?.parent.type === 'VElement' &&
    node.parent.parent?.name === 'el-time-picker' &&
    node.parent.attributes?.filter(attribute => pre(attribute)).length === 0
  )
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function fix(node: Node, source: string): Operation[] {
  const fixOperations: Operation[] = []
  //  get format attribute in the time-picker
  // @ts-ignore
  const formatValue = node.value.expression.properties.filter(
    // @ts-ignore
    item => item.key.name === 'format'
  )[0].value.value
  //  add format attribute to el-time-picker tag
  fixOperations.push(insertTextBefore(node, `format='${formatValue}' `))
  return fixOperations
}
