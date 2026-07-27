export type ThemeMode = 'light' | 'dark' | 'system'
export type AccentColor = 'crimson' | 'gold' | 'charcoal'

export interface ThemeConfig {
  accent: string
  darkAccent: string
  hover: string
  light: string
  gradient: string
}

export const ACCENT_COLORS: Record<AccentColor, ThemeConfig> = {
  crimson: {
    accent: '#33a18a', // Pastel Mint Green
    darkAccent: '#206c5c',
    hover: '#288571',
    light: 'rgba(51, 161, 138, 0.08)',
    gradient: 'from-[#33a18a] via-[#42a5f5] to-[#1f2937]',
  },
  gold: {
    accent: '#42a5f5', // Pastel Sky Blue
    darkAccent: '#1e88e5',
    hover: '#29b6f6',
    light: 'rgba(66, 165, 245, 0.1)',
    gradient: 'from-[#42a5f5] via-[#33a18a] to-[#1f2937]',
  },
  charcoal: {
    accent: '#64748b', // Cool Slate Blue
    darkAccent: '#475569',
    hover: '#334155',
    light: 'rgba(100, 116, 139, 0.08)',
    gradient: 'from-[#64748b] via-[#42a5f5] to-[#33a18a]',
  },
}
