import { defineInlineTest } from 'jscodeshift/src/testUtils.js'
import transform, { parser } from '../new-component-api'

global.globalApi = []

defineInlineTest(
  // @ts-ignore
  { default: transform, parser },
  {},
  `import Vue from 'vue'
import MyComponent from './MyComponent'
Vue.component('my-component', MyComponent)`,
  `import MyComponent from './MyComponent'
export default {
  install: app => {
    app.component('my-component', MyComponent);
  }
};;`,
  'transform global component registration'
)

defineInlineTest(
  // @ts-ignore
  { default: transform, parser },
  {},
  `import Vue from 'vue'
import App from './App.vue'
import MyComponent from './MyComponent'
Vue.component('my-component', MyComponent)
new Vue(App).$mount('app')`,
  `import Vue from 'vue'
import App from './App.vue'
import MyComponent from './MyComponent'
Vue.component('my-component', MyComponent)
new Vue(App).$mount('app')`,
  `don't transform global component api when there are other expression statements`
)
