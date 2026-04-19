import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0f7ff",
          100: "#e0efff",
          200: "#b8dbff",
          300: "#7ac0ff",
          400: "#3aa3ff",
          500: "#0d87f2",
          600: "#006ad0",
          700: "#0054a8",
          800: "#00478a",
          900: "#063c72",
        },
        accent: {
          50: "#fff7ed",
          100: "#ffeed5",
          200: "#ffd9a8",
          300: "#ffbd70",
          400: "#ff9636",
          500: "#ff7a0f",
          600: "#f05e06",
          700: "#c74507",
          800: "#9e370e",
          900: "#7f300f",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
