/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  ASTPath,
  ArrayExpression,
  ObjectExpression,
  ObjectProperty,
} from 'jscodeshift'
import j from 'jscodeshift'
import type { TransformParams } from './types'

import { getNodes } from './utils'

const tsTypeAnnotationMap = {
  String: j.tsStringKeyword(),
  Number: j.tsNumberKeyword(),
  Boolean: j.tsBooleanKeyword(),
  Array: j.tsTypeReference(j.identifier('Array')),
  Object: j.tsTypeReference(j.identifier('object')),
  Date: j.tsTypeReference(j.identifier('Date')),
  Function: j.tsTypeReference(j.identifier('Function')),
  Symbol: j.tsSymbolKeyword(),
}

const getPropsNames = (props: ArrayExpression | ObjectExpression) => {
  if (j.ArrayExpression.check(props)) {
    return props.elements.flatMap((element) => {
      if (j.Literal.check(element) && typeof element.value === 'string') {
        return element.value
      }
      return []
    })
  }
  return props.properties.flatMap((property) => {
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

type Props = ObjectProperty & { value: ArrayExpression | ObjectExpression }

const isArrayOrObject = (
  path: ASTPath<ObjectProperty>,
): path is ASTPath<Props> =>
  j.ArrayExpression.check(path.value.value) ||
  j.ObjectExpression.check(path.value.value)

export const transformProps = ({
  defaultExport,
  collector,
  params,
}: TransformParams) => {
  const propsCollection = defaultExport
    .find(j.ObjectProperty, {
      key: { name: 'props' },
    })
    .filter(
      (path) => path.parent.parent.value.type === 'ExportDefaultDeclaration',
    )
    .filter(isArrayOrObject)

  if (!propsCollection.length) return
  const props = getNodes(propsCollection).value

  const propsNames = getPropsNames(props)
  collector.propsNames.push(...propsNames)

  if (params?.runtime === 'ts' && !j.ArrayExpression.check(props)) {
    const propTypes = props.properties.flatMap((property) => {
      if (
        !j.ObjectProperty.check(property) ||
        !j.Identifier.check(property.key)
      )
        return []

      // Handle simple type only props definition
      if (j.Identifier.check(property.value)) {
        return {
          required: undefined,
          defaultValue: undefined,
          type: property.value.name,
          name: property.key.name,
        }
      }
      if (!j.ObjectExpression.check(property.value)) return []

      const config: {
        required?: boolean
        defaultValue?: any
        type: string
        name: string
      } = {
        required: undefined,
        defaultValue: undefined,
        type: '',
        name: property.key.name,
      }

      property.value.properties.forEach((propKey) => {
        if (
          !j.ObjectProperty.check(propKey) ||
          !j.Identifier.check(propKey.key)
        )
          return

        if (
          propKey.key.name === 'required' &&
          j.BooleanLiteral.check(propKey.value)
        ) {
          config.required = propKey.value.value
        }
        if (propKey.key.name === 'default' && 'value' in propKey.value) {
          config.defaultValue = propKey.value.value
        }

        if (propKey.key.name === 'type' && j.Identifier.check(propKey.value)) {
          config.type = propKey.value.name
        }
      })

      return config
    })
    if (!propTypes.length) return

    const objectTypeAnnotationProperties = propTypes.flatMap(
      ({ name, type, required }) => {
        const typeAnnotation =
          tsTypeAnnotationMap[type as keyof typeof tsTypeAnnotationMap]
        if (!typeAnnotation) return []
        return j.tsPropertySignature(
          j.identifier(name),
          j.tsTypeAnnotation(typeAnnotation),
          required === true ? false : true,
        )
      },
    )

    const objectTypeAnnotation = j.tsTypeLiteral(objectTypeAnnotationProperties)
    j.tsExpressionWithTypeArguments(j.identifier('defineProps'))
    const call = j.callExpression.from({
      callee: j.identifier('defineProps'),
      arguments: [],
      typeParameters: j.tsTypeParameterInstantiation([objectTypeAnnotation]),
    })

    const propsDefinition = j.variableDeclaration('const', [
      j.variableDeclarator(j.identifier('props'), call),
    ])
    return collector.nodes.props.push(propsDefinition)
  }

  const propsDefinition = j.variableDeclaration('const', [
    j.variableDeclarator(
      j.identifier('props'),

      j.callExpression(j.identifier('defineProps'), [props]),
    ),
  ])

  collector.nodes.props.push(propsDefinition)
}
