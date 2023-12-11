import type {
  ASTPath,
  ArrowFunctionExpression,
  Identifier,
  ObjectMethod,
  ObjectProperty,
  Property,
  SpreadElement,
  SpreadProperty
} from 'jscodeshift'
import j from 'jscodeshift'
import type { Collector, ObjectFunction, TransformParams } from './types'
import {
  findObjectProperty,
  getFunctionBuilderParams,
  isFunction
} from './utils'

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
    .find(j.BlockStatement)
    .filter(path => {
      return (
        j.Identifier.check(path.parent.key) &&
        (j.ObjectMethod.check(path.parent.type) ||
          j.ArrowFunctionExpression.check(path.parent.type))
      )
    })
    .map(path => {
      return path.parent.parent as ASTPath<ObjectFunction>
    })

  if (!watchCollection.length) return

  const functionNodes = watchCollection.nodes()

  // Handle the object method syntax
  if (functionNodes.length) {
    const watcherNodes = functionNodes.map(handlerNode => {
      const handlerBuilderParams = getFunctionBuilderParams(handlerNode, true)
      const watchSource = getWatchSource(collector, handlerNode.key.name)
      return buildWatcher(watchSource, handlerBuilderParams)
    })
    collector.nodes.watch.push(...watcherNodes)
  }

  // Handle the object handler syntax
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
  collector.nodes.watch.push(...watcherNodes)
}
