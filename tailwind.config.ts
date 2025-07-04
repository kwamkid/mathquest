import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        adventure: {
          red: '#DC2626',
          orange: '#F97316',
          gold: '#FCD34D',
        }
      },
    },
  },
  plugins: [],
};

export default config;
