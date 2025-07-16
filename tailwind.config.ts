import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./client/index.html",
    "./client/src/**/*.{js,ts,jsx,tsx}",
    "./client/src/components/**/*.{js,ts,jsx,tsx}",
    "./client/src/pages/**/*.{js,ts,jsx,tsx}",
    "./client/src/hooks/**/*.{js,ts,jsx,tsx}",
    "./client/src/lib/**/*.{js,ts,jsx,tsx}",
    "./client/src/utils/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        chart: {
          "1": "var(--chart-1)",
          "2": "var(--chart-2)",
          "3": "var(--chart-3)",
          "4": "var(--chart-4)",
          "5": "var(--chart-5)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar-background)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
        // Mexican Brand Colors
        mexican: {
          green: "var(--mexican-green)",
          "green-light": "var(--mexican-green-light)",
          "green-dark": "var(--mexican-green-dark)",
          red: "var(--mexican-red)",
          "red-light": "var(--mexican-red-light)",
          "red-dark": "var(--mexican-red-dark)",
          orange: "var(--warm-orange)",
          "orange-light": "var(--warm-orange-light)",
          "orange-dark": "var(--warm-orange-dark)",
          gold: "var(--golden-yellow)",
          "gold-light": "var(--golden-yellow-light)",
          "gold-dark": "var(--golden-yellow-dark)",
          tierra: "var(--tierra-brown)",
          "tierra-light": "var(--tierra-brown-light)",
          "tierra-dark": "var(--tierra-brown-dark)",
          chili: "var(--chili-red)",
          avocado: "var(--avocado-green)",
          lime: "var(--lime-green)",
          paprika: "var(--paprika-orange)",
        },
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
