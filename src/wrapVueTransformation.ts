import type { Operation } from './operationUtils'
// import type VueTransformation from './VueTransformation'
import { Node } from 'vue-eslint-parser/ast/nodes'
import * as parser from 'vue-eslint-parser'
import { getCntFunc } from './report'
import type { FileInfo } from 'jscodeshift'

const BOM = '\uFEFF'

export type Context = {
  file: FileInfo
}

export type VueASTTransformation = {
  (context: Context, params: object): Operation[]
  type?: string
}

export function createTransformAST(
  nodeFilter: (node: Node) => boolean,
  fix: (node: Node, source: string) => Operation[],
  ruleName: string
) {
  function findNodes(context: Context): Node[] {
    const { file } = context
    const source = file.source
    const options = { sourceType: 'module' }
    const ast = parser.parse(source, options)
    const toFixNodes: Node[] = []
    const root: Node = <Node>ast.templateBody

    parser.AST.traverseNodes(root, {
      enterNode(node: Node) {
        if (nodeFilter(node)) {
          toFixNodes.push(node)
        }
      },
      leaveNode() {}
    })

    return toFixNodes
  }

  const transformAST = (context: Context) => {
    const cntFunc = getCntFunc(ruleName, global.outputReport)
    let fixOperations: Operation[] = []
    const { file } = context
    const source = file.source
    const toFixNodes: Node[] = findNodes(context)
    toFixNodes.forEach(node => {
      const operations = fix(node, source)
      if (operations.length) {
        cntFunc()
        fixOperations = fixOperations.concat(operations)
      }
    })
    return fixOperations
  }

  return transformAST
}

export default function astTransformationToVueTransformationModule(
  transformAST: VueASTTransformation
) {
  const transform = (file: FileInfo, options: object) => {
    const source = file.source
    const fixOperations: Operation[] = transformAST({ file }, options)

    return applyOperation(source, fixOperations)
  }

  transform.type = 'vueTransformation'

  return transform
}

/**
 * Modify source files
 * @param sourceCode File's source code
 * @param tempOperations Modify the object
 */
export function applyOperation(
  sourceCode: string,
  tempOperations: Operation[]
) {
  // clone the array
  const bom = sourceCode.startsWith(BOM) ? BOM : '',
    text: string = bom ? sourceCode.slice(1) : sourceCode
  let lastPos: number = Number.MIN_VALUE,
    output: string = bom

  const applyOperations: Operation[] = []

  // The Lodash grouping function is called to group the objects in the array according to range
  const tempOperation: Operation | null = mergeOperations(tempOperations, text)
  if (tempOperation) {
    applyOperations.push(tempOperation)
  }

  for (const operation of applyOperations.sort(compareOperationsByRange)) {
    attemptOperation(operation)
  }

  // all fix were recovered.
  output += text.slice(Math.max(0, lastPos))

  return output

  /**
   * Try to use the 'operation' from a problem.
   * @param   {Message} problem The message object to apply operations from
   * @returns {boolean}         Whether operation was successfully applied
   */
  function attemptOperation(operation: Operation) {
    const start = operation.range[0]
    const end = operation.range[1]
    // Remain it as a problem if it's overlapped or it's a negative range
    if (lastPos >= start || start > end) {
      return false
    }

    // Remove BOM.
    if (
      (start < 0 && end >= 0) ||
      (start === 0 && operation.text.startsWith(BOM))
    ) {
      output = ''
    }

    // Make output to this operation.
    output += text.slice(Math.max(0, lastPos), Math.max(0, start))
    output += operation.text
    lastPos = end
    return true
  }
}

/**
 * Merges the given operations array into one.
 * @param {Operation[]} operations The operations to merge.
 * @param {SourceCode} sourceCode The source code object to get the text between operations.
 * @returns {{text: string, range: number[]}} The merged operations
 */
function mergeOperations(
  operations: Operation[],
  sourceCode: string
): Operation | null {
  if (operations.length === 0) {
    return null
  }
  if (operations.length === 1) {
    return operations[0]
  }

  operations.sort(compareOperationsByRange)

  const originalText = sourceCode
  const start = operations[0].range[0]
  const end = operations[operations.length - 1].range[1]
  let text: string = ''
  let lastPos: number = Number.MIN_SAFE_INTEGER

  for (const operation of operations) {
    if (operation.range[0] < lastPos) {
      continue
    }

    if (operation.range[0] >= 0) {
      text += originalText.slice(
        Math.max(0, start, lastPos),
        operation.range[0]
      )
    }
    text += operation.text
    lastPos = operation.range[1]
  }
  text += originalText.slice(Math.max(0, start, lastPos), end)
  return { range: [start, end], text } as Operation
}

/**
 * Compares items in a operations array by range.
 * @param {Operation} a The first message.
 * @param {Operation} b The second message.
 * @returns {int} -1 if a comes before b, 1 if a comes after b, 0 if equal.
 * @private
 */
function compareOperationsByRange(a: Operation, b: Operation): number {
  return a.range[0] - b.range[0] || a.range[1] - b.range[1]
}
