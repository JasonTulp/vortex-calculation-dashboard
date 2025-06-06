import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#006FBE",
        "primary-light": "#a6edfd",
        "border": "#23282d",
        "darker": "#0a0c0d",
        "dark": "#0b0d0f",
        "mid": "#161a1d",
        "mid-light": "#2d3134",
        "light": "#5c5f61",
        "text": "#fff4f0",
        "link": "#009FFD",

        // "gray": "#898989",
        // "gray-mid": "#959595",
        // "gray-light": "#B9B9B9",
        // "gray-dark": "#666666",
      },
      fontFamily: {
        chango: ['var(--font-chango)'],
        gabarito: ['var(--font-gabarito)'],
        modak: ['var(--font-modak)'],
      },
      keyframes: {
        scroll: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'scroll': 'scroll 20s linear infinite',
      },
      // boxShadow: {
      //   "sharp": "4px 4px 0px 0px",
      //   "sharp-2": "2px 2px 0px 0px",
      //   "sharp-6": "6px 6px 0px 0px",
      // },
    },
  },
  plugins: [],
} satisfies Config;