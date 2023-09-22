import type { Parser } from 'jscodeshift'

import CompositionAPI, {
  parser as CompositionAPIParser
} from './composition-api/index'

import newComponentApi, {
  parser as newComponentApiParser
} from './new-component-api'
import vueClassComponentV8, {
  parser as vueClassComponentV8Parser
} from './vue-class-component-v8'
import newGlobalApi, { parser as newGlobalApiParser } from './new-global-api'
import vueRouterV4, { parser as vueRouterV4Parser } from './vue-router-v4'
import vuexV4, { parser as vuexV4Parser } from './vuex-v4'
import defineComponent, {
  parser as defineComponentParser
} from './define-component'
import newVueToCreateApp, {
  parser as newVueToCreateAppParser
} from './new-vue-to-create-app'
import scopedSlotsToSlots, {
  parser as scopedSlotsToSlotsParser
} from './scoped-slots-to-slots'
import newDirectiveApi, {
  parser as newDirectiveApiParser
} from './new-directive-api'
import removeVueSetAndDelete, {
  parser as removeVueSetAndDeleteParser
} from './remove-vue-set-and-delete'
import renameLifecycle, {
  parser as renameLifecycleParser
} from './rename-lifecycle'
import addEmitDeclaration, {
  parser as addEmitDeclarationParser
} from './add-emit-declaration'
import treeShaking, { parser as treeShakingParser } from './tree-shaking'
import vModel, { parser as vModelParser } from './v-model'
import renderToResolveComponent, {
  parser as renderToResolveComponentParser
} from './render-to-resolveComponent'
import vueI18nV9, { parser as vueI18nV9Parser } from './vue-i18n-v9'
import vuexCreateLogger, {
  parser as vuexCreateLoggerParser
} from './vuex-create-logger'
import elementPlusImport, {
  parser as elementPlusImportParser
} from './element-plus-upgrade'

// atomic ones
import removeContextualHFromRender, {
  parser as removeContextualHFromRenderParser
} from './remove-contextual-h-from-render'
import removeProductionTip, {
  parser as removeProductionTipParser
} from './remove-production-tip'
import removeTrivialRoot, {
  parser as removeTrivialRootParser
} from './remove-trivial-root'
import removeVueUse, { parser as removeVueUseParser } from './remove-vue-use'
import rootPropToUse, {
  parser as rootPropToUseParser
} from './root-prop-to-use'
import vueAsNamespaceImport, {
  parser as vueAsNamespaceImportParser
} from './vue-as-namespace-import'

// generic utility tranformations
import addImport, { parser as addImportParser } from './add-import'
import removeExtraneousImport, {
  parser as removeExtraneousImportParser
} from './remove-extraneous-import'

import router4OnreadyToIsready, {
  parser as router4OnreadyToIsreadyParser
} from './router/router4-onready-to-isready'
import routerUpdateAddRoute, {
  parser as routerUpdateAddRouteParser
} from './router/router-update-addRoute'

import constApp, { parser as constAppParser } from './const-app'
// need to use 'const app=Vue.createApp'
import globalFilter, { parser as globalFilterParser } from './global-filter'
import moveAppMount, { parser as moveAppMountParser } from './move-app-mount'

// manual (must be used at the end of list)
// rule's name must be start with 'manual-'
import manualRemoveVue, {
  parser as manualRemoveVueParser
} from './manual/manual-remove-Vue'
import manualRemoveVueRouter, {
  parser as manualRemoveVueRouterParser
} from './manual/manual-remove-VueRouter'
import manualRemoveOnOffOnce, {
  parser as manualRemoveOnOffOnceParser
} from './manual/manual-remove-on-off-once'
import manualRemoveRouterStar, {
  parser as manualRemoveRouterStarParser
} from './manual/manual-remove-router-star'
import manualRemoveConfigKeycodes, {
  parser as manualRemoveConfigKeycodesParser
} from './manual/manual-remove-config-keycodes'
import manualRemoveFilter, {
  parser as manualRemoveFilterParser
} from './manual/manual-remove-filter'
import wrap from '../src/wrapAstTransformation'

type JSTransformationModule = {
  default: ReturnType<typeof wrap>
  parser?: string | Parser
}

