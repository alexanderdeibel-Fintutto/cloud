/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#10b981', foreground: '#ffffff' },
        secondary: { DEFAULT: '#f0fdf4', foreground: '#166534' },
        destructive: { DEFAULT: '#ef4444', foreground: '#ffffff' },
        success: { DEFAULT: '#22c55e', foreground: '#ffffff' },
        warning: { DEFAULT: '#f59e0b', foreground: '#ffffff' },
        muted: { DEFAULT: '#f1f5f9', foreground: '#64748b' },
        accent: { DEFAULT: '#ecfdf5', foreground: '#065f46' },
        border: '#e2e8f0',
        input: '#e2e8f0',
        ring: '#10b981',
        background: '#ffffff',
        foreground: '#0f172a',
        card: { DEFAULT: '#ffffff', foreground: '#0f172a' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
    container: {
      center: true,
      padding: '1rem',
      screens: { '2xl': '1280px' },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
