import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0B3D91",
        "primary-dark": "#092e6e",
        secondary: "#2E86DE",
        accent: "#D64545",
        "accent-dark": "#B23333",
        ink: "#1A1A2E",
        muted: "#555555",
        faint: "#888888",
        body: "#333333",
        surface: "#F7F9FC",
        success: "#1E8E5A",
        warning: "#C9862A",
      },
      keyframes: {
        "fill-progress": {
          "0%": { width: "0%" },
          "100%": { width: "100%" },
        },
      },
      animation: {
        "fill-progress": "fill-progress 900ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
    },
  },
  plugins: [],
};

export default config;
