import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        plum: {
          DEFAULT: "#2B1B33",
          light: "#3D2846"
        },
        amber: {
          DEFAULT: "#F0B84C",
          dark: "#B5651D"
        },
        berry: {
          DEFAULT: "#D65E8C",
          dark: "#A34068",
          text: "#4B1528"
        },
        cream: {
          DEFAULT: "#FAF6EF",
          soft: "#F0E9DC"
        },
        ink: {
          DEFAULT: "#2B1B33",
          muted: "#7A6C7F"
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"]
      },
      borderRadius: {
        xl2: "20px"
      }
    }
  },
  plugins: []
};
export default config;
