import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        pretendard: ["var(--font-pretendard)", "sans-serif"],
        sans: ["var(--font-pretendard)", "sans-serif"],
      },
      colors: {
        ewha: {
          50: "#f0f9f4",
          100: "#dcf0e5",
          200: "#bbe1ce",
          300: "#8acaad",
          400: "#56ad88",
          500: "#33916c",
          600: "#237358",
          700: "#1b5e3b",
          800: "#184f32",
          900: "#164129",
          950: "#0b2418",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
