import jscodeshift, { Transform, Parser, FileInfo } from 'jscodeshift'

// @ts-ignore
import getParser from 'jscodeshift/src/getParser'
import createDebug from 'debug'

import { parse as parseSFC, stringify as stringifySFC } from './sfcUtils'
import type { SFCDescriptor } from './sfcUtils'

import VueTransformation from './VueTransformation'

type getParserType = (
  parserName: string,
  options?: Record<PropertyKey, unknown>
) => Parser

const debug = createDebug('vue-codemod:run')

type JSTransformation = Transform & {
  type: 'JSTransformation'
  parser?: string | Parser
}

type JSTransformationModule =
  | JSTransformation
  | {
      default: Transform
      parser?: string | Parser
    }

type VueTransformationModule =
  | VueTransformation
  | {
      default: VueTransformation
    }

export type TransformationModule =
  | JSTransformationModule
  | VueTransformationModule
  | Transform

const getTransformation = (module: TransformationModule) => {
  if ('default' in module) {
    return module.default
  } else {
    return module
  }
}

export default function runTransformation(
  fileInfo: FileInfo,
  transformationModule: TransformationModule,
  params: object = {}
) {
  const transformation = getTransformation(transformationModule)

  const { path, source } = fileInfo
  const extension = (/\.([^.]*)$/.exec(path) || [])[0] as string
  let lang = extension.slice(1)
  let descriptor: SFCDescriptor

  if ('type' in transformation && transformation.type === 'vueTransformation') {
    if (extension === '.vue') {
      descriptor = parseSFC(source, { filename: path }).descriptor
    } else {
      // skip non .vue files
      return source
    }

    // skip .vue files without template block
    if (!descriptor.template) {
      debug('skip .vue files without template block.')
      return source
    }
    const contentStart: number =
      descriptor.template.ast.children[0].loc.start.offset
    const contentEnd: number =
      descriptor.template.ast.children[
        descriptor.template.ast.children.length - 1
      ].loc.end.offset + 1
    const astStart = descriptor.template.ast.loc.start.offset
    const astEnd = descriptor.template.ast.loc.end.offset + 1

    fileInfo.source = descriptor.template.ast.loc.source

    const out = transformation(fileInfo, params)

    if (!out) {
      return source
    }

    // need to reconstruct the .vue file from descriptor blocks
    if (extension === '.vue') {
      if (out === descriptor!.template!.content) {
        return source // skipped, don't bother re-stringifying
      }
      // remove redundant <template> tag
      descriptor!.template!.content = out.slice(
        contentStart - astStart,
        contentEnd - astEnd
      )
      return stringifySFC(descriptor!)
    }

    return out
  } else {
    debug('Running jscodeshift transform')

    if (extension === '.vue') {
      descriptor = parseSFC(source, { filename: path }).descriptor

      // skip .vue files without script block
      if (!descriptor.script) {
        debug('skip .vue files without script block.')
        return source
      }

      global.scriptLine = descriptor.script.loc.start.line

      lang = descriptor.script.lang || 'js'
      fileInfo.source = descriptor.script.content
    }

    // let parser = getParser()
    let parserName =
      'parser' in transformationModule ? transformationModule.parser : undefined

    // force inject `parser` option for .tsx? files, unless the module specifies a custom implementation
    if (typeof parserName !== 'object') {
      if (lang.startsWith('ts')) {
        parserName = lang
      }
    }

    if (parserName) {
      parserName =
        typeof parserName === 'string'
          ? (getParser as getParserType)(parserName)
          : parserName
    } else {
      return
    }

    const j = jscodeshift.withParser(parserName)
    const api = {
      j,
      jscodeshift: j,
      stats: () => {},
      report: () => {}
    }

    const out = transformation(fileInfo, api, params)
    if (!out) {
      return source // skipped
    }

    // need to reconstruct the .vue file from descriptor blocks
    if (extension === '.vue') {
      if (out === descriptor!.script!.content) {
        return source // skipped, don't bother re-stringifying
      }

      descriptor!.script!.content = out
      return stringifySFC(descriptor!)
    }

    return out
  }
}
