import { defineInlineTest } from 'jscodeshift/src/testUtils.js'
import transform from '../import-composition-api-from-vue'

defineInlineTest(
  // @ts-ignore
  transform,
  {},
  `import { defineComponent } from "@vue/composition-api";`,
  `import { defineComponent } from "vue";`,
  'basic support'
)

defineInlineTest(
  // @ts-ignore
  transform,
  {},
  `import { defineComponent } from "@vue/composition-api";\nimport { computed } from "@vue/composition-api";`,
  `import { defineComponent, computed } from "vue";`,
  'correctly transform multiple import declarations'
)

defineInlineTest(
  // @ts-ignore
  transform,
  {},
  `import * as vca from "@vue/composition-api";`,
  `import * as vca from "vue";`,
  'correctly transform multiple import declarations'
)

defineInlineTest(
  // @ts-ignore
  transform,
  {},
  `import VueCompositionApi, { defineComponent } from "@vue/composition-api";\nimport { computed } from "@vue/composition-api";`,
  `import VueCompositionApi from "@vue/composition-api";\nimport { defineComponent, computed } from "vue";`,
  'do not transform the default import' // it's taken care of by `remove-vue-use`
)

defineInlineTest(
  // @ts-ignore
  transform,
  {},
  `import * as Vue from "vue";`,
  `import * as Vue from "vue";`,
  'do nothing if no @vue/composition-api import encountered'
)
