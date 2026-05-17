/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      transitionDuration: {
        'fast': '200ms',
        'normal': '300ms',
        'slow': '400ms',
      },
      transitionTimingFunction: {
        'ease-out-fluid': 'cubic-bezier(0.22, 1, 0.36, 1)', // Smooth out
        'ease-in-fluid': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'ease-bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)', // Spring-like
      },
      willChange: {
        'transform-opacity': 'transform, opacity',
      }
    },
  },
  plugins: [],
}
