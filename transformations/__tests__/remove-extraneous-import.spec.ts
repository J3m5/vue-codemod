import { defineInlineTest } from '../../src/testUtils.js'
import transform, { parser } from '../remove-extraneous-import'

defineInlineTest(
  { default: transform, parser },
  {
    localBinding: 'Vue'
  },
  `import Vue from "vue";`,
  ``,
  'Remove extraneous default import'
)

defineInlineTest(
  { default: transform, parser },
  {
    localBinding: 'createApp'
  },
  `import { createApp } from "vue";`,
  ``,
  'Remove extraneous named import'
)

defineInlineTest(
  { default: transform, parser },
  {
    localBinding: 'createVueApp'
  },
  `import { createApp as createVueApp } from "vue";`,
  ``,
  'Remove extraneous named import with alias'
)

defineInlineTest(
  { default: transform, parser },
  {
    localBinding: 'Vue'
  },
  `import * as Vue from "vue";`,
  ``,
  'Remove extraneous namespaced import'
)

defineInlineTest(
  { default: transform, parser },
  {
    localBinding: 'style'
  },
  `import style from "./style.css";`,
  `import "./style.css";`,
  'Do not remove import declaration for modules with possible side effects'
)

defineInlineTest(
  { default: transform, parser },
  {
    localBinding: 'Vue'
  },
  `import Vue from "vue";\nnew Vue()`,
  `import Vue from "vue";\nnew Vue()`,
  'Do not touch the code if the import is in use'
)
