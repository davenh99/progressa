module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          light: "#edede9",
          dark: "#0f0306",
        },
        background: {
          light: "#ffffff",
          dark: "#0a0a0a",
        },
        surface: {
          light: "#f8f9fa",
          dark: "#1a1a1a",
        },
        text: {
          primary: {
            light: "#212529",
            dark: "#f8f9fa",
          },
          secondary: {
            light: "#495057",
            dark: "#e9ecef",
          },
        },
        error: {
          light: "#dc3545",
          dark: "#ff6b6b",
        },
        success: {
          light: "#28a745",
          dark: "#51cf66",
        },
        warning: {
          light: "#ffc107",
          dark: "#ffd43b",
        },
      },
      spacing: {
        section: "3rem",
      },
    },
  },
  plugins: [],
};
