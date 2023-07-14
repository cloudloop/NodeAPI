/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [ './views/*.ejs',                  // Path to index.ejs
            './views/weather.ejs',            // Path to weather.ejs
            './views/weather-index.ejs',
            './views/partials/navbar.ejs'],
  theme: {
    extend: {},
  },
  plugins: [],
}

