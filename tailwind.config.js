/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--color-bg)",
        surface: "var(--color-surface)",
        primary: "var(--color-primary)",
        accent: "var(--color-accent)",
        muted: "var(--color-muted)",
        text: "var(--color-text)",
        subtle: "var(--color-subtle)",
        danger: "var(--color-danger)"
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem'
      }
    },
  },
  plugins: [],
}
