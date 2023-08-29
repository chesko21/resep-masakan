module.exports = {
  content: ["./src/**/*.{html,js}"],
  darkMode: "media",
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#F0F4F8",
          100: "#D9E2EC",
          200: "#BCCCDC",
          300: "#9FB3C8",
          400: "#829AB1",
          500: "#627D98",
          600: "#486581",
          700: "#334E68",
          800: "#243B53",
          900: "#102A43",
        },
        secondary: {
          50: "#FDF2E9",
          100: "#FCE8D3",
          200: "#FAD8B0",
          300: "#F6AD55",
          400: "#ED8936",
          500: "#DD6B20",
          600: "#C05621",
          700: "#9C4221",
          800: "#7B341E",
          900: "#652B19",
        },
        accent: {
          50: "#E5F3FF",
          100: "#B8D6FE",
          200: "#8EAAFC",
          300: "#6370F6",
          400: "#4F46E5",
          500: "#4338CA",
          600: "#3730A3",
          700: "#312E81",
          800: "#2A285F",
          900: "#1E1A3A",
        },
        background: "#F4F4F4",
        "wavy-purple": "#9F7AEA",
        dark: {
          background: "#1A202C",
          primary: "#4A90E2",
        },
        backgroundImage: {
          wave: "linear-gradient(to bottom, #4c51bf, #9f7aea, #4c51bf)",
        },
      },

      fontFamily: {
        heading: ["Montserrat", "sans-serif"],
        body: ["Open Sans", "sans-serif"],
        subheading: ["Roboto", "sans-serif"],
        logo: ["Pacifico", "cursive"],
        fair: ["Playfair Display", "serif"],
      },
      fontSize: {
        "2xl": "1.5rem",
        "3xl": "2rem",
        "4xl": "2.5rem",
      },
      boxShadow: {
        "md-dark": "0 4px 6px -1px rgba(0, 0, 0, 0.25)",
        "lg-dark": "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
        "xl-dark": "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
      },
      container: {
        center: true,
        padding: "1rem",
      },
      borderRadius: {
        xl: "1rem",
      },
    },
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
    },
  },
  variants: {},
  plugins: [],
};
