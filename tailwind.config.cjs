/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        matcha: {
          50: "#eefbf5",
          100: "#d8f4e8",
          200: "#b4e8d3",
          300: "#82d5b6",
          400: "#4fbd96",
          500: "#2ca57e",
          600: "#1f8567",
          700: "#1c6a55",
          800: "#195546",
          900: "#16463b"
        }
      },
      boxShadow: {
        soft: "0 14px 38px -24px rgba(15, 23, 42, 0.35)"
      }
    }
  },
  plugins: []
};
