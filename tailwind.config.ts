import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#faf5ff",
          100: "#f3e8ff",
          200: "#e9d5ff",
          300: "#d8b4fe",
          400: "#c084fc",
          500: "#a855f7",
          600: "#9333ea",
          700: "#7e22ce",
          800: "#6b21a8",
          900: "#581c87",
          950: "#3b0764",
          dark: "#1e0533",
        },
        accent: {
          pink: "#ec4899",
          magenta: "#d946ef",
          rose: "#f43f5e",
          gold: "#f59e0b",
          coral: "#fb7185",
        },
        surface: {
          DEFAULT: "#0d0a1a",
          raised: "#150f2b",
          overlay: "#1e1640",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
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
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        sans: ["var(--font-be-vietnam)", "Be Vietnam Pro", "sans-serif"],
        display: ["var(--font-be-vietnam)", "Be Vietnam Pro", "sans-serif"],
      },
      backgroundImage: {
        "brand-gradient":
          "linear-gradient(135deg, #7e22ce 0%, #d946ef 50%, #ec4899 100%)",
        "gold-gradient": "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
        "dark-gradient": "linear-gradient(180deg, #0d0a1a 0%, #1e1640 100%)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        "pulse-glow": "pulse-glow 2.5s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        "slide-up": "slide-up 0.5s ease-out",
        "fade-in": "fade-in 0.6s ease-out",
        shake: "shake 0.8s ease-in-out infinite",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px 4px rgba(217,70,239,0.4)" },
          "50%": { boxShadow: "0 0 40px 10px rgba(217,70,239,0.7)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        shake: {
          "0%, 100%": { transform: "rotate(0deg)" },
          "20%": { transform: "rotate(-10deg)" },
          "40%": { transform: "rotate(10deg)" },
          "60%": { transform: "rotate(-6deg)" },
          "80%": { transform: "rotate(6deg)" },
        },
      },
      boxShadow: {
        "glow-purple": "0 0 30px rgba(147,51,234,0.4)",
        "glow-magenta": "0 0 30px rgba(217,70,239,0.4)",
        "glow-gold": "0 0 20px rgba(245,158,11,0.5)",
        "card-dark": "0 8px 32px rgba(0,0,0,0.4)",
        "card-hover": "0 20px 60px rgba(0,0,0,0.5)",
      },
    },
  },
  plugins: [],
};

export default config;