const transformationMap: {
  [ruleName: string]: JSTransformationModule
} = {
  'composition-api': { default: CompositionAPI, parser: CompositionAPIParser },
  'new-component-api': {
    default: newComponentApi,
    parser: newComponentApiParser
  },
  'vue-class-component-v8': {
    default: vueClassComponentV8,
    parser: vueClassComponentV8Parser
  },
  'new-global-api': { default: newGlobalApi, parser: newGlobalApiParser },
  'vue-router-v4': { default: vueRouterV4, parser: vueRouterV4Parser },
  'vuex-v4': { default: vuexV4, parser: vuexV4Parser },
  'define-component': {
    default: defineComponent,
    parser: defineComponentParser
  },
  'new-vue-to-create-app': {
    default: newVueToCreateApp,
    parser: newVueToCreateAppParser
  },
  'scoped-slots-to-slots': {
    default: scopedSlotsToSlots,
    parser: scopedSlotsToSlotsParser
  },
  'new-directive-api': {
    default: newDirectiveApi,
    parser: newDirectiveApiParser
  },
  'remove-vue-set-and-delete': {
    default: removeVueSetAndDelete,
    parser: removeVueSetAndDeleteParser
  },
  'rename-lifecycle': {
    default: renameLifecycle,
    parser: renameLifecycleParser
  },
  'add-emit-declaration': {
    default: addEmitDeclaration,
    parser: addEmitDeclarationParser
  },
  'tree-shaking': { default: treeShaking, parser: treeShakingParser },
  'v-model': { default: vModel, parser: vModelParser },
  'render-to-resolveComponent': {
    default: renderToResolveComponent,
    parser: renderToResolveComponentParser
  },
  'vue-i18n-v9': { default: vueI18nV9, parser: vueI18nV9Parser },
  'vuex-create-logger': {
    default: vuexCreateLogger,
    parser: vuexCreateLoggerParser
  },
  'element-plus-import': {
    default: elementPlusImport,
    parser: elementPlusImportParser
  },

  // atomic ones
  'remove-contextual-h-from-render': {
    default: removeContextualHFromRender,
    parser: removeContextualHFromRenderParser
  },
  'remove-production-tip': {
    default: removeProductionTip,
    parser: removeProductionTipParser
  },
  'remove-trivial-root': {
    default: removeTrivialRoot,
    parser: removeTrivialRootParser
  },
  'remove-vue-use': { default: removeVueUse, parser: removeVueUseParser },
  'root-prop-to-use': { default: rootPropToUse, parser: rootPropToUseParser },
  'vue-as-namespace-import': {
    default: vueAsNamespaceImport,
    parser: vueAsNamespaceImportParser
  },

  // generic utility tranformations
  'add-import': { default: addImport, parser: addImportParser },
  'remove-extraneous-import': {
    default: removeExtraneousImport,
    parser: removeExtraneousImportParser
  },

  'router4-onready-to-isready': {
    default: router4OnreadyToIsready,
    parser: router4OnreadyToIsreadyParser
  },
  'router-update-addRoute': {
    default: routerUpdateAddRoute,
    parser: routerUpdateAddRouteParser
  },

  'const-app': { default: constApp, parser: constAppParser },
  // need to use 'const app=Vue.createApp'
  'global-filter': { default: globalFilter, parser: globalFilterParser },
  'move-app-mount': { default: moveAppMount, parser: moveAppMountParser },

  // manual (must be used at the end of list)
  // rule's name must be start with 'manual-'
  'manual-remove-Vue': {
    default: manualRemoveVue,
    parser: manualRemoveVueParser
  },
  'manual-remove-VueRouter': {
    default: manualRemoveVueRouter,
    parser: manualRemoveVueRouterParser
  },
  'manual-remove-on-off-once': {
    default: manualRemoveOnOffOnce,
    parser: manualRemoveOnOffOnceParser
  },
  'manual-remove-router-star': {
    default: manualRemoveRouterStar,
    parser: manualRemoveRouterStarParser
  },
  'manual-remove-config-keycodes': {
    default: manualRemoveConfigKeycodes,
    parser: manualRemoveConfigKeycodesParser
  },
  'manual-remove-filter': {
    default: manualRemoveFilter,
    parser: manualRemoveFilterParser
  }
}

export const excludedTransformations = [
  'define-component',
  'new-vue-to-create-app',
  'remove-contextual-h-from-render',
  'remove-production-tip',
  'remove-trivial-root',
  'remove-vue-use',
  'root-prop-to-use',
  'vue-as-namespace-import',
  'add-import',
  'remove-extraneous-import'
]

export default transformationMap
