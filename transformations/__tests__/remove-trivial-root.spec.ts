import { defineInlineTest } from 'jscodeshift/src/testUtils.js'
import transform, { parser } from '../remove-trivial-root'

defineInlineTest(
  { default: transform, parser },
  {},
  `createApp({ render: () => h(App) });`,
  `createApp(App);`,
  'remove trivial arrow function render'
)

defineInlineTest(
  { default: transform, parser },
  {},
  `Vue.createApp({ render: () => h(App) });`,
  `Vue.createApp(App);`,
  'Can recognize Vue.createApp'
)

defineInlineTest(
  { default: transform, parser },
  {},
  `createApp({ render() { return h(App) } });`,
  `createApp(App);`,
  'remove trivial object method render'
)

defineInlineTest(
  { default: transform, parser },
  {},
  `createApp({ render: () => { return h(App) } });`,
  `createApp(App);`,
  'remove trivial arrow function render with a block statement'
)

defineInlineTest(
  { default: transform, parser },
  {},
  `createApp({ render: () => h(App), data() { return { a: 1 } } });`,
  `createApp({ render: () => h(App), data() { return { a: 1 } } });`,
  'do not touch non-trivial root components'
)
