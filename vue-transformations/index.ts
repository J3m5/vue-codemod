import type wrap from '../src/wrapVueTransformation'
import slotAttribute from './slot-attribute'
import slotDefault from './slot-default'
import slotScopeAttribute from './slot-scope-attribute'
import vForTemplateKey from './v-for-template-key'
import vElseIfKey from './v-else-if-key'
import transitionGroupRoot from './transition-group-root'
import vBindOrderSensitive from './v-bind-order-sensitive'
import vForVIfPrecedenceChanged from './v-for-v-if-precedence-changed'
import removeListeners from './remove-listeners'
import vBindSync from './v-bind-sync'
import removeVOnNative from './remove-v-on-native'
import routerLinkEventTag from './router-link-event-tag'
import routerLinkExact from './router-link-exact'
import routerViewKeepAliveTransition from './router-view-keep-alive-transition'

// element-ui transformation
import timePickerFormatAttribute from './element-ui/time-picker-format-attribute'
import tooltipRenameAttribute from './element-ui/tooltip-rename-attribute'
import popoverRenameAttribute from './element-ui/popover-rename-attribute'
import popconfirmRenameEvent from './element-ui/popconfirm-rename-event'
import removeRowTypeFlex from './element-ui/remove-row-type-flex'

// manual (must be used at the end of list)
import manualRemoveKeycode from './manual/manual-remove-keycode'

type VueTransformationModule = {
  default: ReturnType<typeof wrap>
}

const transformationMap: {
  [name: string]: VueTransformationModule
} = {
  'slot-attribute': { default: slotAttribute },
  'slot-default': { default: slotDefault },
  'slot-scope-attribute': { default: slotScopeAttribute },
  'v-for-template-key': { default: vForTemplateKey },
  'v-else-if-key': { default: vElseIfKey },
  'transition-group-root': { default: transitionGroupRoot },
  'v-bind-order-sensitive': { default: vBindOrderSensitive },
  'v-for-v-if-precedence-changed': { default: vForVIfPrecedenceChanged },
  'remove-listeners': { default: removeListeners },
  'v-bind-sync': { default: vBindSync },
  'remove-v-on-native': { default: removeVOnNative },
  'router-link-event-tag': { default: routerLinkEventTag },
  'router-link-exact': { default: routerLinkExact },
  'router-view-keep-alive-transition': {
    default: routerViewKeepAliveTransition
  },

  // element-ui transformation
  'time-picker-format-attribute': { default: timePickerFormatAttribute },
  'tooltip-rename-attribute': { default: tooltipRenameAttribute },
  'popover-rename-attribute': { default: popoverRenameAttribute },
  'popconfirm-rename-event': { default: popconfirmRenameEvent },
  'remove-row-type-flex': { default: removeRowTypeFlex },

  // manual (must be used at the end of list)
  'manual-remove-keycode': { default: manualRemoveKeycode }
}

export const excludedVueTransformations = ['v-bind-order-sensitive']

export default transformationMap
