import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import PrimeVue from 'primevue/config'
import Tooltip from 'primevue/tooltip'
import TrabuddyPreset from './theme/trabuddy-preset'

import App from './App.vue'
import router from './router'

const app = createApp(App)

// Setup FontAwesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { fas } from '@fortawesome/free-solid-svg-icons'
library.add(fas)

// Firebase
import './firebase'

async function prepareApp() {
  if (import.meta.env.DEV && import.meta.env.VITE_MOCK_API) {
    const { worker } = await import('./mocks/browser')
    await worker.start({
      onUnhandledRequest: 'bypass',
    })
  }

  const pinia = createPinia()
  pinia.use(piniaPluginPersistedstate)

  app.use(pinia)
  app.use(router)

  app.use(PrimeVue, {
    theme: {
      preset: TrabuddyPreset,
    },
  })

  app.directive('tooltip', Tooltip)
  app.component('font-awesome-icon', FontAwesomeIcon)

  app.mount('#app')
}

prepareApp()
