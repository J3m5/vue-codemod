import { defineInlineTest } from 'jscodeshift/src/testUtils.js'
import transform, { parser } from '../remove-vue-set-and-delete'

defineInlineTest(
  { default: transform, parser },
  {},
  `Vue.set(vm.someObject, 'b', 2);`,
  `vm.someObject['b'] = 2;`,
  'Remove Vue.set'
)

defineInlineTest(
  { default: transform, parser },
  {},
  `export default {
    methods: {
      modify() {
        this.$set(this.someObject, 'b', 2);
      }
    }
  };`,
  `export default {
    methods: {
      modify() {
        this.someObject['b'] = 2;
      }
    }
  };`,
  'Remove this.$set'
)

defineInlineTest(
  { default: transform, parser },
  {},
  `export default {
    created () {
      const vm = this;
      this.$on('some-event', function () {
        vm.$set(vm.someObject, 'b', 2);
      })
    }
  };`,
  `export default {
    created () {
      const vm = this;
      this.$on('some-event', function () {
        vm.someObject['b'] = 2;
      })
    }
  };`,
  'Remove vm.$set when vm is an alias to this'
)

defineInlineTest(
  { default: transform, parser },
  {},
  `export default {
    created () {
      var vm = this;
      vm = { $set: () => {} }
      this.$on('some-event', function () {
        vm.$set(vm.someObject, 'b', 2);
      })
    }
  };`,
  `export default {
    created () {
      var vm = this;
      vm = { $set: () => {} }
      this.$on('some-event', function () {
        vm.$set(vm.someObject, 'b', 2);
      })
    }
  };`,
  `Don't remove vm.$set when we are not sure if vm is an alias to this`
)

defineInlineTest(
  { default: transform, parser },
  {},
  `value.$set('a', 1)`,
  `value.$set('a', 1)`,
  `don't remove random .$set functions`
)

defineInlineTest(
  { default: transform, parser },
  {},
  `Vue.delete(vm.someObject, 'b');`,
  `delete vm.someObject['b'];`,
  'Remove Vue.delete'
)

defineInlineTest(
  { default: transform, parser },
  {},
  `export default {
    methods: {
      modify() {
        this.$delete(this.someObject, 'b');
      }
    }
  };`,
  `export default {
    methods: {
      modify() {
        delete this.someObject['b'];
      }
    }
  };`,
  'Remove this.$delete'
)

defineInlineTest(
  { default: transform, parser },
  {},
  `export default {
    created () {
      const vm = this;
      this.$on('some-event', function () {
        vm.$delete(vm.someObject, 'b');
      })
    }
  };`,
  `export default {
    created () {
      const vm = this;
      this.$on('some-event', function () {
        delete vm.someObject['b'];
      })
    }
  };`,
  'Remove vm.$delete when vm is an alias to this'
)

defineInlineTest(
  { default: transform, parser },
  {},
  `export default {
    created () {
      var vm = this;
      vm = { $delete: () => {} }
      this.$on('some-event', function () {
        vm.$delete(vm.someObject, 'b');
      })
    }
  };`,
  `export default {
    created () {
      var vm = this;
      vm = { $delete: () => {} }
      this.$on('some-event', function () {
        vm.$delete(vm.someObject, 'b');
      })
    }
  };`,
  `Don't remove vm.$delete when we are not sure if vm is an alias to this`
)

defineInlineTest(
  { default: transform, parser },
  {},
  `value.$delete('a', 1)`,
  `value.$delete('a', 1)`,
  `don't remove random .$delete functions`
)

// TODO: delete
