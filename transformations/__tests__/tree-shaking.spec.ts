import { defineInlineTest } from 'jscodeshift/src/testUtils.js'

import nextTick, { parser as nextTickParser } from '../next-tick'
import observable, { parser as nextObservable } from '../observable'
import version, { parser as nextTickVersion } from '../version'
import treeShaking, { parser as nextTreeShaking } from '../tree-shaking'

// Vue.nextTick() => nextTick()
defineInlineTest(
  // @ts-ignore
  { default: nextTick, parser: nextTickParser },
  {},
  `import Vue from 'vue'
Vue.nextTick(() => {
  console.log('foo')
})
`,
  `import Vue, { nextTick } from 'vue';
nextTick(() => {
  console.log('foo')
})
`,
  'tree-shaking (Vue.nextTick() to nextTick())'
)

// Vue.observable() => reactive()
defineInlineTest(
  // @ts-ignore
  { default: observable, parser: nextObservable },
  {},
  `import Vue from 'vue'
const state = Vue.observable({ count: 0 })`,
  `import Vue, { reactive } from 'vue';
const state = reactive({ count: 0 })`,
  'tree-shaking (Vue.observable to reactive)'
)

// Vue.version() => version()
defineInlineTest(
  // @ts-ignore
  { default: version, parser: nextTickVersion },
  {},
  `import Vue from 'vue'
var version = Number(Vue.version.split('.')[0])`,
  `import Vue, { version } from 'vue';
var version = Number(version.split('.')[0])`,
  'tree-shaking (Vue.version to version)'
)

defineInlineTest(
  // @ts-ignore
  { default: treeShaking, parser: nextTreeShaking },
  {},
  `import Vue from 'vue'
Vue.nextTick(function() {})
Vue.observable({ count: 0 })
Vue.version`,
  `import { nextTick, reactive, version } from 'vue';
nextTick(function() {})
reactive({ count: 0 })
version
`,
  'tree-shaking'
)
