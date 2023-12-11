import wrap from '../src/wrapAstTransformation'
import type { ASTTransformation } from '../src/wrapAstTransformation'

export const transformAST: ASTTransformation = ({ root, j }) => {
  const productionTipAssignment = root.find(
    j.AssignmentExpression,
    n =>
      j.MemberExpression.check(n.left) &&
      'name' in n.left.property &&
      n.left.property.name === 'productionTip' &&
      'property' in n.left.object &&
      'name' in n.left.object.property &&
      n.left.object.property.name === 'config' &&
      'object' in n.left.object &&
      'name' in n.left.object.object &&
      n.left.object.object.name === 'Vue'
  )
  productionTipAssignment.remove()
}

export default wrap(transformAST)
export const parser = 'babylon'
