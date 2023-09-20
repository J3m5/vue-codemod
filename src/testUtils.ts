import * as fs from 'fs'
import * as path from 'path'
import runTransformation from './runTransformation'
import transformationMap from '../transformations'
import vueTransformationMap from '../vue-transformations'

// type Module =  {default: ReturnType<typeof wrap>, parser: string}

// export interface TestOptions {
//   parser?: typeof parse | string;
// }

// function applyTransform(module: Module, options: Options, input: string, testOptions: Options = {}) {
//   // Handle ES6 modules using default export for the transform
//   const transform = module.default;

//   // Jest resets the module registry after each test, so we need to always get
//   // a fresh copy of jscodeshift on every test run.
//   let jscodeshift = j;
//   if (testOptions.parser || module.parser) {
//     jscodeshift = jscodeshift.withParser(testOptions.parser || module.parser);
//   }

//   const output = transform(
//     input,
//     {
//       jscodeshift,
//       j: jscodeshift,
//       stats: () => {},
//     },
//     options || {}
//   );

//   return (output || '').trim();
// }

// function runInlineTest(module: Module, options: Options, input: string, expectedOutput: string, testOptions: Options = {}) {
//   const output = applyTransform(module, options, input, testOptions);
//   expect(output).toEqual(expectedOutput.trim());
//   return output;
// }

// interface Params {
//   module: ReturnType<typeof wrap>,
//   options: Options,
//   inputSource: string,
//   expectedOutputSource: string,
//   testName?: string
// }
// function defineInlineTest(  module: Module,
//   options: Options,
//   input: string,
//   expectedOutput: string,
//   testName?: string) {
//   it(testName || 'transforms correctly', () => {
//     runInlineTest(module, options, {
//       source: input
//     }, expectedOutput);
//   });
// }

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
