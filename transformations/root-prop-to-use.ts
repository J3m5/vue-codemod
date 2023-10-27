import wrap from '../src/wrapAstTransformation'
import type { ASTTransformation } from '../src/wrapAstTransformation'
import createDebug from 'debug'
import { transformAST as addImportTransformAST } from './add-import'

const debug = createDebug('vue-codemod:rule')

/**
 * Expected to be run after the `createApp` transformation.
 * Transforms expressions like `createApp({ router })` to `createApp().use(router)`
 */
export const transformAST: ASTTransformation<{
  rootPropName?: string
  isGlobalApi?: boolean
}> = ({ root, j, filename }, params) => {
  const appRoots = root.find(j.CallExpression, (node) => {
    if (
      (node.arguments.length === 1 &&
        j.ObjectExpression.check(node.arguments[0])) ||
      (params && 'isGlobalApi' in params && params.isGlobalApi)
    ) {
      if (j.Identifier.check(node.callee) && node.callee.name === 'createApp') {
        return true
      }

      if (
        j.MemberExpression.check(node.callee) &&
        j.Identifier.check(node.callee.object) &&
        node.callee.object.name === 'Vue' &&
        j.Identifier.check(node.callee.property) &&
        node.callee.property.name === 'createApp'
      ) {
        return true
      }
    }
    return false
  })

  if (appRoots == undefined || appRoots.length == 0) {
    debug('No target Approots, jump out of this transition. ')
    return
  }

  // add global api to main.js used by component
  if (params && 'isGlobalApi' in params && params.isGlobalApi) {
    debug(filename)
    if (global.globalApi == undefined || global.globalApi.length == 0) {
      debug('global api is empty')
      return
    }

    debug('add global api in createApp')
    for (const i in global.globalApi) {
      const api = global.globalApi[i]

      // add import
      addImportTransformAST(
        { root, j, filename },
        {
          specifier: {
            type: 'default',
            local: api.name,
          },
          source: '../' + api.path,
        },
      )

      // add use
      appRoots.replaceWith(({ node: createAppCall }) => {
        return j.callExpression(
          j.memberExpression(createAppCall, j.identifier('use')),
          [j.identifier(api.name)],
        )
      })
    }
    return
  }

  appRoots.replaceWith(({ node: createAppCall }) => {
    const rootProps = createAppCall.arguments[0]
    if (
      !('properties' in rootProps) ||
      !rootProps.properties.length ||
      !params ||
      !('rootPropName' in params) ||
      !params.rootPropName
    ) {
      return createAppCall
    }

    const propertyIndex = rootProps.properties.findIndex(
      (p) =>
        'key' in p && 'name' in p.key && p.key.name === params.rootPropName,
    )

    if (propertyIndex === -1) {
      return createAppCall
    }

    // Remove property from root props and get its value
    const property = rootProps.properties.splice(propertyIndex, 1)[0]

    if (!('value' in property) || !j.Identifier.check(property.value)) {
      return createAppCall
    }

    return j.callExpression(
      j.memberExpression(createAppCall, j.identifier('use')),
      [property.value],
    )
  })
}

export default wrap(transformAST)
export const parser = 'babylon'
