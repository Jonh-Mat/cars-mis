import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class", // Enable dark mode with class strategy
  theme: {
    extend: {
      colors: {
        // Your existing colors
        background: "var(--background)",
        foreground: "var(--foreground)",

        // Add blue gradient palette
        blue: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A",
        },

        // Add navy palette for dark theme
        navy: {
          50: "#E7E9EF",
          100: "#C2C9D6",
          200: "#A3ADC2",
          300: "#7D8BA6",
          400: "#5C6B87",
          500: "#465468",
          600: "#3D475A",
          700: "#2D364A",
          800: "#1E263B",
          900: "#0F172A",
        },

        // Add accent colors
        accent: {
          primary: "var(--accent-primary)",
          secondary: "var(--accent-secondary)",
        },
      },

      // Add gradient backgrounds
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-primary":
          "linear-gradient(to right, var(--gradient-primary-start), var(--gradient-primary-end))",
      },

      // Add animations
      animation: {
        gradient: "gradient 8s linear infinite",
        "slide-up": "slideUp 0.5s ease-out",
        "fade-in": "fadeIn 0.5s ease-out",
        "bounce-soft": "bounceSoft 1s infinite",
      },

      // Define keyframes for animations
      keyframes: {
        gradient: {
          "0%, 100%": {
            "background-size": "200% 200%",
            "background-position": "left center",
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "right center",
          },
        },
        slideUp: {
          "0%": {
            transform: "translateY(20px)",
            opacity: "0",
          },
          "100%": {
            transform: "translateY(0)",
            opacity: "1",
          },
        },
        fadeIn: {
          "0%": {
            opacity: "0",
          },
          "100%": {
            opacity: "1",
          },
        },
        bounceSoft: {
          "0%, 100%": {
            transform: "translateY(-2%)",
            "animation-timing-function": "cubic-bezier(0.8, 0, 1, 1)",
          },
          "50%": {
            transform: "translateY(0)",
            "animation-timing-function": "cubic-bezier(0, 0, 0.2, 1)",
          },
        },
      },

      // Add box shadows
      boxShadow: {
        smooth:
          "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        hover:
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        card: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      },

      // Add transitions
      transitionProperty: {
        height: "height",
        spacing: "margin, padding",
      },
    },
  },
  plugins: [],
} satisfies Config;
