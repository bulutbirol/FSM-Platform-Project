export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Manrope', 'sans-serif'],
        body: ['DM Sans', 'sans-serif']
      },
      colors: {
        ink: '#0b172a',
        mineral: '#2463eb',
        paper: '#f5f3ee',
        saffron: '#e9a23b'
      },
      boxShadow: {
        panel: '0 18px 50px -28px rgba(15, 35, 65, 0.35)'
      }
    }
  },
  plugins: []
}

