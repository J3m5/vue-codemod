import j, { Collection, ObjectProperty } from 'jscodeshift'
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

export const transformProps = ({ defaultExport, j }: TransformParams) => {
  const propsCollection = defaultExport.find(j.ObjectProperty, {
    key: { name: 'props' }
  })

  const props = getProps(propsCollection)

  if (!props) return

  const propsDefinition = j.variableDeclaration('const', [
    j.variableDeclarator(
      j.identifier('props'),

      j.callExpression(j.identifier('defineProps'), [props])
    )
  ])

  defaultExport.insertBefore(propsDefinition)
}
