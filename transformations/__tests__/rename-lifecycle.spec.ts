import { defineInlineTest } from 'jscodeshift/src/testUtils.js'

import renameLifeCycle, { parser } from '../rename-lifecycle'

defineInlineTest(
  { default: renameLifeCycle, parser },
  {},
  `export default {
    destroyed: function () {
      console.log('foo')
    },
    beforeDestroy: function () {
      console.log('bar')
    },
    methods: {
      destroyed: function() {},
      beforeDestroy: function() {}
    }
}
`,
  `export default {
    unmounted: function () {
      console.log('foo')
    },
    beforeUnmount: function () {
      console.log('bar')
    },
    methods: {
      destroyed: function() {},
      beforeDestroy: function() {}
    }
}`
)
