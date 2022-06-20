module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        "slide-down": "slide-down 0.5s linear",
        "fade-in": "fade-in 0.5s ease-in",
      },
      fontFamily: {
        gothamBlack: ["gothamBlack"],
        gotham: ["gotham"],
        gothamMedium: ["gothamMedium"],
        gothamThin: ["gothamThin"],
        gothamLight: ["gothamLight"],
        gothamBold: ["gothamBold"],
        gothamBoldItalic: ["gothamBoldItalic"],
        gothamItalic: ["gothamItalic"],
        gothamMediumItalic: ["gothamMediumItalic"],
      },
      colors: {
        graybg: "#f0f2f5",
        primary: "#1f1f1f",
        secondary: "#cbfd00",
      },
    },
  },
  plugins: [],
};
