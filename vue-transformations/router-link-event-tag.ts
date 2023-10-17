import type { Node, VElement } from 'vue-eslint-parser/ast/nodes'
import type { Operation } from '../src/operationUtils'
import {
  getText,
  insertTextAfter,
  remove,
  replaceText
} from '../src/operationUtils'
import {
  createTransformAST,
  default as wrap
} from '../src/wrapVueTransformation'

export const transformAST = createTransformAST(
  nodeFilter,
  fix,
  'router-link-event-tag'
)

export default wrap(transformAST)

function nodeFilter(node: Node): boolean {
  // filter for router-link node
  return node.type === 'VElement' && node.name === 'router-link'
}

function fix(node: Node, source: string): Operation[] {
  node = <VElement>node
  const fixOperations: Operation[] = []

  // get tag attribute and event attribute value
  // get other attribute text
  let tagValue, eventValue
  const attrTexts: string[] = []
  node.startTag.attributes.forEach(attr => {
    if (attr.type === 'VAttribute') {
      const name = attr.key.name
      if (name === 'tag' && attr.value?.type === 'VLiteral') {
        tagValue = attr.value.value
      } else if (name === 'event' && attr.value?.type === 'VLiteral') {
        eventValue = attr.value.value
      } else {
        attrTexts.push(getText(attr, source))
      }
    }
  })
  const attrText = attrTexts.join(' ')

  if (tagValue || eventValue) {
    // convert event attribute to new syntax
    eventValue = eventValue || ['click']
    if (typeof eventValue === 'string') {
      if ((<string>eventValue).includes(',')) {
        eventValue = JSON.parse((<string>eventValue).replace(/'/g, '"'))
      } else {
        eventValue = [eventValue]
      }
    }
    const event = eventValue
      .map((value: string) => `@${value}="navigate"`)
      .join(' ')

    // get tag attribute value and router-link text
    tagValue = tagValue || 'a'
    const text = getText(node.children[0], source)

    // convert to new syntax
    fixOperations.push(
      replaceText(
        node.startTag,
        `<router-link ${attrText} custom v-slot="{ navigate }">`
      )
    )
    fixOperations.push(remove(node.children[0]))
    fixOperations.push(
      insertTextAfter(
        node.startTag,
        `<${tagValue} ${event}>${text}</${tagValue}>`
      )
    )
  }

  return fixOperations
}
