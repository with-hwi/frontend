<template>
  <div
    class="relative inline-block self-center drag-none w-[36px] h-[36px]"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
  >
    <img :src="markerImage" />
    <span class="absolute top-[2px] text-center left-0 right-0 text-black font-bold text-sm">
      {{ number }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  number: number
  highlighted: boolean
}

const props = defineProps<Props>()
const hovered = ref(false)

const markerImage = computed(() => {
  if (props.highlighted || hovered.value) {
    return '/images/map/marker_ordered_hover.svg'
  }
  return '/images/map/marker_ordered.svg'
})
</script>

<style scoped>
.drag-none,
.drag-none * {
  @apply select-none;
  -webkit-user-drag: none;
  -khtml-user-drag: none;
  -moz-user-drag: none;
  -o-user-drag: none;
  user-drag: none;
}
</style>
