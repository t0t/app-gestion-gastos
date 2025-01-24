/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./app.js",
    "./src/**/*.{html,js}",
    "./netlify/functions/**/*.js"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'dark-gray': '#2D3748',
        'orange': '#ED8936',
        'white': '#FFFFFF',
        'light-gray': '#EDF2F7',
        'black': '#1A202C',
      },
      fontFamily: {
        'sans': ['Inter', 'sans-serif'],
        'display': ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
}