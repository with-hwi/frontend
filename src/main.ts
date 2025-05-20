import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

async function prepareApp() {
  app.use(createPinia())
  app.use(router)

  if (import.meta.env.DEV && import.meta.env.VITE_MOCK_API) {
    const { worker } = await import('./mocks/browser')
    await worker.start()
  }

  app.mount('#app')
}

prepareApp()
