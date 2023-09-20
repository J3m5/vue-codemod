import { defineInlineTest } from 'jscodeshift/src/testUtils.js'
import transform, { parser } from '../remove-contextual-h-from-render'

defineInlineTest(
  // @ts-ignore
  { default: transform, parser },
  {},
  `export default { render: h => h("div", ["hello"]) };`,
  `import { h } from "vue";\nexport default { render: () => h("div", ["hello"]) };`,
  'remove h from arrow functions'
)

defineInlineTest(
  // @ts-ignore
  { default: transform, parser },
  {},
  `export default { render: function(h) { return h("div", ["hello"]) } };`,
  `import { h } from "vue";\nexport default { render: function() { return h("div", ["hello"]) } };`,
  'remove h from arrow functions'
)

defineInlineTest(
  // @ts-ignore
  { default: transform, parser },
  {},
  `export default { render(h) { return h("div", ["hello"]); } };`,
  `import { h } from "vue";\nexport default { render() { return h("div", ["hello"]); } };`,
  'remove h from object methods'
)
