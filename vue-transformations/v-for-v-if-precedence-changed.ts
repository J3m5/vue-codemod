import type { Node, VAttribute, VDirective } from 'vue-eslint-parser/ast/nodes'
import {
  insertTextAfter,
  insertTextBefore,
  remove
} from '../src/operationUtils'
import type { Operation } from '../src/operationUtils'

import {
  createTransformAST,
  default as wrap
} from '../src/wrapVueTransformation'

export const transformAST = createTransformAST(
  nodeFilter,
  fix,
  'v-for-v-if-precedence-changed'
)

export default wrap(transformAST)

function nodeFilter(node: Node): boolean {
  return (
    node.type === 'VAttribute' &&
    node.directive &&
    node.key.name.name === 'for' &&
    node.parent.attributes.length > 1
  )
}

function fix(node: Node, source: string): Operation[] {
  const fixOperations: Operation[] = []
  const target = node!.parent
  let forValue: string = source.slice(node.range[0], node.range[1])
  let keyNode: VAttribute | VDirective | undefined = undefined
  let ifNode: boolean = false
  if (!!target && 'attributes' in target && target.attributes.length) {
    for (const findKeyNode of target.attributes) {
      if (
        'argument' in findKeyNode.key &&
        !!findKeyNode.key.argument &&
        'name' in findKeyNode.key.argument &&
        findKeyNode.key.argument.name === 'key'
      ) {
        keyNode = findKeyNode
      }

      if (
        'key' in findKeyNode &&
        'name' in findKeyNode.key &&
        typeof findKeyNode.key.name === 'object' &&
        'name' in findKeyNode.key.name &&
        findKeyNode.key.name.name === 'if'
      ) {
        ifNode = true
      }
    }
  }

  if (ifNode) {
    if (keyNode) {
      const keyValue: string = source.slice(keyNode.range[0], keyNode.range[1])
      forValue += ' ' + keyValue
      fixOperations.push(remove(keyNode))
    }
    fixOperations.push(remove(node))
    if (!!target && 'parent' in target && !!target.parent) {
      fixOperations.push(
        insertTextBefore(target.parent, `<template ${forValue}>\n`)
      )
      fixOperations.push(insertTextAfter(target.parent, `\n</template>`))
    }
  }

  return fixOperations
}
