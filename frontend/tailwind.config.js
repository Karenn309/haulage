/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"DM Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        'dash': {
          'bg': '#f0f4ff',
          'surface': '#ffffff',
          'line': '#e1e8f5',
          'accent': '#2563eb',
          'text-primary': '#0d1f3c',
          'text-secondary': '#64748b',
        }
      },
      boxShadow: {
        'blue-sm': '0 1px 3px 0 rgb(37 99 235 / 0.1)',
        'blue-md': '0 4px 6px -1px rgb(37 99 235 / 0.15)',
        'blue-lg': '0 10px 15px -3px rgb(37 99 235 / 0.2)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
