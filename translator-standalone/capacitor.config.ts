import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.fintutto.translator',
  appName: 'Fintutto Translator',
  webDir: 'dist',
  server: {
    // In production, load from bundled files
    // In development, uncomment the url line for live reload:
    // url: 'http://192.168.1.x:5180',
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 2000,
      backgroundColor: '#0369a1',
      showSpinner: false,
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#0369a1',
    },
  },
  // iOS-specific settings
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    scheme: 'Fintutto Translator',
  },
  // Android-specific settings
  android: {
    backgroundColor: '#ffffff',
    allowMixedContent: false,
    captureInput: true,
  },
}

export default config
