import { defineInlineTest } from '../../src/testUtils.js'
import transform from '../remove-production-tip'

defineInlineTest(transform, {}, `Vue.config.productionTip = true`, ``)
