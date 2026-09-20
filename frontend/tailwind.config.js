/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#0B0F14",
          card: "#121824",
          elevated: "#1A2230",
        },
        brand: {
          teal: "#2DD4AA",
          purple: "#7C6CF7",
          debt: "#E5484D",
          gold: "#E5B93E",
        },
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
