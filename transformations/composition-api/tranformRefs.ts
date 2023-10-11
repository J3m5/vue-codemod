import j from 'jscodeshift'
import { TransformParams } from './utils'

const buildRef = (ref: string) => {
  return j.variableDeclaration('const', [
    j.variableDeclarator(
      j.identifier(ref),
      j.callExpression(j.identifier('ref'), [j.identifier('null')])
    )
  ])
}

export const transformRefs = ({
  defaultExport,
  collector
}: TransformParams) => {
  const $refsCollection = defaultExport.find(j.MemberExpression, {
    property: { name: '$refs' }
  })

  $refsCollection.forEach(path => {
    if (!j.ThisExpression.check(path.value.object)) return
    const { property } = path.parent.value
    const parentObject = j.memberExpression(property, j.identifier('value'))
    path.parent.replace(parentObject)

    const { name } = property

    if (!collector.nodes.ref.get(name)) {
      const ref = buildRef(name)
      collector.nodes.ref.set(name, ref)
    }
  })
}
