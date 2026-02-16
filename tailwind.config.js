/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // 航空主题色板 - Claymorphism风格
        aviation: {
          sky: '#87CEEB',      // 天空蓝
          blue: '#4A90D9',     // 航空蓝
          dark: '#2C5282',     // 深蓝
          light: '#4F46E5',    // 主色调靛蓝
          navy: '#1E3A5F',     // 海军蓝
        },
        // 童趣粉彩色板
        playful: {
          pink: '#FFB6C1',     // 粉红
          peach: '#FFCBA4',    // 桃色
          mint: '#98D8C8',     // 薄荷绿
          lavender: '#E6E6FA', // 薰衣草
          lemon: '#FFF9C4',    // 柠檬黄
          coral: '#FF7F7F',    // 珊瑚色
        },
        // 功能色
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
        info: '#3B82F6',
      },
      fontFamily: {
        display: ['Baloo 2', 'cursive'],
        body: ['Comic Neue', 'cursive', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '2.5rem',
      },
      boxShadow: {
        'clay': '4px 4px 0px 0px rgba(0, 0, 0, 0.1)',
        'clay-lg': '6px 6px 0px 0px rgba(0, 0, 0, 0.12)',
        'clay-inner': 'inset 2px 2px 4px rgba(0, 0, 0, 0.05)',
        'soft': '0 4px 14px 0 rgba(0, 0, 0, 0.08)',
        'soft-lg': '0 8px 24px 0 rgba(0, 0, 0, 0.12)',
        'cloud': '0 8px 32px 0 rgba(135, 206, 235, 0.3)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'bounce-soft': 'bounceSoft 2s ease-in-out infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'takeoff': 'takeoff 0.5s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.02)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.8 },
        },
        takeoff: {
          '0%': { transform: 'translateY(20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
      },
      backgroundImage: {
        'sky-gradient': 'linear-gradient(180deg, #87CEEB 0%, #E0F4FF 50%, #FFFFFF 100%)',
        'clouds': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cellipse cx='30' cy='40' rx='20' ry='15' fill='white' opacity='0.8'/%3E%3Cellipse cx='50' cy='35' rx='25' ry='18' fill='white' opacity='0.9'/%3E%3Cellipse cx='70' cy='42' rx='18' ry='13' fill='white' opacity='0.85'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
}
