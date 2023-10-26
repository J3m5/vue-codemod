#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  createWriteStream,
  existsSync,
  readFileSync,
  writeFileSync
} from 'node:fs'
import { resolve } from 'node:path'
import Module from 'module'

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import * as globby from 'globby'

import createDebug from 'debug'
import { question } from 'readline-sync'

import builtInTransformations from '../transformations'
import { excludedTransformations } from '../transformations'
import vueTransformations from '../vue-transformations'
import { excludedVueTransformations } from '../vue-transformations'
import runTransformation from '../src/runTransformation'
import { transform as packageTransform } from '../src/packageTransformation'

import type { TransformationModule } from '../src/runTransformation'
import { formatterOutput, cliInstance } from '../src/report'
import { ruleDescription } from '../src/ruleDescription'

const debug = createDebug('vue-codemod:cli')
const processFilePath: string[] = []

const {
  _: files,
  transformation: transformationName,
  runAllTransformation: runAllTransformation,
  reportFormatter: formatter,
  params
} = yargs(hideBin(process.argv))
  .usage('Usage: vue-codemod [file pattern] <option>')
  .option('transformation', {
    alias: 't',
    type: 'string',
    conflicts: 'runAllTransformation',
    describe: 'Name or path of the transformation module',
    choices: Object.keys(ruleDescription)
  })
  .option('params', {
    alias: 'p',
    describe: 'Custom params to the transformation'
  })
  .option('runAllTransformation', {
    alias: 'a',
    type: 'boolean',
    conflicts: 'transformation',
    describe: 'run all transformation module'
  })
  .option('reportFormatter', {
    alias: 'f',
    type: 'string',
    describe: 'Specify an output report formatter',
    default: 'table',
    choices: ['table', 'detail', 'log']
  })
  .example([
    [
      'vue-codemod ./src -a',
      'Run all rules to convert all relevant files in the ./src folder'
    ],
    [
      'vue-codemod ./src/components/HelloWorld.vue -t slot-attribute',
      'Run slot-attribute rule to convert HelloWorld.vue'
    ]
  ])
  .help()
  .alias('h', 'help')
  .alias('v', 'version')
  .parseSync()

let logger: Console = console
if (formatter === 'log') {
  const options = {
    flags: 'w',
    encoding: 'utf8' as const // utf-8
  }
  const stdout = createWriteStream('./vue_codemod.log', options)
  logger = new console.Console(stdout)
}

// TODO: port the `Runner` interface of jscodeshift
async function main() {
  if (!transformationName && !runAllTransformation) {
    console.log(
      'You need at least one option in command, enter vue-codemod -h to see help. '
    )
    return
  }

  // Remind user to back up files
  const answer = question(
    'Warning!!\n' +
      'This tool may overwrite files. Please use version control tools or back up your code in advance.\n' +
      'Press enter or enter yes or enter Y to continue:'
  )
  if (!['', 'yes', 'Y'].includes(answer.trim())) {
    console.log('Abort!!!')
    return
  }

  // init global params
  global.globalApi = []
  global.manualList = []
  global.scriptLine = 0
  global.outputReport = {}

  const resolvedPaths = globby.sync(
    (files as string[]).concat('!node_modules'),
    { gitignore: true }
  )
  if (transformationName) {
    debug(`run ${transformationName} transformation`)
    const transformationModule = loadTransformationModule(transformationName)
    processTransformation(
      resolvedPaths,
      transformationName,
      transformationModule
    )
    // if (packageTransform()) {
    //   processFilePath.push('package.json')
    //   global.outputReport['package transformation'] = 1
    // }
  }

  if (runAllTransformation) {
    const totalRule: number =
      Object.getOwnPropertyNames(builtInTransformations).length +
      Object.getOwnPropertyNames(vueTransformations).length -
      excludedTransformations.length -
      excludedVueTransformations.length
    cliInstance.start(totalRule, 0, { process: 'Transformation begins' })
    debug(`run all transformation`)
    for (const key in builtInTransformations) {
      if (!excludedTransformations.includes(key)) {
        cliInstance.increment({ process: `Executing: ${key}` })
        processTransformation(resolvedPaths, key, builtInTransformations[key])
      } else {
        debug(
          `skip ${key} transformation, Because it will run in other transformation`
        )
      }
    }

    for (const key in vueTransformations) {
      if (!excludedVueTransformations.includes(key)) {
        cliInstance.increment({ process: `Executing: ${key}` })
        processTransformation(resolvedPaths, key, vueTransformations[key])
      } else {
        debug(
          `skip ${key} transformation, Because it will run in other transformation`
        )
      }
    }
    if (packageTransform()) {
      processFilePath.push('package.json')
      global.outputReport['package transformation'] = 1
    }
  }
  cliInstance.update(cliInstance.getTotal(), {
    process: 'Transformation finished! '
  })
  cliInstance.stop()
  formatterOutput(processFilePath, formatter, logger)
}
/**
 * process files by Transformation
 * @param resolvedPaths resolved file path
 * @param transformationName transformation name
 * @param transformationModule transformation module
 */
