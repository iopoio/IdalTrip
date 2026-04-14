/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Brand Primary (Idal Orange)
        primary: "#ab3500",
        "primary-container": "#ff6b35",
        "on-primary": "#ffffff",
        "on-primary-container": "#5f1900",
        
        // Brand Secondary (Trip Blue)
        secondary: "#225ea9",
        "secondary-container": "#7cafff",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#004180",

        // Surface / Foundation
        surface: "#f9f9f9",
        "on-surface": "#1a1c1c",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f3f3f3",
        "surface-container": "#eeeeee",
        "surface-container-high": "#e8e8e8",
        "surface-container-highest": "#e2e2e2",
        "surface-variant": "#e2e2e2",
        "on-surface-variant": "#594139",

        // Accent / Status
        error: "#ba1a1a",
        "error-container": "#ffdad6",
        "on-error": "#ffffff",
        "on-error-container": "#93000a",
        outline: "#8d7168",
        "outline-variant": "#e1bfb5",
      },
      fontFamily: {
        headline: ["Plus Jakarta Sans", "Pretendard", "sans-serif"],
        body: ["Pretendard", "sans-serif"],
        brand: ["Diphylleia", "serif"],
      },
      borderRadius: {
        "xl": "1.5rem",
        "2xl": "2.5rem",
      },
      boxShadow: {
        "soft": "0 20px 40px -10px rgba(0, 0, 0, 0.05)",
        "vibrant": "0 20px 40px -10px rgba(255, 107, 53, 0.15)",
      }
    },
  },
  plugins: [],
}
