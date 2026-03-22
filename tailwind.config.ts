import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#ffffff",
        foreground: "#0f172a",
      },
      boxShadow: {
        card: "0 12px 40px -24px rgba(15, 23, 42, 0.22)",
      },
    },
  },
  plugins: [],
};

export default config;
