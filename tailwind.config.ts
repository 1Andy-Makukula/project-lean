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
        "brand-orange": "#f97316",
        kithly: {
          orange: "#f97316",
        },
      },
      boxShadow: {
        card: "0 12px 40px -24px rgba(15, 23, 42, 0.22)",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #f97316 0%, #fb923c 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
