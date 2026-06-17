import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0a1628",
          50: "#f0f4fa",
          900: "#0a1628",
          800: "#0f1e36",
          700: "#142844",
        },
        brand: {
          blue: "#1a4fa0",
          sky: "#2a7de1",
          amber: "#e8a020",
        },
      },
      fontFamily: {
        heading: ["var(--font-roboto)", "Roboto", "system-ui", "sans-serif"],
        body: ["var(--font-roboto)", "Roboto", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(10,22,40,0.08), 0 4px 16px rgba(10,22,40,0.06)",
        "card-hover": "0 4px 12px rgba(10,22,40,0.12), 0 12px 32px rgba(10,22,40,0.10)",
      },
      backgroundImage: {
        "hero-grad": "linear-gradient(135deg, #0a1628 0%, #142844 45%, #1a4fa0 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
