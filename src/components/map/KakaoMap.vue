<template>
  <div>
    <div id="map" ref="map"></div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'

const map = ref(null)

const loadScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.async = true
    script.defer = true
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_MAP_API_KEY}&autoload=false`
    script.onload = () => {
      window.kakao.maps.load(() => {
        resolve()
      })
    }
    document.head.appendChild(script)
  })
}

const loadMap = () => {
  const options = {
    // 지도를 생성할 때 필요한 기본 옵션
    center: new window.kakao.maps.LatLng(33.450701, 126.570667), // 지도의 중심좌표.
    level: 3, // 지도의 레벨(확대, 축소 정도)
  }

  const kMap = new window.kakao.maps.Map(map.value, options) // 지도 생성 및 객체 리턴
}

onMounted(async () => {
  if (!window.kakao || !window.kakao.maps) {
    await loadScript()
    loadMap()
  } else {
    loadMap()
  }
})
</script>

<style scoped></style>
