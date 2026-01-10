import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				kokoro: ["Kokoro", "Arial", "sans-serif"],
				arial: ["Arial", "sans-serif"],
			},
			colors: {
				// Retro Cards specific colors
				retro: {
					black: "#000000",
					'card-bg': "#161616",
					white: "#FFFFFF",
					'post-it': "#F4E5A3",
				},
				// Keep existing colors for compatibility
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
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
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
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
				},
				'bubble-pop': {
					'0%': {
						opacity: '0',
						transform: 'translateX(-50%) translateY(8px) scale(0.6) rotate(0deg)'
					},
					'40%': {
						opacity: '1',
						transform: 'translateX(-50%) translateY(-6px) scale(1.15) rotate(8deg)'
					},
					'70%': {
						transform: 'translateX(-50%) translateY(2px) scale(0.95) rotate(4deg)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateX(-50%) translateY(0) scale(1) rotate(6deg)'
					}
				},
				'dog-wiggle': {
					'0%': {
						transform: 'rotate(0deg) scale(1)'
					},
					'20%': {
						transform: 'rotate(-4deg) scale(1.02)'
					},
					'40%': {
						transform: 'rotate(4deg) scale(1.04)'
					},
					'60%': {
						transform: 'rotate(-3deg) scale(1.02)'
					},
					'80%': {
						transform: 'rotate(2deg) scale(1.01)'
					},
					'100%': {
						transform: 'rotate(0deg) scale(1)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'bubble-pop': 'bubble-pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
				'dog-wiggle': 'dog-wiggle 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
