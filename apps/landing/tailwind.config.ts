import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        cloudCTAPulse: {
          '0%, 100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(99,102,241,0.4)' },
          '50%': { transform: 'scale(1.04)', boxShadow: '0 0 0 8px rgba(99,102,241,0)' },
        },
      },
      animation: {
        cloudCTAPulse: 'cloudCTAPulse 0.8s ease-in-out 3',
      },
    },
  },
  plugins: [],
} satisfies Config
