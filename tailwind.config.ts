import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#09090B", panel: "#18181B", purple: "#8B5CF6", lime: "#B6FF3B",
        deep: "#24113F", lavender: "#C4B5FD", muted: "#A1A1AA"
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        display: ["var(--font-space)", "Space Grotesk", "sans-serif"],
        mono: ["var(--font-mono)", "Space Mono", "monospace"]
      },
      boxShadow: { comic: "5px 5px 0 #09090B", purple: "5px 5px 0 #8B5CF6" },
      keyframes: {
        blink: { "0%,100%": { opacity: "1" }, "50%": { opacity: ".35" } },
        ticker: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } }
      },
      animation: { blink: "blink 1.8s ease-in-out infinite", ticker: "ticker 30s linear infinite" }
    }
  },
  plugins: []
} satisfies Config;
