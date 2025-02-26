import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'work-sans': ['var(--font-work-sans)', 'sans-serif'],
      },
      boxShadow: {
        custom: '0px 1.63px 3.26px 0px #0000001A',
      },
      colors: {
        'custom-gray': '#737373',
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "var(--main-color)",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      // borderRadius: {
      //   lg: "var(--radius)",
      //   md: "calc(var(--radius) - 2px)",
      //   sm: "calc(var(--radius) - 4px)",
      // },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      screens: {
        xs: {
          raw: "screen and (min-width: 400px)",
        },
        mw900: {
          raw: "screen and (min-width: 850px)",
        },
        mq768: {
          raw: "screen and (max-width: 768px)",
        },
        mw1600: {
          raw: "screen and (min-width: 1600px)",
        },
        mw1950: {
          raw: "screen and (min-width: 1950px)",
        },
        mw1400: {
          raw: "screen and (min-width: 1400px)",
        },
        mw1300: {
          raw: "screen and (min-width: 1300px)",
        }

      }
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
