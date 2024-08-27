/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    fontFamily: {
      'rome': ['Times New Roman', 'ui-sans-serif', 'system-ui'],
      'comf': ['Comfortaa', 'ui-sans-serif', 'system-ui'],
      'popp': ['Poppins', 'ui-sans-serif', 'system-ui']
    },
    animation: {
      'spin-slow': 'spin 3s linear infinite',
    },
    keyframes:{
      sizeUp: {
        '0%': {transform: 'scale(0)', zIndex: '100'},
        '100%': {transform: 'scale(1)', zIndex: '100'},
      },
      lowPetR: {
        '100%': {transform: 'translateX(-10%) translateY(-17%) rotate(90deg)'}
      },
      lowPetL: {
        '100%': {transform: 'translateX(10%) translateY(-17%) rotate(-90deg)'}
      },
      midPetR: {
        '100%': {transform: 'translateX(-3.75%) translateY(-6.5%) rotate(45deg)'}
      },
      midPetL: {
        '100%': {transform: 'translateX(3.75%) translateY(-6.5%) rotate(-45deg)'}
      },
      twirl: {
        'from': {transform: 'rotate(0deg)'},
        'to': {transform: 'rotate(180deg)'}
      }
    },
    extend: {},
  },
  plugins: [],
}

