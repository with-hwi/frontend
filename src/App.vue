<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import NavigationBar from '@/components/NavigationBar.vue'
import CreatePlanModal from '@/components/modals/CreatePlanModal.vue'
import LoginModal from '@/components/modals/LoginModal.vue'
import InviteModal from '@/components/modals/InviteModal.vue'
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
    <CreatePlanModal />

    <!-- 로그인 모달 -->
    <LoginModal />

    <!-- 초대 모달 -->
    <InviteModal />
  </div>
</template>

<style scoped></style>
