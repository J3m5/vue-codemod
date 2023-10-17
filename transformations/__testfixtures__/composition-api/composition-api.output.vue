import {
  computed,
  watch,
  ref,
  onBeforeCreate,
  onCreated,
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onErrorCaptured,
  onRenderTracked,
  onRenderTriggered,
  onBeforeUnmount,
  onUnmounted,
  onActivated,
  onDeactivated
} from 'vue'

import { onBeforeRouteUpdate, onBeforeRouteLeave } from 'vue-router'

const props = defineProps({
  title: {
    required: true,
    type: String
  }
})

const subtitle = ref('test')
const undef = ref(undefined)
const nan = ref(NaN)
const num = ref(1)
const nu = ref(null)
const loading = ref(true)
const obj = reactive({ a: 1 })
const arr = ref([1])
const titleDiv = ref(null)
const computeVM0 = computed(() => num.value + 1)

const computeVM1 = computed(() => {
  num.value + 1
  props.title = 'title'
  return props.title
})

const computeVM2 = computed(() => {
  num.value + 2
  props.title = 'title'
})

const computeVM3 = computed(() => {
  num.value + 3
  props.title = 'title'
})

const computeThis1 = computed(() => {
  num.value + 2
  props.title = 'title'
  return computeVM3.value
})

const computeThis2 = computed(() => {
  num.value + 3
  props.title = 'title'
  finish(true)
})

const start = async () => {
  console.log(titleDiv.value)
  loading.value = false
}

const finish = async () => {
  loading.value = bool
}

const restart = async () => {
  loading.value = false
  return computeVM0.value
}

const uppercase = value => value.toUpperCase()

const lowercase = value => {
  return value.toLowerCase()
}

const capitalize = value => {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

watch(
  () => props.title,
  (val, oldVal) => {
    console.log(val, oldVal)
  }
)

watch(undef, (val, oldVal) => {
  console.log(val, oldVal)
})

watch(nan, (val, oldVal) => console.log(val, oldVal))

watch(loading, (val, oldVal) => {
  console.log(val, oldVal)
})

watch(
  num,
  (val, oldVal) => {
    console.log(val, oldVal)
  },
  {
    deep: true,
    immediate: true
  }
)

watch(
  nu,
  (val, oldVal) => {
    console.log(val, oldVal)
  },
  {
    deep: true,
    immediate: true
  }
)

watch(
  loading,
  (val, oldVal) => {
    console.log(val, oldVal)
  },
  {
    deep: true,
    immediate: true
  }
)

onMounted(() => {
  console.log(titleDiv.value)
})

onBeforeCreate(() => {
  console.log(titleDiv.value)
})

onCreated(() => {
  console.log(titleDiv.value)
})

onBeforeMount(() => {
  console.log(titleDiv.value)
})

onBeforeUpdate(() => {
  console.log(titleDiv.value)
})

onUpdated(() => {
  console.log(titleDiv.value)
})

onActivated(() => {
  console.log(titleDiv.value)
})

onDeactivated(() => {
  console.log(titleDiv.value)
})

onBeforeUnmount(() => {
  console.log(titleDiv.value)
})

onErrorCaptured(() => {
  console.log(titleDiv.value)
})

onBeforeRouteEnter((to, from, next) => {
  next(vm => {
    console.log(vm)
  })
})

onBeforeRouteLeave((to, from, next) => {
  next(vm => {
    console.log(vm)
  })
})

onBeforeRouteUpdate((to, from, next) => {
  next(vm => {
    console.log(vm)
  })
})
