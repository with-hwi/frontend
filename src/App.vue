<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
import CreatePlanModal from './components/plan/CreatePlanModal.vue'
import { ref } from 'vue'

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
  <div id="app-container">
    <header>
      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
        <RouterLink to="/search">여행지 검색</RouterLink>
        <RouterLink to="/plan/0">여행 계획</RouterLink>
        <a @click="openCreatePlanModal" class="cursor-pointer">계획 생성</a>
      </nav>
    </header>
    <main>
      <RouterView />
    </main>

    <!-- 플랜 생성 모달 -->
    <CreatePlanModal :is-visible="isCreatePlanModalVisible" @close="closeCreatePlanModal" />
  </div>
</template>

<style scoped>
#app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
header {
  height: 64px;
  background-color: orange;
}
main {
  flex-grow: 1;
}
.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
  background-color: yellow;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}
</style>
