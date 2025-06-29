/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        golf: {
          green: '#2d5016',
          fairway: '#7cb342',
          rough: '#8bc34a',
          sand: '#ffd54f',
          water: '#2196f3',
          tee: '#4caf50'
        }
      },
      fontFamily: {
        'golf': ['Georgia', 'serif']
      }
    },
  },
  plugins: [],
} 