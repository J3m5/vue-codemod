import type { JSCodeshift, Core, API } from 'jscodeshift'
import { cliInstance } from './report'
import type { FileInfo } from './testUtils'

export type Context = {
  root: ReturnType<Core>
  j: JSCodeshift
  filename?: string
}

export type Params = {
  [param: string]: string | boolean | number | undefined | string[] | Params
}

export type ASTTransformation<OtherParams = object> = {
  (context: Context, params?: Params & OtherParams): void
}

global.subRules = {}

const parseSource = (file: FileInfo, j: JSCodeshift) => {
  try {
    return j(file.source)
  } catch (err) {
    cliInstance.stop()
    console.error(
      `JSCodeshift failed to parse ${file.path},` +
        ` please check whether the syntax is valid`,
    )
  }
}

const getTransformFile =
  (transformAST: ASTTransformation) =>
  (file: FileInfo, api: API, options?: Params) => {
    const j = api.jscodeshift
    const root = parseSource(file, j)
    if (!root) return

    transformAST({ root, j, filename: file.path }, options)

    return root.toSource({ lineTerminator: '\n' })
  }

const astTransformationToJSCodeshiftModule = (
  transformAST: ASTTransformation,
) => getTransformFile(transformAST)

export default astTransformationToJSCodeshiftModule
