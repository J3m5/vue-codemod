<template>
  <div>
    {{ title }}
  </div>
</template>
<script>
/**
 * const machin = 'test'
 */

export default {
  name: 'Test',
  props: {
    title: {
      default: 'title',
      type: String,
    },
    title2: {
      required: true,
      type: Number,
    },
    title3: {
      required: true,
      type: Array,
    },
    title4: {
      required: true,
      type: Object,
    },
    title5: {
      required: true,
      type: Date,
    },
    title6: {
      required: true,
      type: Function,
    },
    title7: {
      type: Symbol,
    },
    title8: String,
  },
  data: {
    subtitle: 'test',
    undef: undefined,
    nan: NaN,
    num: 1,
    nu: null,
    loading: true,
    obj: { a: 1 },
    arr: [1],
  },
  mounted() {
    console.log(this.$refs.titleDiv)
  },
  beforeCreate() {
    console.log(this.$refs.titleDiv)
  },
  created() {
    console.log(this.$refs.titleDiv)
  },
  beforeMount() {
    console.log(this.$refs.titleDiv)
  },
  beforeUpdate() {
    console.log(this.$refs.titleDiv)
  },
  updated() {
    console.log(this.$refs.titleDiv)
  },
  activated() {
    console.log(this.$refs.titleDiv)
  },
  deactivated() {
    console.log(this.$refs.titleDiv)
  },
  beforeDestroy() {
    console.log(this.$refs.titleDiv)
  },
  errorCaptured() {
    console.log(this.$refs.titleDiv)
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      console.log(vm)
    })
  },
  beforeRouteLeave(to, from, next) {
    next((vm) => {
      console.log(vm)
    })
  },
  beforeRouteUpdate(to, from, next) {
    next((vm) => {
      console.log(vm)
    })
  },
  watch: {
    title(val, oldVal) {
      console.log(val, oldVal)
      this.$router.push('/')
    },
    undef: (val, oldVal) => {
      console.log(val, oldVal)
      console.log(this.$route.name)
    },
    nan: (val, oldVal) => console.log(val, oldVal),
    num: {
      handler(val, oldVal) {
        console.log(val, oldVal)
      },
      deep: true,
      immediate: true,
    },
    nu: {
      handler: (val, oldVal) => {
        console.log(val, oldVal)
      },
      deep: true,
      immediate: true,
    },
    loading: {
      handler: function (val, oldVal) {
        console.log(val, oldVal)
      },
      deep: true,
      immediate: true,
    },
    'obj.a': (val, oldVal) => {
      console.log(val, oldVal)
    },
    loading: function (val, oldVal) {
      console.log(val, oldVal)
    },
  },
  filters: {
    uppercase: (value) => value.toUpperCase(),
    lowercase(value) {
      return value.toLowerCase()
    },
    capitalize: function (value) {
      return value.charAt(0).toUpperCase() + value.slice(1)
    },
  },
  methods: {
    async start() {
      console.log(this.$refs.titleDiv)
      this.loading = false
      this.obj.a = 2
    },
    finish: async (bool) => {
      this.loading = bool
    },
    restart: async function () {
      this.loading = false
      return this.computeVM0
    },
  },
  computed: {
    computeVM0: (vm) => vm.num + 1,
    computeVM1: (vm) => {
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
    },
  },
}
</script>
