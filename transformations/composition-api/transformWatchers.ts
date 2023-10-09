import j from 'jscodeshift'

import type {
  ArrowFunctionExpression,
  Identifier,
  ObjectMethod,
  ObjectProperty,
  Property,
  SpreadElement,
  SpreadProperty
} from 'jscodeshift'

import {
  findObjectProperty,
  get,
  getFunctionBuilderParams,
  isFunction
} from './utils'

import type { Collector, TransformParams } from './utils'

const buildWatcher = (
  watchSource: Identifier | ArrowFunctionExpression,
  handlerBuilderParams: ReturnType<typeof getFunctionBuilderParams>,
  watchOptions?: (
    | ObjectMethod
    | ObjectProperty
    | Property
    | SpreadElement
    | SpreadProperty
  )[]
) => {
  return j.expressionStatement(
    j.callExpression(j.identifier('watch'), [
      watchSource,
      j.arrowFunctionExpression.from(handlerBuilderParams),
      ...(watchOptions ? [j.objectExpression(watchOptions)] : [])
    ])
  )
}
const getWatchSource = (collector: Collector, sourceName: string) => {
  return collector.propsNames.includes(sourceName)
    ? j.arrowFunctionExpression.from({
        body: j.memberExpression(
          j.identifier('props'),
          j.identifier(sourceName)
        ),
        params: []
      })
    : j.identifier(sourceName)
}
export const transformWatchers = ({
  defaultExport,
  collector
}: TransformParams) => {
  const watchCollection = findObjectProperty(defaultExport, 'watch')

  if (!watchCollection.length) return

  const functionNodes = get(watchCollection).properties.filter(isFunction)
  if (functionNodes.length) {
    collector.newImports.vue.add('watch')
    const watcherNodes = functionNodes.map(handlerNode => {
      const handlerBuilderParams = getFunctionBuilderParams(handlerNode, true)
      const watchSource = getWatchSource(collector, handlerNode.key.name)
      return buildWatcher(watchSource, handlerBuilderParams)
    })
    collector.watchNodes.push(...watcherNodes)
  }
  const watcherNodes = watchCollection
    .find(j.ObjectProperty, { value: { type: 'ObjectExpression' } })
    .filter(path => path.parent.parent.value.key.name === 'watch')
    .nodes()
    .flatMap(node => {
      if (
        !j.Identifier.check(node.key) ||
        !j.ObjectExpression.check(node.value)
      )
        return []

      const handlerNode = node.value.properties.find(isFunction, true)
      if (!handlerNode) return []
      const watchOptions = node.value.properties.filter(
        prop =>
          j.ObjectProperty.check(prop) &&
          j.Identifier.check(prop.key) &&
          prop.key.name !== 'handler'
      )

      const handlerBuilderParams = getFunctionBuilderParams(handlerNode, true)

      const watchSource = getWatchSource(collector, node.key.name)
      return buildWatcher(watchSource, handlerBuilderParams, watchOptions)
    })
  if (!watcherNodes.length) return
  collector.newImports.vue.add('watch')
  collector.watchNodes.push(...watcherNodes)
}
