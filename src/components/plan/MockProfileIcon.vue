<template>
  <div
    class="rounded-full flex flex-shrink-0 items-center justify-center text-white font-semibold shadow-sm cursor-default select-none"
    :style="{
      backgroundColor: backgroundColor,
      width: size + 'px',
      height: size + 'px',
      fontSize: Math.floor(size * 0.4) + 'px',
    }"
    :title="nickname"
  >
    {{ firstLetter }}
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  nickname: string
  size?: number
}

const props = withDefaults(defineProps<Props>(), {
  size: 40,
})

// 닉네임의 첫 글자 추출
const firstLetter = computed(() => {
  return props.nickname.charAt(0).toUpperCase()
})

// 닉네임을 기반으로 일관된 색상 생성
const backgroundColor = computed(() => {
  // 닉네임을 해시값으로 변환
  let hash = 0
  for (let i = 0; i < props.nickname.length; i++) {
    hash = props.nickname.charCodeAt(i) + ((hash << 5) - hash)
  }

  // 해시값을 HSL 색상으로 변환 (채도와 밝기는 고정)
  const hue = Math.abs(hash) % 360
  return `hsl(${hue}, 65%, 55%)`
})
</script>

<style scoped>
.profile-icon {
  width: v-bind('props.size + "px"');
  height: v-bind('props.size + "px"');
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: v-bind('Math.floor(props.size * 0.4) + "px"');
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  cursor: default;
  user-select: none;
}
</style>