function processTransformation(
  resolvedPaths: string[],
  transformationName: string,
  transformationModule: TransformationModule
) {
  if (formatter === 'log')
    logger.time(`Processing use ${transformationName} transformation`)
  const ruleProcessFile: string[] = []
  const extensions = ['.js', '.ts', '.vue', '.jsx', '.tsx']
  for (const p of resolvedPaths) {
    debug(`Processing ${p}…`)
    const retainedSource: string = readFileSync(p)
      .toString()
      .split('\r\n')
      .join('\n')
    const fileInfo = {
      path: p,
      source: retainedSource
    }
    const extension = (/\.([^.]*)$/.exec(fileInfo.path) || [])[0]
    if (!extension) {
      debug(`skip ${fileInfo.path} file because it doesn't have an extension.`)
      continue
    }

    if (!extension || !extensions.includes(extension)) {
      debug(`skip ${fileInfo.path} file because not end with ${extensions}.`)
      continue
    }
    try {
      debug(`Processing file: ${fileInfo.path}`)
      const result = runTransformation(
        fileInfo,
        transformationModule,
        params as object
      )
      if (!result) throw `Processed file ${fileInfo.path} failed`

      if (retainedSource != result) {
        writeFileSync(p, result)
        ruleProcessFile.push(p)
        if (!processFilePath.includes(p)) {
          processFilePath.push(p)
        } else {
          debug(`Skip this file ${p} because of duplicate statistics`)
        }
      }
    } catch (e) {
      console.error(e)
    }
  }
  if (ruleProcessFile.length) {
    if (formatter === 'log')
      logger.timeEnd(`Processing use ${transformationName} transformation`)
    if (
      Object.prototype.hasOwnProperty.call(
        ruleDescription,
        transformationName
      ) &&
      (formatter === 'detail' || formatter === 'log')
    ) {
      const ruleOutput = {
        rule_name: transformationName,
        website: ruleDescription[transformationName].description,
        transformed_files: ruleProcessFile
      }

      if (formatter === 'log') logger.log(ruleOutput)
    }
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
/**
 * load Transformation Module
 * @param nameOrPath
 * @returns
 */
function loadTransformationModule(nameOrPath: string) {
  const jsTransformation = builtInTransformations[nameOrPath]
  const vueTransformation = vueTransformations[nameOrPath]
  if (jsTransformation) {
    return jsTransformation
  }
  if (vueTransformation) {
    return vueTransformation
  }

  const customModulePath = resolve(process.cwd(), nameOrPath)
  if (existsSync(customModulePath)) {
    const requireFunc = Module.createRequire(
      resolve(process.cwd(), './package.json')
    )
    // TODO: interop with ES module
    // TODO: fix absolute path
    return requireFunc(`./${nameOrPath}`)
  }

  throw new Error(`Cannot find transformation module ${nameOrPath}`)
}
