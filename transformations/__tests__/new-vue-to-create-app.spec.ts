import { defineInlineTest } from 'jscodeshift/src/testUtils.js'
import transform, { parser } from '../new-vue-to-create-app'

defineInlineTest(
  { default: transform, parser },
  {},
  `new Vue({ template: "<div>hello</div>" })`,
  `Vue.createApp({ template: "<div>hello</div>" })`,
  'transform `new Vue()` to createApp()'
)

// Vue.prototype.$baseEventBus = new Vue() will be transform to Vue.prototype.$baseEventBus = new createApp()
// defineInlineTest(
//   transform,
//   {},
//   `new Vue()`,
//   `Vue.createApp()`,
//   'transform `new Vue()` to createApp() with no arguments'
// )

defineInlineTest(
  { default: transform, parser },
  {},
  `new Vue({ render: h => h(App) }).$mount("#app")`,
  `Vue.createApp({ render: h => h(App) }).mount("#app")`,
  'transform `new Vue().$mount` with options to createApp().mount'
)

defineInlineTest(
  { default: transform, parser },
  {},
  `var vm = new Vue({ template: "<div>hello</div>" }); vm.$mount("#app")`,
  `var vm = Vue.createApp({ template: "<div>hello</div>" }); vm.mount("#app")`,
  'transform `vm.$mount` to vm.mount'
)

defineInlineTest(
  { default: transform, parser },
  {},
  `new MyComponent().$mount("#app")`,
  `Vue.createApp(MyComponent).mount("#app")`,
  'transform `new MyComponent().$mount`'
)

defineInlineTest(
  { default: transform, parser },
  {},
  `new MyComponent({ foo: "bar" }).$mount("#app")`,
  `Vue.createApp(MyComponent, { foo: "bar" }).mount("#app")`,
  'transform `new MyComponent().$mount` with additional options'
)

defineInlineTest(
  { default: transform, parser },
  { includeMaybeComponents: false },
  `new MyComponent().$mount("#app"); vm.$mount("#app")`,
  `new MyComponent().$mount("#app"); vm.$mount("#app")`,
  'do not transform `new MyComponent().$mount` or `vm.$mount` if `includeMaybeComponents` disabled'
)

defineInlineTest(
  { default: transform, parser },
  {},
  `new Vue({ el: "#app", render: h => h(App) })`,
  `Vue.createApp({\n  render: h => h(App)\n}).mount("#app")`,
  'transform `new Vue` with `el` prop'
)

defineInlineTest(
  { default: transform, parser },
  {},
  `new MyComponent({ el: "#app" })`,
  `Vue.createApp(MyComponent).mount("#app")`,
  'transform `new MyComponent` with `el` prop'
)

defineInlineTest(
  { default: transform, parser },
  {},
  `const container = new LazyContainer({ el, binding, vnode, lazy: this.lazy })`,
  `const container = new LazyContainer({ el, binding, vnode, lazy: this.lazy })`,
  'transform `new MyComponent` with `el` prop'
)

defineInlineTest(
  { default: transform, parser },
  {},
  `Vue.prototype.$baseEventBus = new Vue()`,
  `Vue.prototype.$baseEventBus = new Vue()`,
  'mitt and tiny-emitter are recommended in vue-next'
)
