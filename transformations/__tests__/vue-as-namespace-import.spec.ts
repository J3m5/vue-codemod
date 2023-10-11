import { defineInlineTest } from '../../src/testUtils.js'
import transform, { parser } from '../vue-as-namespace-import'

defineInlineTest(
  { default: transform, parser },
  {},
  `import Vue from "vue";`,
  `import * as Vue from "vue";`,
  'correctly transform default import from vue'
)

defineInlineTest(
  { default: transform, parser },
  {},
  `import Vue, { nextTick } from "vue";`,
  `import * as Vue, { nextTick } from "vue";`,
  'correctly transform multiple imports from vue'
)
