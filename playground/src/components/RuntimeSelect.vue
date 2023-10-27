<template>
  <select
    v-model="store.runtime"
    class="inline-block appearance-none outline-none bg-transparent text-white border-opacity-25 border border-gray-400 hover:border-white text-sm px-4 py-2 rounded leading-tight focus:outline-none focus:shadow-outline"
  >
    <option
      class="text-black"
      v-for="(value, name, index) in runtimes"
      :value="value"
      :key="index"
    >
      {{ name }}
    </option>
  </select>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { store } from '../store'

export default defineComponent({
  props: {
    value: {
      type: String,
    },
  },
  setup() {
    const runtimes = {
      TypeScript: 'ts',
      JavaScript: 'js',
    }
    return { store, runtimes }
  },
})
</script>
