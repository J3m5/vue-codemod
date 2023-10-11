import { defineInlineTest } from '../../src/testUtils.js'

import transform, { parser } from '../const-app.js'

defineInlineTest(
  { default: transform, parser },
  {},
  `Vue.createApp(App).use(button_counter).use(router).use(store).mount("#app");
Vue.directive('demo', {})
Vue.component('myComponent',{})
`,
  `const app = Vue.createApp(App).use(button_counter).use(router).use(store);
app.mount("#app");
app.directive('demo', {})
app.component('myComponent',{})`,
  'add const app and transform Vue to app in main.js'
)

defineInlineTest(
  { default: transform, parser },
  {},
  `const app = Vue.createApp(App).use(button_counter).use(router).use(store);
Vue.directive('demo', {})
Vue.component('myComponent',{})
app.mount("#app");`,
  `const app = Vue.createApp(App).use(button_counter).use(router).use(store);
app.directive('demo', {})
app.component('myComponent',{})
app.mount("#app");`,

  'do not add const app when app.mount() is already exist '
)
