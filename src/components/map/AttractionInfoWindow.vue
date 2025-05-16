<template>
  <div class="attraction-info-window">
    <h3>{{ attraction.title }}</h3>
    <div v-if="attraction.firstimage" class="attraction-info-image">
      <img :src="attraction.firstimage" :alt="attraction.title" />
    </div>
    <div class="attraction-info-content">
      <p v-if="attraction.addr1" class="attraction-info-address">
        <span class="attraction-info-label">주소</span>
        {{ attraction.addr1 }} {{ attraction.addr2 || '' }}
      </p>
      <p v-if="attraction.tel" class="attraction-info-tel">
        <span class="attraction-info-label">연락처</span>
        {{ attraction.tel }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AttractionItem } from '@/types/tour'

defineProps<{
  attraction: AttractionItem
}>()
</script>

<style scoped>
.attraction-info-window {
  padding: 0;
  max-width: 300px;
  font-family: 'Noto Sans KR', sans-serif;
}

.attraction-info-window h3 {
  margin: 0 0 10px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  padding-right: 20px;
  line-height: 1.4;
  word-break: keep-all;
}

.attraction-info-content {
  padding: 5px 0;
}

.attraction-info-window p {
  margin: 8px 0;
  font-size: 13px;
  color: #666;
  line-height: 1.4;
  display: flex;
  align-items: flex-start;
}

.attraction-info-label {
  color: #888;
  margin-right: 8px;
  font-size: 12px;
  flex-shrink: 0;
  min-width: 50px;
}

.attraction-info-address,
.attraction-info-tel {
  word-break: keep-all;
}

.attraction-info-image {
  width: 100%;
  height: 160px;
  overflow: hidden;
  margin: 0 0 10px 0;
  border-radius: 6px;
}

.attraction-info-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.attraction-info-image img:hover {
  transform: scale(1.05);
}
</style>
