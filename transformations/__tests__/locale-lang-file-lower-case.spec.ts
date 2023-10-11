import { defineInlineTest } from '../../src/testUtils.js'

import transform, { parser } from '../element-plus/locale-lang-file-lower-case'

defineInlineTest(
  { default: transform, parser },
  {},
  `
  import locale1 from 'element-plus/lib/locale/lang/zh-CN'
  import locale2 from 'element-plus/lib/locale/lang/tr-TR'
  import locale3 from 'element-plus/lib/locale/lang/en'
`,
  `
  import locale1 from "element-plus/lib/locale/lang/zh-cn"
  import locale2 from "element-plus/lib/locale/lang/tr-tr"
  import locale3 from 'element-plus/lib/locale/lang/en'
`,
  'element-ui locale lang file lower case'
)
