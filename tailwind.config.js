/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        // New color palette with better contrast
        primary: {
          DEFAULT: '#3b82f6', // Blue
          foreground: '#ffffff', // White text on blue
        },
        secondary: {
          DEFAULT: '#1e293b', // Dark blue-gray
          foreground: '#ffffff', // White text on dark blue-gray
        },
        accent: {
          DEFAULT: '#8b5cf6', // Purple
          foreground: '#ffffff', // White text on purple
        },
        background: '#0f172a', // Dark blue background
        foreground: '#f8fafc', // Light text
        card: {
          DEFAULT: '#1e293b', // Dark blue-gray
          foreground: '#f8fafc', // Light text
        },
        muted: {
          DEFAULT: '#334155', // Muted blue-gray
          foreground: '#94a3b8', // Muted text
        },
        destructive: {
          DEFAULT: '#ef4444', // Red
          foreground: '#ffffff', // White text on red
        },
        border: '#334155', // Border color
      },
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}

