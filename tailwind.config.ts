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
      },
      keyframes: {
        bump: {
          "0%, 100%": { transform: "scale(1)" },
          "30%": { transform: "scale(1.35)" },
          "55%": { transform: "scale(0.9)" },
          "75%": { transform: "scale(1.12)" }
        },
        pop: {
          "0%": { transform: "scale(1)" },
          "40%": { transform: "scale(1.4)" },
          "100%": { transform: "scale(1)" }
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(-8deg)" },
          "75%": { transform: "rotate(8deg)" }
        }
      },
      animation: {
        bump: "bump 0.5s ease-in-out",
        pop: "pop 0.35s ease-in-out",
        wiggle: "wiggle 0.4s ease-in-out"
      }
    }
  },
  plugins: []
};
export default config;
