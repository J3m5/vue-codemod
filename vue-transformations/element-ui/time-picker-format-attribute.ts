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
    item.key.name === 'bind' &&
    'argument' in item.key &&
    !!item.key.argument &&
    'name' in item.key.argument &&
    item.key.argument.name === 'format'
  return (
    node.type === 'VAttribute' &&
    node.key.type === 'VDirectiveKey' &&
    node.key.name.name === 'bind' &&
    'argument' in node.key &&
    !!node.key.argument &&
    'name' in node.key.argument &&
    node.key.argument.name === 'picker-options' &&
    node.value?.type === 'VExpressionContainer' &&
    node.value.expression?.type === 'ObjectExpression' &&
    node.value.expression.properties?.filter(
      item => 'key' in item && 'name' in item.key && item.key.name === 'format'
    ).length > 0 &&
    node.parent.parent.type === 'VElement' &&
    node.parent.parent.name === 'el-time-picker' &&
    node.parent.attributes?.filter(attribute => pre(attribute)).length === 0
  )
}

function fix(node: Node): Operation[] {
  const fixOperations: Operation[] = []
  //  get format attribute in the time-picker
  if (
    'value' in node &&
    typeof node.value === 'object' &&
    !!node.value &&
    'expression' in node.value &&
    !!node.value.expression &&
    'properties' in node.value.expression
  ) {
    const formatNode = node.value.expression.properties.filter(
      item => 'key' in item && 'name' in item.key && item.key.name === 'format'
    )[0]

    if ('value' in formatNode && 'value' in formatNode.value) {
      //  add format attribute to el-time-picker tag
      fixOperations.push(
        insertTextBefore(node, `format='${formatNode.value.value}' `)
      )
    }
  }
  return fixOperations
}
