import type { Config } from "tailwindcss";

function withOpacity(variableName: string) {
  return ({ opacityValue }: { opacityValue?: string }): string => {
    if (opacityValue !== undefined) {
      return `rgb(var(${variableName}) / ${opacityValue})`;
    }
    return `rgb(var(${variableName}))`;
  };
}

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        plum: {
          DEFAULT: withOpacity("--color-plum"),
          light: withOpacity("--color-plum-light")
        },
        amber: {
          DEFAULT: withOpacity("--color-amber"),
          dark: withOpacity("--color-amber-dark")
        },
        berry: {
          DEFAULT: withOpacity("--color-berry"),
          dark: withOpacity("--color-berry-dark"),
          text: withOpacity("--color-berry-text")
        },
        cream: {
          DEFAULT: "#FAF6EF",
          soft: "#F0E9DC"
        },
        ink: {
          DEFAULT: withOpacity("--color-plum"),
          muted: "#7A6C7F"
        }
      } as any,
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"]
      },
      borderRadius: {
        xl2: "20px"
      }
    }
  },
  plugins: []
};
export default config;
