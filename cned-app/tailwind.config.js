/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        accent: "#3730a3",
        cned: { fr: "#3b82f6", ma: "#ec4899", ses: "#10b981", hggsp: "#f59e0b", hg: "#f97316", an: "#6366f1", es: "#ef4444", sc: "#14b8a6", emc: "#a855f7" },
      },
      fontFamily: { serif: ["Georgia", "Times New Roman", "serif"], sans: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"] },
    },
  },
  plugins: [],
};
