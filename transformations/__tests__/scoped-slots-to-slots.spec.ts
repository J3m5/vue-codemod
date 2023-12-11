import { defineInlineTest } from '../../src/testUtils.js'
import transform, { parser } from '../scoped-slots-to-slots'

defineInlineTest(
  { default: transform, parser },
  {},
  `this.$scopedSlots
  this["$scopedSlots"]

  vm.$scopedSlots
  vm["$scopedSlots"]`,
  `this.$slots
  this["$slots"]

  vm.$slots
  vm["$slots"]`,
  'transform `$scopedSlots` to `$slots`'
)
