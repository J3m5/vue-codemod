<template>
  {{ title }}
</template>

<script>
export default {
  name: 'Test',
  props: {
    title: {
      required: true,
      type: Object,
    },
  },
  data: () => ({
    subtitle: 'test',
    undef: undefined,
    nan: NaN,
    num: 1,
    nu: null,
    loading: true,
    obj: { a: 1 },
    arr: [1],
  }),
  methods: {
    async start() {
      this.loading = false
    },
    finish: async (vm) => {
      vm.loading = false
    },
    restart: async function () {
      this.loading = false
    },
  },
  computed: {
    compute: (vm) => vm.num + 1,
    recompute() {
      this.num + 2
    },
    computeAgain: function () {
      this.num + 3
    },
  },
}
</script>
