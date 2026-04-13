/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                sepia: {
                    50: '#f4ecd8',
                    100: '#eadeb8',
                    200: '#dec79b',
                    300: '#cca976',
                    400: '#bb8e57',
                    500: '#ad7641',
                    600: '#9d6238',
                    700: '#834e31',
                    800: '#6d422c',
                    900: '#583626',
                }
            },
            fontFamily: {
                serif: ['Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
                sans: ['"Inter"', '"San Francisco"', '"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
