import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'permafrost-bg': '#0a0e0f',
        'permafrost-panel': '#111a1c',
        'permafrost-border': '#1a2a2c',
        'permafrost-amber': '#ff8c00',
        'permafrost-green': '#00ff41',
        'permafrost-red': '#ff2020',
        'permafrost-muted': '#4a6a6c',
      },
      fontFamily: {
        'mono': ['IBM Plex Mono', 'JetBrains Mono', 'monospace'],
      },
      animation: {
        'blink': 'blink 1s step-end infinite',
        'scanline': 'scanline 8s linear infinite',
        'glow-amber': 'glow-amber 2s ease-in-out infinite alternate',
        'glow-green': 'glow-green 2s ease-in-out infinite alternate',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'glow-amber': {
          '0%': { textShadow: '0 0 10px rgba(255,140,0,0.3)' },
          '100%': { textShadow: '0 0 20px rgba(255,140,0,0.6)' },
        },
        'glow-green': {
          '0%': { textShadow: '0 0 10px rgba(0,255,65,0.3)' },
          '100%': { textShadow: '0 0 20px rgba(0,255,65,0.6)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
