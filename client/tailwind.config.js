/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '15px',
        sm: '18px',
        md: '24px',
        lg: '16px',
        xl: '30px'
      },
      screens: {
        DEFAULT: '100%',
        sm: '576px',
        md: '768px',
        lg: '992px',
        xl: '1200px'
      }
    },
    extend: {
      colors: {
        dark: '#030303',
        gray: '#888888',
        gray2: '#E5EBE9',
        primary: '#27B088',
        'primary-h': '#1F9979',
        green: '#1FD9A3',
        lightgreen: '#C9E5DD',
        lightgray: '#CCCCCC',
        lightgray2: '#F5F5F5',
        lightgray3: '#B5B5B5',
        negative: '#DA1D5B',
        lightnegative: '#F1E4E4',
        lightpink: '#E5BCC6',
        active: '#E9F5F1',
        down: '#F7EDF3',
        A: '#21A3D4',
        B: '#F87D50',
        initial: '#E9EFEE',
        initial2: '#EEE9EC',
        initial3: '#DDEEEA',
        warning: '#EDDEBE',
        closed: '#F4AE3A',
        backdrop: 'rgba(3, 3, 3, 0.2)',
      },
      boxShadow: {
        DEFAULT: '0 8px 16px 0 rgba(0, 0, 0, 0.05)',
        selected: '0 0 0 3px #26EEBD,0 8px 16px 0 rgba(0, 0, 0, 0.05)!important'
      },
      dropShadow: {
        DEFAULT: '0 8px 16px rgb(0 0 0/ 0.05)'
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-135': 'linear-gradient(135deg, var(--tw-gradient-stops))',
        'gradient-63': 'linear-gradient(-63deg, var(--tw-gradient-stops))'
      }
    },
  },
  plugins: [],
}
