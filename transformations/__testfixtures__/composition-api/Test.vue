<template>
  <div ref="titleDiv">
    {{ title }}
  </div>
</template>

<script>
export default {
  name: 'Test',
  props: {
    title: {
      required: true,
      type: String
    }
  },
  data: () => ({
    subtitle: 'test',
    undef: undefined,
    nan: NaN,
    num: 1,
    nu: null,
    loading: true,
    obj: { a: 1 },
    arr: [1]
  }),
  watch: {
    title(val, oldVal) {
      console.log(val, oldVal)
    },
    undef: (val, oldVal) => {
      console.log(val, oldVal)
    },
    nan: (val, oldVal) => console.log(val, oldVal),
    num: {
      handler(val, oldVal) {
        console.log(val, oldVal)
      },
      deep: true,
      immediate: true
    },
    nu: {
      handler: (val, oldVal) => {
        console.log(val, oldVal)
      },
      deep: true,
      immediate: true
    },
    loading: {
      handler: function (val, oldVal) {
        console.log(val, oldVal)
      },
      deep: true,
      immediate: true
    },
    'obj.a': (val, oldVal) => {
      console.log(val, oldVal)
    },
    loading: function (val, oldVal) {
      console.log(val, oldVal)
    }
  },
  filters: {
    uppercase: value => value.toUpperCase(),
    lowercase(value) {
      return value.toLowerCase()
    },
    capitalize: function (value) {
      return value.charAt(0).toUpperCase() + value.slice(1)
    }
  },
  methods: {
    async start() {
      console.log(this.$refs.titleDiv)
      this.loading = false
    },
    finish: async bool => {
      this.loading = bool
    },
    restart: async function () {
      this.loading = false
      return this.computeVM0
    }
  },
  computed: {
    computeVM0: vm => vm.num + 1,
    computeVM1: vm => {
      vm.num + 1
      vm.title = 'title'
      return vm.title
    },
    computeVM2(vm) {
      vm.num + 2
      vm.title = 'title'
    },
    computeVM3: function (vm) {
      vm.num + 3
      vm.title = 'title'
    },
    computeThis1() {
      this.num + 2
      this.title = 'title'
      return this.computeVM3
    },
    computeThis2: function () {
      this.num + 3
      this.title = 'title'
      this.finish(true)
    }
  }
}
</script>
