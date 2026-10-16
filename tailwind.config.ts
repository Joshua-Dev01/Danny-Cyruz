import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111111",
        paper: "#FFFFFF",
        stone: { 100: "#FFF8DB", 200: "#EADFB0", 400: "#8A8467", 600: "#55513F" },
        // Brand yellow. Use as bg-sun, text-sun, bg-sun-deep, bg-sun-pale
        sun: { DEFAULT: "#FFC800", deep: "#E6B400", pale: "#FFF8DB" },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      keyframes: {
        rise: { from: { opacity: "0", transform: "translateY(14px)" }, to: { opacity: "1", transform: "none" } },
      },
      animation: { rise: "rise .9s cubic-bezier(.2,.7,.2,1) both" },
    },
  },
  plugins: [],
};
export default config;