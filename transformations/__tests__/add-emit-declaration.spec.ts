import { defineInlineTest } from 'jscodeshift/src/testUtils'
import transform, { parser } from '../add-emit-declaration'

defineInlineTest(
  // @ts-ignore
  { default: transform, parser },
  {},
  `export default {
  props: ['text'],
  methods: {
    input: function() {
      this.$emit('increment')
      this.$emit('decrement')
    }
  }
}`,
  `export default {
  emits: ["increment", "decrement"],
  props: ['text'],

  methods: {
    input: function() {
      this.$emit('increment')
      this.$emit('decrement')
    }
  }
};`,
  'add emit declaration'
)

defineInlineTest(
  // @ts-ignore
  { default: transform, parser },
  {},
  `export default {
  emits: [],
  props: ['text'],
  methods: {
    input: function() {
      this.$emit('increment')
      this.$emit('decrement')
    }
  }
}`,
  `export default {
  emits: ["increment", "decrement"],
  props: ['text'],
  methods: {
    input: function() {
      this.$emit('increment')
      this.$emit('decrement')
    }
  }
}`,
  'add emit declaration(has emits property but empty)'
)

defineInlineTest(
  // @ts-ignore
  { default: transform, parser },
  {},
  `export default {
  emits: ['increment'],
  props: ['text'],
  methods: {
    input: function() {
      this.$emit('increment')
      this.$emit('decrement')
    }
  }
}
`,
  `export default {
  emits: ['increment', "decrement"],
  props: ['text'],
  methods: {
    input: function() {
      this.$emit('increment')
      this.$emit('decrement')
    }
  }
}`,
  'add emit declaration(has emits property and not empty)'
)
