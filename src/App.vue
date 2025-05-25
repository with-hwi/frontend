<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
import CreatePlanModal from './components/plan/CreatePlanModal.vue'
import { ref } from 'vue'
import NavigationBar from '@/components/NavigationBar.vue'

//
// === 플랜 생성 관련 시작 ===
//

// 모달 상태 관리
const isCreatePlanModalVisible = ref(false)

const openCreatePlanModal = () => {
  isCreatePlanModalVisible.value = true
}

const closeCreatePlanModal = () => {
  isCreatePlanModalVisible.value = false
}

//
// === 플랜 생성 관련 끝 ===
//
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 공통 헤더 -->
    <NavigationBar />

    <!-- 메인 컨텐츠 -->
    <main>
      <RouterView />
    </main>

    <!-- 플랜 생성 모달 -->
    <CreatePlanModal :is-visible="isCreatePlanModalVisible" @close="closeCreatePlanModal" />
  </div>
</template>

<style scoped></style>
