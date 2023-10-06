import j from 'jscodeshift'
import { TransformParams } from './utils'

export const transformRefs = ({
  defaultExport,
  collector
}: TransformParams) => {
  const refs: string[] = []
  defaultExport
    .find(j.MemberExpression, { property: { name: '$refs' } })
    .forEach(path => {
      if (!j.ThisExpression.check(path.value.object)) return
      const { property } = path.parent.value
      collector.newImports.vue.add('ref')
      const parentObject = j.memberExpression(property, j.identifier('value'))
      path.parent.replace(parentObject)

      if (refs.includes(property.name)) return
      defaultExport.insertBefore(
        j.variableDeclaration('const', [
          j.variableDeclarator(
            j.identifier(property.name),
            j.callExpression(j.identifier('ref'), [j.identifier('null')])
          )
        ])
      )
      refs.push(property.name)
    })
}
