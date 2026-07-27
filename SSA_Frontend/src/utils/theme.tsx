import React, { createContext, useContext, useEffect, useState } from 'react'
import { ACCENT_COLORS } from './themeConfig'
import type { ThemeMode, AccentColor, ThemeConfig } from './themeConfig'

interface ThemeContextType {
  theme: ThemeMode
  accentColor: AccentColor
  setTheme: (theme: ThemeMode) => void
  setAccentColor: (accent: AccentColor) => void
  currentConfig: ThemeConfig
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('ssa-theme') as ThemeMode
    return (saved === 'light' || saved === 'dark' || saved === 'system') ? saved : 'dark'
  })
  const [accentColor, setAccentColorState] = useState<AccentColor>(() => {
    const saved = localStorage.getItem('ssa-accent') as AccentColor
    return (saved === 'crimson' || saved === 'gold' || saved === 'charcoal') ? saved : 'crimson'
  })

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme)
    localStorage.setItem('ssa-theme', newTheme)
  }

  const setAccentColor = (newAccent: AccentColor) => {
    setAccentColorState(newAccent)
    localStorage.setItem('ssa-accent', newAccent)
  }

  // Update HTML classes & dynamic CSS variables when theme/accent changes
  useEffect(() => {
    const root = window.document.documentElement
    
    // Resolve Light/Dark/System themes
    const applyTheme = (resolvedTheme: 'light' | 'dark') => {
      root.classList.remove('light', 'dark')
      root.classList.add(resolvedTheme)
      root.style.colorScheme = resolvedTheme
    }

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      applyTheme(systemTheme)

      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = (e: MediaQueryListEvent) => {
        applyTheme(e.matches ? 'dark' : 'light')
      }
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    } else {
      applyTheme(theme)
    }
  }, [theme])

  // Update dynamic CSS variables for Accent Colors
  useEffect(() => {
    const root = window.document.documentElement
    const config = ACCENT_COLORS[accentColor]
    
    root.style.setProperty('--color-accent-dynamic', config.accent)
    root.style.setProperty('--color-accent-dark-dynamic', config.darkAccent)
    root.style.setProperty('--color-accent-hover-dynamic', config.hover)
    root.style.setProperty('--color-accent-light-dynamic', config.light)
  }, [accentColor])

  const currentConfig = ACCENT_COLORS[accentColor]

  return (
    <ThemeContext.Provider value={{ theme, accentColor, setTheme, setAccentColor, currentConfig }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
