import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}', // include this if you're using the app directory
  ],
  theme: {
    extend: {
      animation: {
        spinSlow: 'spin 3s linear infinite',
      },
    },
  },
  plugins: [],
}
export default config
