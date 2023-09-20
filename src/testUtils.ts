import type { FileInfo, Options, Transform } from 'jscodeshift'
import jscodeshift from 'jscodeshift'
import type { TestOptions } from 'jscodeshift/src/testUtils'
import fs from 'node:fs'
import path from 'node:path'
import transformationMap from '../transformations'
import vueTransformationMap from '../vue-transformations'
import runTransformation from './runTransformation'

type Module =
  | {
      default: Transform
      parser: TestOptions['parser']
    }
  | Transform

function applyTransform(
  module: Module,
  input: FileInfo,
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
  input: FileInfo,
  expectedOutput: string,
  options?: Options,
  testOptions?: TestOptions
) {
  const output = applyTransform(module, input, options, testOptions)
  expect(output).toEqual(expectedOutput.trim())
  return output
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
    {
      path: inputPath,
      source
    },
    expectedOutput,
    options,
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
    it(testName, () => {
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
