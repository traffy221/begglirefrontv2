/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#76BD47',
          dark: '#5a9c35',
          light: '#83c259',
          soft: '#d5eac7',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#83C259',
          foreground: '#181818',
        },
        accent: {
          gold: '#E5B23E',
        },
        ivory: '#fbfbf9',
        charcoal: '#181818',
        gray: '#666666',
        border: '#D8D8D9',
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#FFFFFF',
        },
        background: '#fbfbf9',
        foreground: '#181818',
      },
      fontFamily: {
        serif: ['Lora', 'Georgia', 'ui-serif', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      screens: {
        'xs': '375px',
        'sm': '576px',
        'md': '768px',
        'lg': '992px',
        'xl': '1200px',
        '2xl': '1400px',
      },
    },
  },
  plugins: [],
}
