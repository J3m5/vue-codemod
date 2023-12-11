import type { ASTPath, Identifier, ObjectMethod } from 'jscodeshift'
import j from 'jscodeshift'
import type { TransformParams } from './types'
import { getFunctionBuilderParams } from './utils'

export const hooks = {
  setup: ['beforeCreate', 'created'],
  lifecycle: {
    beforeCreate: 'onBeforeCreate',
    created: 'onCreated',
    beforeMount: 'onBeforeMount',
    mounted: 'onMounted',
    beforeUpdate: 'onBeforeUpdate',
    updated: 'onUpdated',
    errorCaptured: 'onErrorCaptured',
    renderTracked: 'onRenderTracked',
    renderTriggered: 'onRenderTriggered',
    beforeDestroy: 'onBeforeUnmount',
    destroyed: 'onUnmounted',
    activated: 'onActivated',
    deactivated: 'onDeactivated'
  },
  router: {
    beforeRouteEnter: 'onBeforeRouteEnter',
    beforeRouteUpdate: 'onBeforeRouteUpdate',
    beforeRouteLeave: 'onBeforeRouteLeave'
  }
} as const

type HookPath<K> = ASTPath<
  ObjectMethod & {
    key: Identifier & { name: keyof K }
  }
>

type LifeCycleHookPath = HookPath<typeof hooks.lifecycle>

type RouterHookPath = HookPath<typeof hooks.router>

export const transformLifeCycle = ({
  defaultExport,
  collector
}: TransformParams) => {
  // Handle router lifecycle hooks
  defaultExport
    .find(j.ObjectMethod)
    .filter(
      (path): path is RouterHookPath =>
        j.Identifier.check(path.value.key) &&
        Object.keys(hooks.router).includes(path.value.key.name)
    )
    .forEach(path => {
      const { params, body, key } = path.node
      const hookName = hooks.router[key.name]
      const node = j.expressionStatement(
        j.callExpression(j.identifier(hookName), [
          j.arrowFunctionExpression(params, body)
        ])
      )
      if (hookName === 'onBeforeRouteEnter') {
        const commentValue = `* \nonBeforeRouteEnter hook should be added at the route level now\n\n${j(
          node
        ).toSource()}\n*`
        const comment = j.commentBlock(commentValue, true, true)
        collector.comments.set(hookName, comment)
      }

      collector.nodes.routerHooks.set(hookName, node)
    })

  // Handle Vue lifecycle hooks
  defaultExport
    .find(j.ObjectMethod)
    .filter((path): path is LifeCycleHookPath => {
      return (
        j.Identifier.check(path.value.key) &&
        Object.keys(hooks.lifecycle).includes(path.value.key.name)
      )
    })
    .forEach(path => {
      const { name } = path.node.key
      const hookBuilderParams = getFunctionBuilderParams(path.node, true)

      const hookCall = j.expressionStatement(
        j.callExpression(j.identifier(hooks.lifecycle[name]), [
          j.arrowFunctionExpression.from(hookBuilderParams)
        ])
      )
      collector.nodes.lifecycleHooks.set(name, hookCall)
    })
}
