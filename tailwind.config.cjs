/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        roboto: "'Roboto', sans-serif",
        bebas: "'Bebas Neue', sans-serif",
      },
    },
  },
  daisyui: {
    themes: ["night"],
  },
  plugins: [require('@tailwindcss/typography'), require("daisyui")],
};
