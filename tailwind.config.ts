import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Triptych palette (locked to brand book values)
        "tri-blue": "#2C3BD3",
        "tri-blue-dim": "#1E2A9E",
        "tri-paper": "#F5F3EE",
        "tri-surface": "#EEEDF5",
        "tri-surface-pure": "#FFFFFF",
        "tri-ink": "#0A0A2E",
        "tri-ink-muted": "#64647A",
        "tri-border": "rgba(10, 10, 46, 0.13)",
        "tri-border-soft": "rgba(10, 10, 46, 0.07)",
        "tri-success": "#1E8C4E",
        "tri-warning": "#A87308",
        "tri-error": "#C94040",
      },
      fontFamily: {
        display: ["var(--font-bebas)", "Bebas Neue", "sans-serif"],
        serif: ["var(--font-instrument)", "Instrument Serif", "Georgia", "serif"],
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
