/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./public/designs/*.html",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#13eca4",
        "background-light": "#f6f8f7",
        "background-dark": "#0a0f0d",
        "slate-card": "#16221e",
      },
      fontFamily: {
        "display": ["Manrope", "Space Grotesk", "sans-serif"],
        "body": ["Manrope", "sans-serif"],
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
    },
  },
  plugins: [],
}
