import { defineInlineTest } from 'jscodeshift/src/testUtils.js'
import transform from '../remove-production-tip'

// @ts-ignore
defineInlineTest(transform, {}, `Vue.config.productionTip = true`, ``)
