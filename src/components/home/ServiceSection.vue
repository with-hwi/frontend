<script setup lang="ts">
import { ref } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'

interface Props {
  title: string
  highlightText?: string
  description: string
  colorScheme: 'primary' | 'accent' | 'secondary'
  backgroundColor?: string
  reversed?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  backgroundColor: 'bg-white',
  reversed: false,
})

// Intersection Observer
const imageRef = ref<HTMLElement>()
const imageVisible = ref(false)

useIntersectionObserver(
  imageRef,
  ([{ isIntersecting }]) => {
    if (isIntersecting) {
      imageVisible.value = true
    }
  },
  { threshold: 0.3 },
)

// Color scheme mappings for title highlight
const colorSchemes = {
  primary: {
    titleHighlight: 'text-primary-600',
  },
  accent: {
    titleHighlight: 'text-accent-600',
  },
  secondary: {
    titleHighlight: 'text-primary-600',
  },
}

const currentColorScheme = colorSchemes[props.colorScheme]
</script>

<template>
  <section
    :class="[
      backgroundColor,
      'min-h-screen flex items-center py-16 shadow-2xl shadow-(color:--color-primary-600)',
    ]"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <!-- 텍스트 -->
        <div :class="['space-y-6', reversed ? 'order-1 lg:order-2' : 'order-1 lg:order-1']">
          <h2 class="text-4xl md:text-5xl font-bold text-primary-900 leading-tight">
            {{ title }}<br />
            <template v-if="highlightText">
              <span :class="currentColorScheme.titleHighlight">{{ highlightText }}</span>
            </template>
          </h2>
          <p class="text-xl text-secondary-700 leading-relaxed" v-html="description"></p>
        </div>

        <!-- 이미지 슬롯 -->
        <div
          :class="[
            'flex',
            reversed
              ? 'justify-center lg:justify-start order-2 lg:order-1'
              : 'justify-center lg:justify-end order-2 lg:order-2',
          ]"
        >
          <div
            ref="imageRef"
            :class="[
              'transition-all duration-700 ease-out',
              imageVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
            ]"
          >
            <slot name="image" :visible="imageVisible" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
