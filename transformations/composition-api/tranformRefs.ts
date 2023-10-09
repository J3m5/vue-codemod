import j from 'jscodeshift'
import { TransformParams } from './utils'

export const transformRefs = ({
  defaultExport,
  collector
}: TransformParams) => {
  const refs: string[] = []
  const $refsCollection = defaultExport.find(j.MemberExpression, {
    property: { name: '$refs' }
  })

  $refsCollection.forEach(path => {
    if (!j.ThisExpression.check(path.value.object)) return
    const { property } = path.parent.value
    collector.newImports.vue.add('ref')
    const parentObject = j.memberExpression(property, j.identifier('value'))
    path.parent.replace(parentObject)

    if (!refs.includes(property.name)) {
      refs.push(property.name)
    }
  })

  const refNodes = refs.map(ref => {
    return j.variableDeclaration('const', [
      j.variableDeclarator(
        j.identifier(ref),
        j.callExpression(j.identifier('ref'), [j.identifier(ref)])
      )
    ])
  })
  collector.refNodes = refNodes
}
