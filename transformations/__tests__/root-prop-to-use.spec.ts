import { defineInlineTest } from '../../src/testUtils.js'
import type { GlobalApi } from '../../src/global'
import transform, { parser } from '../root-prop-to-use'

global.globalApi = []
const api1: GlobalApi = {
  name: 'api1',
  path: 'src/directive/permission/api1.js'
}
const api2: GlobalApi = { name: 'api2', path: 'src/directive/api2.js' }
global.globalApi.push(api1)
global.globalApi.push(api2)

defineInlineTest(
  { default: transform, parser },
  {
    rootPropName: 'router'
  },
  `createApp({ router });`,
  `createApp({}).use(router);`,
  'correctly transform root `router` prop to `.use(router)`'
)

defineInlineTest(
  { default: transform, parser },
  {
    rootPropName: 'router'
  },
  `Vue.createApp({ router });`,
  `Vue.createApp({}).use(router);`,
  'Can recognize Vue.createApp'
)

defineInlineTest(
  { default: transform, parser },
  {
    rootPropName: 'router'
  },
  `createApp({});`,
  `createApp({});`
)

defineInlineTest(
  { default: transform, parser },
  { rootPropName: '', isGlobalApi: true },
  `Vue.createApp();`,
  `import api1 from "../src/directive/permission/api1.js";
import api2 from "../src/directive/api2.js";
Vue.createApp().use(api1).use(api2);`,
  'Can recognize global api use'
)

defineInlineTest(
  { default: transform, parser },
  { rootPropName: '', isGlobalApi: true },
  `import Comp1 from "./Comp1.vue"
  export default {
    install: app => {
      app.component("comp1", Comp1);
    }
  }`,
  `import Comp1 from "./Comp1.vue"
  export default {
    install: app => {
      app.component("comp1", Comp1);
    }
  }`,
  'No target Approots, jump out of this transition. '
)
