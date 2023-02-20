const { fontFamily } = require('tailwindcss/defaultTheme')
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        roboto: ['var(--font-roboto)', ...fontFamily.sans],
        bebas: ['var(--font-bebas)', ...fontFamily.sans],
      },
    },
  },
  daisyui: {
    themes: ["night"],
  },
  plugins: [require('@tailwindcss/typography'), require("daisyui")],
};
