import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#172033",
        cloud: "#f5f7fb",
        line: "#d9e1ee",
        brand: {
          50: "#eef8ff",
          100: "#d9efff",
          500: "#2577d8",
          600: "#1d62b6",
          700: "#194f90"
        },
        mint: {
          100: "#dff8ec",
          600: "#16865d"
        },
        amber: {
          100: "#fff0c8",
          700: "#985b00"
        },
        rose: {
          100: "#ffe2e6",
          700: "#a33445"
        }
      },
      boxShadow: {
        panel: "0 16px 40px rgba(23, 32, 51, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
