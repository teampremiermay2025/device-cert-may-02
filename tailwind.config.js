/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      height: {
        screen: '100vh',
      },
      animation: {
        'float-diagonal-right': 'float-diagonal-right 15s infinite ease-in-out',
        'float-diagonal-left': 'float-diagonal-left 15s infinite ease-in-out',
        'float-diagonal-right-up': 'float-diagonal-right-up 15s infinite ease-in-out',
        'float-diagonal-left-up': 'float-diagonal-left-up 15s infinite ease-in-out',
      },
    },
  },
  plugins: [],
}