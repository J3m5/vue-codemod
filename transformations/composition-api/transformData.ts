import type {
  ASTPath,
  Identifier,
  JSCodeshift,
  ObjectProperty,
} from 'jscodeshift'
import j from 'jscodeshift'
import type { TransformParams } from './types'
import { isKeyIdentifier } from './utils'
import z from 'zod'

const getRefValue = ({ node }: { node: ObjectProperty; j: JSCodeshift }) => {
  const { value } = node

  // Get literal node
  if (j.Literal.check(value)) {
    return j.literal(value.value)
  }

  // Get all other valid nodes
  if (
    !j.TSParameterProperty.check(value) &&
    !j.TSTypeAssertion.check(value) &&
    !j.RestElement.check(value) &&
    !j.SpreadElementPattern.check(value) &&
    !j.PropertyPattern.check(value) &&
    !j.ObjectPattern.check(value) &&
    !j.ArrayPattern.check(value) &&
    !j.AssignmentPattern.check(value) &&
    !j.SpreadPropertyPattern.check(value)
  ) {
    return value
  }
}

const schema = z.object({
  key: z.object({
    name: z.string().refine((name) => name === 'data'),
  }),
})

const filterData = (
  dataPropertyPath: ASTPath<ObjectProperty>,
): dataPropertyPath is ASTPath<ObjectProperty & { key: Identifier }> => {
  const grandParent = dataPropertyPath?.parent?.parent?.value
  if (!grandParent) return false

  return (
    ['ArrowFunctionExpression', 'ReturnStatement'].includes(grandParent.type) ||
    (schema.safeParse(grandParent).success &&
      isKeyIdentifier(dataPropertyPath.value))
  )
}

const buildRef = (
  name: string,
  identifier: string,
  refValue: Exclude<ReturnType<typeof getRefValue>, undefined>,
) => {
  return j.variableDeclaration('const', [
    j.variableDeclarator(
      j.identifier(name),
      j.callExpression(j.identifier(identifier), [refValue]),
    ),
  ])
}

export const transformData = ({
  defaultExport,
  collector,
}: TransformParams) => {
  defaultExport
    .find(j.ObjectProperty)
    .filter(filterData)
    .forEach((dataPropPath) => {
      const refValue = getRefValue({ node: dataPropPath.value, j })

      if (!refValue) return []

      const { name } = dataPropPath.value.key
      if (j.ObjectExpression.check(refValue)) {
        const ref = buildRef(name, 'reactive', refValue)
        collector.nodes.reactive.set(name, ref)
        return
      }
      const ref = buildRef(name, 'ref', refValue)
      collector.nodes.ref.set(name, ref)
    })
}
