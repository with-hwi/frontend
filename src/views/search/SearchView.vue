<template>
  <div id="container">
    <KakaoMap id="map" />
  </div>
</template>

<script setup lang="ts">
import KakaoMap from '@/components/map/KakaoMap.vue'
import TourSearch from '@/components/TourSearch.vue'
import { onMounted, ref } from 'vue'
</script>

<style>
#container {
  width: 100vw;
  height: 100vh;
  position: relative;
  display: flex;
}

#map {
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  position: absolute;
}
</style>
