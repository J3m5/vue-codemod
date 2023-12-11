import { defineInlineTest } from '../../src/testUtils.js'
import transform, { parser } from '../render-to-resolveComponent'

defineInlineTest(
  { default: transform, parser },
  {},
  `export default {
  render(h){
    return h('button-counter')
  }
}`,
  `
import { resolveComponent } from "vue";
export default {
  render() {
    const buttonCounter = resolveComponent('button-counter')
    return buttonCounter;
  }
}`,
  'transform render-to-resolveComponent'
)
