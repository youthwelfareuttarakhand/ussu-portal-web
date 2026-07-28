import type { Config } from "tailwindcss";

// ponytail: mirrors ussu-web/apps/web/tailwind.config.ts (separate git repo,
// no shared workspace — see docs/ or the redesign plan for why). Keep the
// color/font tokens here in lockstep with that file by hand.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0A1E42",
        "primary-dark": "#050F24",
        secondary: "#12315C",
        accent: "#A63A3A",
        "accent-dark": "#7F2929",
        gold: "#B08D57",
        ink: "#1A1A2E",
        muted: "#555555",
        faint: "#888888",
        body: "#333333",
        surface: "#F8F6F1",
        success: "#1E8E5A",
        warning: "#C9862A",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        sans: ["var(--font-body)", "sans-serif"],
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
