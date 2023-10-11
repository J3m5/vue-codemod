import type { Options, API } from 'jscodeshift'
import jscodeshift from 'jscodeshift'
import type { TestOptions } from 'jscodeshift/src/testUtils'
import fs from 'node:fs'
import path from 'node:path'
import transformationMap from '../transformations'
import vueTransformationMap from '../vue-transformations'
import runTransformation from './runTransformation'
import { test, expect, describe } from 'bun:test'

export type FileInfo =
  | { path?: string; source: string }
  | { path: string; source: string }
export interface Transform {
  /**
   * If a string is returned and it is different from passed source, the transform is considered to be successful.
   * If a string is returned but it's the same as the source, the transform is considered to be unsuccessful.
   * If nothing is returned, the file is not supposed to be transformed (which is ok).
   */
  (file: FileInfo, api: API, options: Options): string | null | undefined | void
  parser?: string
}

type Module =
  | {
      default: Transform
      parser: TestOptions['parser']
    }
  | Transform

function applyTransform(
  module: Module,
  input: { path?: string; source: string },
  options: Options = {},
  testOptions: TestOptions = {}
) {
  // Handle ES6 modules using default export for the transform
  const transform = 'default' in module ? module.default : module

  let j = jscodeshift
  const parser = testOptions.parser || ('parser' in module && module.parser)
  // Jest resets the module registry after each test, so we need to always get
  // a fresh copy of jscodeshift on every test run.
  if (parser) {
    j = jscodeshift.withParser(parser)
  }

  const output = transform(
    input,
    {
      j: j,
      jscodeshift: j,
      stats: () => {},
      report: () => {}
    },
    options || {}
  )

  return (output || '').trim()
}

function runInlineTest(
  module: Module,
  options: Options | undefined,
  input: FileInfo,
  expectedOutput: string,
  testOptions?: TestOptions
) {
  const output = applyTransform(module, input, options, testOptions)
  expect(output).toEqual(expectedOutput.trim())
  return output
}

export function defineInlineTest(
  module: Module,
  options: Options,
  inputSource: string,
  expectedOutputSource: string,
  testName?: string
) {
  test(testName || 'transforms correctly', () => {
    runInlineTest(
      module,
      options,
      {
        source: inputSource
      },
      expectedOutputSource
    )
  })
}

function extensionForParser(parser: string) {
  switch (parser) {
    case 'ts':
    case 'tsx':
      return parser
    default:
      return 'js'
  }
}

async function runJSTest(
  dirName: string,
  transformName: string,
  options?: Options,
  testFilePrefix?: string,
  testOptions?: TestOptions
) {
  if (!testFilePrefix) {
    testFilePrefix = transformName
  }

  // Assumes transform is one level up from __tests__ directory
  const module = await import(path.join(dirName, '..', transformName))
  const extension = extensionForParser(testOptions?.parser || module.parser)
  const fixtureDir = path.join(dirName, '..', '__testfixtures__')
  const inputPath = path.join(
    fixtureDir,
    testFilePrefix + `.input.${extension}`
  )
  const source = fs.readFileSync(inputPath, 'utf8')
  const expectedOutput = fs.readFileSync(
    path.join(fixtureDir, testFilePrefix + `.output.${extension}`),
    'utf8'
  )
  runInlineTest(
    module,
    options,
    {
      path: inputPath,
      source
    },
    expectedOutput,
    testOptions
  )
}

/**
 * Handles some boilerplate around defining a simple jest/Jasmine test for a
 * jscodeshift transform.
 */
export function defineTest(
  dirName: string,
  transformName: string,
  options?: Options,
  testFilePrefix?: string,
  testOptions?: TestOptions
) {
  const testName = testFilePrefix
    ? `transforms correctly using "${testFilePrefix}" data`
    : 'transforms correctly'
  describe(transformName, () => {
    test(testName, () => {
      runJSTest(dirName, transformName, options, testFilePrefix, testOptions)
    })
  })
}

export const runTest = (
  description: string,
  transformationName: string,
  fixtureName: string,
  extension: string = 'vue',
  transformationType: string = 'vue'
) => {
  test(description, () => {
    const fixtureDir = path.resolve(
      __dirname,
      transformationType == 'vue'
        ? '../vue-transformations'
        : '../wrapAstTransformation',
      './__testfixtures__',
      transformationName
    )

    const inputPath = path.resolve(
      fixtureDir,
      `${fixtureName}.input.${extension}`
    )
    const outputPath = path.resolve(
      fixtureDir,
      `${fixtureName}.output.${extension}`
    )

    const fileInfo = {
      path: inputPath,
      source: fs.readFileSync(inputPath).toString()
    }
    const transformation = (
      transformationType == 'vue' ? vueTransformationMap : transformationMap
    )[transformationName]
    expect(runTransformation(fileInfo, transformation)).toEqual(
      fs.readFileSync(outputPath).toString()
    )
  })
}
