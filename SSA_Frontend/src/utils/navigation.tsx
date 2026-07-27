import React, { createContext, useContext, useState } from 'react'

export interface NavItem {
  label: string
  path: string
  icon: string
}

interface NavigationContextType {
  navItems: NavItem[]
  isMobileMenuOpen: boolean
  setMobileMenuOpen: (isOpen: boolean) => void
  toggleMobileMenu: () => void
  closeMobileMenu: () => void
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems: NavItem[] = [
    { label: 'Dashboard', path: '/dashboard', icon: '📊' },
  ]

  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev)
  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <NavigationContext.Provider
      value={{
        navItems,
        isMobileMenuOpen,
        setMobileMenuOpen,
        toggleMobileMenu,
        closeMobileMenu,
      }}
    >
      {children}
    </NavigationContext.Provider>
  )
}

export const useNavigation = () => {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider')
  }
  return context
}
