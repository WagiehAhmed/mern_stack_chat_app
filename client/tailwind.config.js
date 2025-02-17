/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "text-primary": "rgba(var(--text-primary),1)",
        "text-secondary": "rgba(var(--text-secondary),1)",
        background: "rgba(var(--background),1)",
        border: "rgba(var(--borders),1)",
        accent: "rgba(var(--accent),1)",
        error: "rgba(var(--error),1)",
      },
      screens: {
        xs: "575px",
        sm: "576px",
        md: "768px",
        lg: "992px",
        xl: "1200px",
      },
    },
  },
  plugins: [],
};
