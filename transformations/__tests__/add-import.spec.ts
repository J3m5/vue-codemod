import { defineInlineTest } from 'jscodeshift/src/testUtils.js'
import transform, { parser } from '../add-import.js'

defineInlineTest(
  // @ts-ignore
  { default: transform, parser },
  {
    specifier: {
      type: 'default',
      local: 'Vue'
    },
    source: 'vue'
  },
  ``,
  `import Vue from "vue";`,
  'Add default import'
)

defineInlineTest(
  // @ts-ignore
  { default: transform, parser },
  {
    specifier: {
      type: 'named',
      imported: 'createApp'
    },
    source: 'vue'
  },
  ``,
  `import { createApp } from "vue";`,
  'Add named import'
)

defineInlineTest(
  // @ts-ignore
  { default: transform, parser },
  {
    specifier: {
      type: 'named',
      imported: 'createApp',
      local: 'createVueApp'
    },
    source: 'vue'
  },
  ``,
  `import { createApp as createVueApp } from "vue";`,
  'Add named import with an alias'
)

defineInlineTest(
  // @ts-ignore
  { default: transform, parser },
  {
    specifier: {
      type: 'namespace',
      local: 'Vue'
    },
    source: 'vue'
  },
  ``,
  `import * as Vue from "vue";`,
  'Add namespace import'
)

defineInlineTest(
  // @ts-ignore
  { default: transform, parser },
  {
    specifier: {
      type: 'default',
      local: 'Vue'
    },
    source: 'vue'
  },
  `import Vue from "vue";`,
  `import Vue from "vue";`,
  'Do not add duplicate default imports'
)

defineInlineTest(
  // @ts-ignore
  { default: transform, parser },
  {
    specifier: {
      type: 'named',
      imported: 'createApp'
    },
    source: 'vue'
  },
  `import { createApp } from "vue";`,
  `import { createApp } from "vue";`,
  'Do not add duplicate named imports'
)

defineInlineTest(
  // @ts-ignore
  { default: transform, parser },
  {
    specifier: {
      type: 'named',
      imported: 'createApp'
    },
    source: 'vue'
  },
  `import Vue from "vue";`,
  `import Vue, { createApp } from "vue";`,
  'Add named import as a sibling to another default import'
)

defineInlineTest(
  // @ts-ignore
  { default: transform, parser },
  {
    specifier: {
      type: 'named',
      imported: 'h'
    },
    source: 'vue'
  },
  `import { createApp } from "vue";`,
  `import { createApp, h } from "vue";`,
  'Add a named import as a sibling to another named import'
)

defineInlineTest(
  // @ts-ignore
  { default: transform, parser },
  {
    specifier: {
      type: 'named',
      imported: 'h'
    },
    source: 'vue'
  },
  `import * as Vue from "vue";`,
  `import * as Vue from "vue";\nimport { h } from "vue";`,
  'Do not add imports alongside a namespace import'
)
