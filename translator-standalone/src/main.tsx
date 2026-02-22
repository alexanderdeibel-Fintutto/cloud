import React from 'react'
import ReactDOM from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import './index.css'

// Register service worker for PWA support
registerSW({
  onNeedRefresh() {
    // New content available — auto-update
  },
  onOfflineReady() {
    console.log('[PWA] App is ready to work offline')
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
