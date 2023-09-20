import { defineInlineTest } from 'jscodeshift/src/testUtils.js'
import transform, { parser } from '../vue-class-component-v8'

defineInlineTest(
  // @ts-ignore
  { default: transform, parser },
  {},
  `import { Component } from 'vue-class-component'`,
  `import { Options as Component } from 'vue-class-component'`,
  'correctly transform import Component form vue-class-component'
)

defineInlineTest(
  // @ts-ignore
  { default: transform, parser },
  {},
  `import { Component, Props } from 'vue-class-component'`,
  `import { Options as Component, Props } from 'vue-class-component'`,
  'correctly transform import Component form vue-class-component w/ multiple import'
)
