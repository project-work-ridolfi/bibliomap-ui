/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // La palette
        'tea-rose-red': '#fac8cd',
        'thistle': '#d7bcc8',
        'ash-gray': '#98b6b1',
        'zomp': '#629677',
        'paynes-gray': '#495d63',
        
        'primary': {
          50: '#f7fafc',
          100: '#f0f4f7',
          700: '#629677', 
          800: '#495d63', 
          900: '#2c3e50',
        },
        // Accento per link/errori
        'accent': '#fac8cd', 
      },
      fontFamily: {
        display: ['Mochiy Pop P One'],
        body: ['Quicksand', 'sans-serif'],
      }
    },
  },
  plugins: [],
}