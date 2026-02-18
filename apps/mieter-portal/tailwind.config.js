const preset = require('@fintutto/ui/tailwind-preset')

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [preset],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    // Shared UI-Komponenten aus Packages einbeziehen
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
    '../../packages/core/src/**/*.{js,ts,jsx,tsx}',
    '../../packages/pwa/src/**/*.{js,ts,jsx,tsx}',
  ],
}
