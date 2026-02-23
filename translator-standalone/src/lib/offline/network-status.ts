// Network status detection with heartbeat
// Distinguishes between online, degraded (slow/unreliable), and offline

export type NetworkMode = 'online' | 'degraded' | 'offline'

type Listener = (mode: NetworkMode) => void

const HEARTBEAT_INTERVAL = 15_000 // 15 seconds
const HEARTBEAT_TIMEOUT = 5_000   // 5 seconds

class NetworkStatusManager {
  private mode: NetworkMode = navigator.onLine ? 'online' : 'offline'
  private listeners = new Set<Listener>()
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null
  private consecutiveFailures = 0

  constructor() {
    window.addEventListener('online', () => this.handleBrowserEvent(true))
    window.addEventListener('offline', () => this.handleBrowserEvent(false))

    // Start heartbeat for more reliable detection
    this.startHeartbeat()
  }

  getMode(): NetworkMode {
    return this.mode
  }

  get isOnline(): boolean {
    return this.mode === 'online'
  }

  get isOffline(): boolean {
    return this.mode === 'offline'
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private setMode(newMode: NetworkMode) {
    if (this.mode === newMode) return
    this.mode = newMode
    console.log(`[Network] Status changed: ${newMode}`)
    this.listeners.forEach(fn => fn(newMode))
  }

  private handleBrowserEvent(isOnline: boolean) {
    if (!isOnline) {
      this.consecutiveFailures = 3 // Skip to offline immediately
      this.setMode('offline')
    } else {
      // Browser says online, but verify with heartbeat
      this.consecutiveFailures = 0
      this.doHeartbeat()
    }
  }

  private startHeartbeat() {
    if (this.heartbeatTimer) return
    this.heartbeatTimer = setInterval(() => this.doHeartbeat(), HEARTBEAT_INTERVAL)
    // Initial check
    this.doHeartbeat()
  }

  private async doHeartbeat() {
    if (!navigator.onLine) {
      this.consecutiveFailures = 3
      this.setMode('offline')
      return
    }

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), HEARTBEAT_TIMEOUT)

      // Lightweight request — just check if we can reach the network
      // Using a common, reliable endpoint
      const start = Date.now()
      await fetch('https://www.gstatic.com/generate_204', {
        mode: 'no-cors',
        cache: 'no-store',
        signal: controller.signal,
      })
      clearTimeout(timeout)

      const latency = Date.now() - start
      this.consecutiveFailures = 0

      if (latency > 3000) {
        this.setMode('degraded')
      } else {
        this.setMode('online')
      }
    } catch {
      this.consecutiveFailures++
      if (this.consecutiveFailures >= 2) {
        this.setMode('offline')
      } else {
        this.setMode('degraded')
      }
    }
  }

  destroy() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
    this.listeners.clear()
  }
}

// Singleton
let instance: NetworkStatusManager | null = null

export function getNetworkStatus(): NetworkStatusManager {
  if (!instance) {
    instance = new NetworkStatusManager()
  }
  return instance
}
