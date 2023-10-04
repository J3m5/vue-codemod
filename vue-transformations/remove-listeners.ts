import { Node } from 'vue-eslint-parser/ast/nodes'
import { z } from 'zod'
import { remove, type Operation } from '../src/operationUtils'
import {
  default as wrap,
  createTransformAST
} from '../src/wrapVueTransformation'

export const transformAST = createTransformAST(
  nodeFilter,
  fix,
  'remove-listeners'
)

export default wrap(transformAST)

const nodeSchema = z.object({
  type: z.literal('VAttribute'),
  key: z.object({
    type: z.literal('VDirectiveKey'),
    name: z.object({
      name: z.literal('on')
    })
  }),
  value: z.object({
    type: z.literal('VExpressionContainer'),
    expression: z.object({
      type: z.literal('Identifier'),
      name: z.literal('$listeners')
    })
  })
})

function nodeFilter(node: Node): boolean {
  const result = nodeSchema.safeParse(node)
  return result.success
}

function fix(node: Node) {
  const fixOperations: Operation[] = []
  fixOperations.push(remove(node))
  return fixOperations
}
