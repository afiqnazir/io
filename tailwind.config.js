/** @type {import('tailwindcss').Config} */
    module.exports = {
      content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
      ],
      theme: {
        extend: {
          colors: {
            'dark-gray': '#1a202c',
            'light-gray': '#4a5568',
            'dark-blue': '#2b6cb0',
            'light-blue': '#63b3ed',
          },
        },
      },
      plugins: [],
    };
