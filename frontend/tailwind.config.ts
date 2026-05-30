import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      /* ── Modern Literary palette from DESIGN.md ── */
      colors: {
        surface: {
          DEFAULT: "#fbf9f8",
          dim: "#dbd9d9",
          bright: "#fbf9f8",
          container: {
            lowest: "#ffffff",
            low: "#f5f3f3",
            DEFAULT: "#efeded",
            high: "#eae8e7",
            highest: "#e4e2e2",
          },
        },
        ink: {
          DEFAULT: "#00162a",
          container: "#0d2b45",
          light: "#7893b2",
          muted: "#43474d",
        },
        parchment: {
          DEFAULT: "#fbf9f8",
          shadow: "#e4e2e2",
        },
        cinnabar: {
          DEFAULT: "#5b0005",
          bright: "#fb584f",
          container: "#ffdad6",
        },
        jade: {
          DEFAULT: "#605e57",
          container: "#e6e2d8",
        },
        outline: {
          DEFAULT: "#73777e",
          variant: "#c3c6ce",
        },
      },
      fontFamily: {
        serif: ['"Noto Serif"', "Georgia", "serif"],
        sans: ['"Be Vietnam Pro"', "system-ui", "sans-serif"],
      },
      fontSize: {
        "headline-xl": ["40px", { lineHeight: "48px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-lg": ["32px", { lineHeight: "40px", letterSpacing: "-0.01em", fontWeight: "600" }],
        "headline-md": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "body-sm": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "label-md": ["12px", { lineHeight: "16px", letterSpacing: "0.05em", fontWeight: "600" }],
      },
      borderRadius: {
        sm: "0.125rem",
        DEFAULT: "0.25rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
      },
      spacing: {
        unit: "8px",
        gutter: "16px",
        "stack-sm": "12px",
        "stack-md": "24px",
        "stack-lg": "48px",
        "page-margin": "24px",
      },
      boxShadow: {
        literary: "0 2px 8px rgba(45, 31, 21, 0.08), 0 1px 3px rgba(45, 31, 21, 0.05)",
        "literary-lg": "0 8px 24px rgba(45, 31, 21, 0.1), 0 2px 8px rgba(45, 31, 21, 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
