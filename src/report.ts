import { table } from 'table'
import cliProgress from 'cli-progress'
import { ASTNode, ASTPath } from 'jscodeshift'
import { Node as EslintNode } from 'vue-eslint-parser/ast/nodes'

export const cliInstance = new cliProgress.SingleBar(
  {
    format: 'progress [{bar}] {percentage}% | {process} | {value}/{total}',
    clearOnComplete: false,
    linewrap: true,
    fps: 144
  },
  cliProgress.Presets.shades_classic
)
export function pushManualList(
  path: string | undefined = '',
  node: ASTNode | ASTPath<ASTNode>,
  name: string,
  suggest: string,
  website: string
) {
  console.log(node)

  let index = 0
  const filepath = path.split('.')
  if (filepath[filepath.length - 1] === 'vue') {
    index = global.scriptLine - 1
  } else {
    index = 0
  }
  let line = 0
  let column
  if ('loc' in node && node.loc) {
    line = node.loc.start.line || 0
    column = node.loc.start.column
  } else if (
    'value' in node &&
    node.value &&
    typeof node.value === 'object' &&
    'loc' in node.value
  ) {
    line = node?.value?.loc?.start.line || 0
    column = node?.value?.loc?.start.column
  }
  index = line + index
  const position: string = '[' + index + ',' + column + ']'

  const list = {
    path: path,
    position: position,
    name: name,
    suggest: suggest,
    website: website
  }
  global.manualList.push(list)
}

export function VuePushManualList(
  path: string | undefined,
  node: ASTNode | ASTPath<ASTNode> | EslintNode,
  name: string,
  suggest: string,
  website: string
) {
  const line = 'loc' in node ? node?.loc?.start.line : 0
  const column = 'loc' in node ? node?.loc?.start.column : 0
  const position = '[' + line + ',' + column + ']'
  const list = {
    path: path,
    position: position,
    name: name,
    suggest: suggest,
    website: website
  }
  global.manualList.push(list)
}

export function getCntFunc(key: string, outputObj: { [key: string]: number }) {
  if (!outputObj) {
    outputObj = { key: 0 }
  }
  if (!(key in outputObj)) {
    outputObj[key] = 0
  }

  function cntFunc(quantity: number = 1) {
    outputObj[key] += quantity
  }

  return cntFunc
}

export function formatterOutput(
  processFilePath: string[],
  formatter: string,
  logger: Console
) {
  // normal output
  const processFilePathList = processFilePath.join('\n')
  const totalChanged = Object.keys(global.outputReport).reduce(
    (sum, key) => sum + global.outputReport[key],
    0
  )
  const totalDetected = totalChanged + global.manualList.length
  const transRate =
    totalDetected == totalChanged
      ? 100
      : ((100 * totalChanged) / totalDetected).toFixed(2)

  console.log(`\x1B[0m--------------------------------------------------`)
  console.log(
    `Processed ${processFilePath.length} files:\n${processFilePathList}\n`
  )

  if (global.manualList.length) {
    console.log(
      `The list that you need to migrate your codes manually (total: ${global.manualList.length}): `
    )
    let index = 1
    global.manualList.forEach(manual => {
      console.log('index:', index++)
      console.log(manual)
    })
  }

  console.log(
    '\n\n\x1B[31;4m%s\x1B[0m',
    `${totalDetected} places`,
    `need to be transformed`
  )
  console.log(
    '\x1B[32;4m%s\x1B[0m',
    `${totalChanged} places`,
    `was transformed`
  )
  console.log(`The transformation rate is \x1B[32;4m${transRate}%\x1B[0m`)

  Object.keys(outputReport).forEach(item => {
    if (!outputReport[item]) delete outputReport[item]
  })

  if (formatter === 'detail') {
    console.log('The transformation stats: \n')
    console.log(global.outputReport)
  } else {
    const tableOutput: (string | number)[][] = [['Rule Names', 'Count']]
    for (const i in global.outputReport) {
      tableOutput.push([i, global.outputReport[i]])
    }
    const tableStr = table(tableOutput, {
      drawHorizontalLine: (lineIndex, rowCount) => {
        return lineIndex === 0 || lineIndex === 1 || lineIndex === rowCount
      },
      columns: [{ alignment: 'left' }, { alignment: 'center' }]
    })
    console.log('The transformation stats: ')
    console.log(tableStr)
    if (formatter === 'log') {
      logOutput(
        processFilePathList,
        processFilePath,
        totalDetected,
        totalChanged,
        transRate,
        tableStr,
        logger
      )
    }
  }
}

export function logOutput(
  processFilePathList: string,
  processFilePath: string[],
  totalDetected: number,
  totalChanged: number,
  transRate: string | number,
  tableStr: string,
  logger: Console
) {
  logger.log(
    `Processed ${processFilePath.length} files:\n${processFilePathList}\n`
  )
  if (global.manualList.length) {
    logger.log('The list that you need to migrate your codes manually')
    let index = 1
    global.manualList.forEach(manual => {
      logger.log('index:', index++)
      logger.log(manual)
    })
  }
  logger.log(`\n\n${totalDetected} places`, `need to be transformed`)
  logger.log(`${totalChanged} places`, `was transformed`)
  logger.log(`The transformation rate is ${transRate}%`)
  logger.log('The transformation stats: ')
  logger.log(tableStr)
}
