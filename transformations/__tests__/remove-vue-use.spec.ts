import { defineInlineTest } from 'jscodeshift/src/testUtils.js'
import transform, { parser } from '../remove-vue-use'

defineInlineTest(
  { default: transform, parser },
  {
    removablePlugins: ['VueRouter']
  },
  `Vue.use(VueRouter)`,
  ``,
  `correctly remove Vue.use`
)

defineInlineTest(
  { default: transform, parser },
  {
    removablePlugins: ['VueRouter']
  },
  `import VueRouter from "vue-router";\nVue.use(VueRouter)`,
  ``,
  `should also remove the extraneous import declaration`
)

defineInlineTest(
  { default: transform, parser },
  {
    removablePlugins: ['VueRouter']
  },
  `Vue.use(Vuetify)`,
  `Vue.use(Vuetify)`,
  `do not remove those are not in the 'removablePlugins' list`
)

defineInlineTest(
  { default: transform, parser },
  {},
  `app.use(router);`,
  `app.use(router);`,
  `don't remove app.use`
)

defineInlineTest(
  { default: transform, parser },
  {
    removablePlugins: ['VueRouter']
  },
  `process.env.NODE_ENV === 'development' ? Vue.use(VueRouter) : null`,
  `process.env.NODE_ENV === 'development' ? Vue.use(VueRouter) : null`,
  `don't remove Vue.use in other expression`
)
