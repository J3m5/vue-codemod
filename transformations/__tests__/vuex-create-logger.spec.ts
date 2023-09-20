import { defineInlineTest } from 'jscodeshift/src/testUtils.js'
import transform, { parser } from '../vuex-create-logger'

defineInlineTest(
  // @ts-ignore
  { default: transform, parser },
  {},
  `import createLogger from 'vuex/dist/logger'
const store = new Vuex.Store({
  plugins: [createLogger()]
})`,
  `import { createLogger } from "vuex";
const store = new Vuex.Store({
  plugins: [createLogger()]
})`,
  'vuex createLogger'
)

defineInlineTest(
  // @ts-ignore
  { default: transform, parser },
  {},
  `import logger from 'vuex/dist/logger'
const store = new Vuex.Store({
  plugins: [logger()]
})`,
  `import { createLogger } from "vuex";
const store = new Vuex.Store({
  plugins: [createLogger()]
})`,
  'vuex createLogger another name'
)
