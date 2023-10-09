import j, {
  ArrayExpression,
  Collection,
  ObjectExpression,
  ObjectProperty
} from 'jscodeshift'
import type { TransformParams } from './utils'
import { get } from './utils'

const getProps = (collection: Collection<ObjectProperty>) => {
  if (!collection.length) return
  const props = get(collection).value

  if (j.ArrayExpression.check(props) || j.ObjectExpression.check(props)) {
    return props
  }

  return undefined
}

const getPropsNames = (props: ArrayExpression | ObjectExpression) => {
  if (j.ArrayExpression.check(props)) {
    return props.elements.flatMap(element => {
      if (j.Literal.check(element) && typeof element.value === 'string') {
        return element.value
      }
      return []
    })
  }
  return props.properties.flatMap(property => {
    if (
      j.ObjectProperty.check(property) &&
      j.Identifier.check(property.key) &&
      typeof property.key.name === 'string'
    ) {
      return property.key.name
    }
    return []
  })
}

export const transformProps = ({
  defaultExport,
  collector
}: TransformParams) => {
  const propsCollection = defaultExport
    .find(j.ObjectProperty, {
      key: { name: 'props' }
    })
    .filter(
      path => path.parent.parent.value.type === 'ExportDefaultDeclaration'
    )

  const props = getProps(propsCollection)

  if (!props) return
  const propsNames = getPropsNames(props)
  collector.propsNames.push(...propsNames)
  const propsDefinition = j.variableDeclaration('const', [
    j.variableDeclarator(
      j.identifier('props'),

      j.callExpression(j.identifier('defineProps'), [props])
    )
  ])
  collector.propsNodes.push(propsDefinition)
}
