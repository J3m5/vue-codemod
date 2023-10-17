import { Node, VElement } from 'vue-eslint-parser/ast/nodes'
import type { Operation } from '../src/operationUtils'
import {
  getText,
  insertTextAfter,
  insertTextBefore,
  replaceText
} from '../src/operationUtils'
import {
  createTransformAST,
  default as wrap
} from '../src/wrapVueTransformation'

export const transformAST = createTransformAST(
  nodeFilter,
  fix,
  'router-view-keep-alive-transition'
)

export default wrap(transformAST)

function nodeFilter(node: Node): boolean {
  // filter for transition node
  return (
    node.type === 'VElement' &&
    node.name === 'transition' &&
    node.children.length > 0
  )
}

function fix(node: Node, source: string): Operation[] {
  const fixOperations: Operation[] = []

  // find transition nodes which contain router-view node.
  // note that router-view tag may under the keep-alive tag
  let routerView
  const children = (<VElement>node).children
  const keepAlive = children.find(child => {
    return (
      child.type === 'VElement' &&
      child.name === 'keep-alive' &&
      child.children.length
    )
  })
  if (keepAlive) {
    routerView = (<VElement>keepAlive).children.find(child => {
      return child.type === 'VElement' && child.name === 'router-view'
    })
  } else {
    routerView = (<VElement>node).children.find(child => {
      return child.type === 'VElement' && child.name === 'router-view'
    })
  }

  // replace with vue-router-next syntax
  if (routerView) {
    routerView = <VElement>routerView
    // get attributes text
    const attributeText = routerView.startTag.attributes
      .map(attr => getText(attr, source))
      .join(' ')
    // replace with vue-router-next syntax
    fixOperations.push(replaceText(routerView, '<component :is="Component" />'))
    fixOperations.push(
      insertTextBefore(
        node,
        `<router-view ${attributeText} v-slot="{ Component }">`
      )
    )
    fixOperations.push(insertTextAfter(node, '</router-view>'))
  }

  return fixOperations
}
