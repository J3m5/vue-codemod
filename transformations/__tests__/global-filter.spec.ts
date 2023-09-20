import transform from '../global-filter'
import { defineInlineTest } from "jscodeshift/src/testUtils";


defineInlineTest(
  // @ts-ignore
  transform,
  {},
  `const app = Vue.createApp(App)
Vue.filter('capitalize', function(value) {
  return value
})`,
  `const app = Vue.createApp(App)
app.config.globalProperties.$filters = {
  capitalize(value) {
    return value
  }
};`,
  'transform global filter'
)

defineInlineTest(
  // @ts-ignore
  transform,
  {},
  `const app = Vue.createApp(App).use(store).use(router)
app.component()
Vue.filter('capitalize', function(value) {
  return value
})`,
  `const app = Vue.createApp(App).use(store).use(router)
app.component()
app.config.globalProperties.$filters = {
  capitalize(value) {
    return value
  }
};`,
  'transform global filter'
)

defineInlineTest(
  // @ts-ignore
  transform,
  {},
  `const app = new Vue(App)
Vue.filter('capitalize', function(value) {
  return value
})`,
  `const app = new Vue(App)
Vue.filter('capitalize', function(value) {
  return value
})
`,
  'transform global filter(no effect and will warn)'
)
