/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  safelist: [
    'dark',
  ],
  theme: {
    extend: {
      colors: {
        // Custom eco-friendly colors
        'eco-green': {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        'eco-sage': {
          50: '#f6f5f0',
          100: '#ede8e0',
          200: '#dad5c9',
          300: '#c7bbb0',
          400: '#a8998b',
          500: '#9d8d80',
          600: '#8b7a6f',
          700: '#706258',
          800: '#524d44',
          900: '#3d3b36',
        },
        // Premium professional palette extension
        'forest': {
          DEFAULT: '#1b4332',
          50: '#e8f5e9',
          100: '#c8e6c9',
          200: '#a5d6a7',
          300: '#81c784',
          400: '#66bb6a',
          500: '#4caf50',
          600: '#43a047',
          700: '#2d6a4f',
          800: '#1b4332',
          900: '#081c15',
        },
        'sage': {
          DEFAULT: '#74c69d',
          50: '#d8f3dc',
          100: '#b7e4c7',
          200: '#95d5b2',
          300: '#74c69d',
          400: '#52b788',
          500: '#40916c',
          600: '#2d6a4f',
          700: '#1b4332',
          800: '#081c15',
          900: '#000000',
        },
        'brown': {
          DEFAULT: '#6c584c',
          50: '#f5ebe0',
          100: '#e3d5ca',
          200: '#d5bdaf',
          300: '#a98467',
          400: '#8a5a44',
          500: '#6c584c',
          600: '#5c4d44',
          700: '#4c3f35',
          800: '#3c322a',
          900: '#2c251f',
        },
        'cream': {
          DEFAULT: '#fcfaf6',
          50: '#fdfcf7',
          100: '#fbf8ef',
          200: '#faf5e7',
          300: '#f6ecce',
          400: '#eedda0',
          500: '#e4ca70',
          600: '#d6b344',
          700: '#ba9429',
          800: '#95741f',
          900: '#5e4811',
        }
      },
      fontFamily: {
        'eco': ['"Segoe UI"', 'Trebuchet MS', 'sans-serif'],
        'sans': ['"Inter"', 'system-ui', 'sans-serif'],
        'poppins': ['"Poppins"', 'sans-serif'],
        'inter': ['"Inter"', 'sans-serif']
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
    },
  },
    plugins: []
    
};