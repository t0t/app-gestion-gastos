module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
    './app.js'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#1E293B',
        secondary: '#3B82F6',
        accent: '#10B981',
        background: '#F8FAFC'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        alt: ['Poppins', 'sans-serif']
      }
    }
  },
  plugins: []
}