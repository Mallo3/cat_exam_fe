/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tcsHeader: '#2B3E50',
        tcsBlue: '#337AB7',
        tcsGreen: '#5CB85C',
        tcsRed: '#D9534F',
        tcsPurple: '#8E44AD',
        tcsGrey: '#E5E5E5',
      },
    },
  },
  plugins: [],
}