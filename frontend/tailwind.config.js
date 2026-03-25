/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cream: '#fcfbf9',
        primary: '#8B6F47',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Oxygen',
          'Ubuntu',
          'Cantarell',
          'Fira Sans',
          'Droid Sans',
          'Helvetica Neue',
          'sans-serif',
        ],
      },
      fontSize: {
        'h1': '2.8em',
        'h2': '1.8em',
        'h3': '1.3em',
      },
      lineHeight: {
        'relaxed': '1.6',
      },
      letterSpacing: {
        'tightest': '-1px',
        'tighter': '-0.5px',
      },
    },
  },
  plugins: [],
}