import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			colors: {
				background: 'var(--background)',
				foreground: 'var(--foreground)',
				lamaSky: "#C3EBFA",
				lamaSkyLight: "#EDF9FD",
				lamaPurple: "#CFCEFF",
				lamaPurpleLight: "#F1F0FF",
				lamaYellow: "#FAE27C",
				lamaYellowLight: "#FEFCE8",
			},
			screens: {
				sm: '640px',
				md: '768px',
				lg: '1024px'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
