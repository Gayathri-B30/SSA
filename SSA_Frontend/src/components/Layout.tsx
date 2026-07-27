import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../utils/theme'
import { ACCENT_COLORS } from '../utils/themeConfig'
import type { AccentColor, ThemeMode } from '../utils/themeConfig'
import { useNavigation } from '../utils/navigation'
import { useAuth } from '../utils/useAuth'
import ssaLogo from '../assets/SSA Logo.png'

interface LayoutProps {
  children: React.ReactNode
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation()
  const { theme, accentColor, setTheme, setAccentColor } = useTheme()
  const { navItems, isMobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useNavigation()
  const { isAuthenticated, user, logout } = useAuth()

  if (location.pathname === '/login') {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-bg-base text-text-base flex flex-col font-sans selection:bg-primary selection:text-white transition-colors duration-300">
      {/* Decorative background gradients styled using dynamic accent colors */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] pointer-events-none transition-all duration-300" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] pointer-events-none transition-all duration-300" />

      {/* Premium Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-bg-panel/80 border-b border-border-base transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Dynamic Logo Design */}
            <div className="w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden relative">
              <img src={ssaLogo} alt="SSA Logo" className="w-full h-full object-contain p-1" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-text-base via-text-base/80 to-text-muted transition-all duration-300">
              SSA Portal
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={closeMobileMenu}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 border ${
                    isActive
                      ? 'bg-primary-light text-primary border-primary/25 shadow-sm'
                      : 'text-text-muted hover:text-text-base hover:bg-bg-panel border-transparent'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Settings: Theme, Accent Color, and Action Controls */}
          <div className="hidden lg:flex items-center gap-6 border-l border-border-base pl-6">
            {/* Accent Color Selection dots */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-muted font-medium mr-1">Accent:</span>
              {(Object.keys(ACCENT_COLORS) as AccentColor[]).map((color) => {
                const config = ACCENT_COLORS[color]
                const isActive = accentColor === color
                return (
                  <button
                    key={color}
                    onClick={() => setAccentColor(color)}
                    style={{ backgroundColor: config.accent }}
                    title={color.charAt(0).toUpperCase() + color.slice(1)}
                    className={`w-5 h-5 rounded-full transition-all duration-200 cursor-pointer ${
                      isActive 
                        ? 'ring-2 ring-offset-2 ring-primary scale-110' 
                        : 'hover:scale-110 opacity-70 hover:opacity-100'
                    }`}
                  />
                )
              })}
            </div>

            {/* Theme Toggle Button Group */}
            <div className="flex items-center gap-1 bg-bg-base p-1 rounded-lg border border-border-base">
              {[
                { mode: 'light', icon: '☀️', title: 'Light Mode' },
                { mode: 'dark', icon: '🌙', title: 'Dark Mode' },
                { mode: 'system', icon: '🖥️', title: 'System Mode' },
              ].map(({ mode, icon, title }) => {
                const isActive = theme === mode
                return (
                  <button
                    key={mode}
                    onClick={() => setTheme(mode as ThemeMode)}
                    title={title}
                    className={`w-7 h-7 rounded-md text-sm flex items-center justify-center transition-all cursor-pointer ${
                      isActive
                        ? 'bg-bg-panel text-primary shadow-sm border border-border-base/50'
                        : 'text-text-muted hover:text-text-base'
                    }`}
                  >
                    {icon}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Action button & Mobile Hamburger Toggle */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 bg-bg-panel/60 border border-border-base py-1 px-3 rounded-full text-xs font-medium text-text-base transition-colors duration-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-semibold text-text-base">{user?.name}</span>
                </div>
                <button
                  onClick={logout}
                  className="px-4 py-2 rounded-xl border border-border-base hover:bg-bg-panel text-sm font-semibold text-text-base hover:text-rose-400 hover:border-rose-500/20 transition-all duration-200 cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="relative group overflow-hidden px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                Sign In
              </Link>
            )}

            {/* Mobile/Tablet Controls & Menu Toggle */}
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-xl border border-border-base hover:bg-bg-panel text-text-base md:hidden transition-all duration-200 cursor-pointer"
              aria-label="Toggle Menu"
            >
              <div className="w-5 h-5 flex flex-col justify-center gap-1.5">
                <span className={`h-0.5 w-full bg-current rounded transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                <span className={`h-0.5 bg-current rounded transition-all duration-300 ${isMobileMenuOpen ? 'w-0 opacity-0' : 'w-full'}`} />
                <span className={`h-0.5 w-full bg-current rounded transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown Menu */}
        <div 
          className={`md:hidden overflow-hidden transition-all duration-300 border-t border-border-base bg-bg-panel/95 backdrop-blur-md ${
            isMobileMenuOpen ? 'max-h-screen py-4 border-b' : 'max-h-0 py-0 border-b-transparent'
          }`}
        >
          <div className="px-4 space-y-4">
            <div className="space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={closeMobileMenu}
                    className={`px-4 py-3 rounded-xl text-base font-medium flex items-center gap-3 transition-all duration-200 border ${
                      isActive
                        ? 'bg-primary-light text-primary border-primary/20'
                        : 'text-text-muted hover:text-text-base hover:bg-bg-base border-transparent'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>

            {/* Theme and Accent selectors on Mobile */}
            <div className="pt-4 border-t border-border-base space-y-4">
              <div className="flex flex-col gap-2">
                <span className="text-xs text-text-muted font-semibold uppercase tracking-wider">Accent Theme</span>
                <div className="flex items-center gap-3">
                  {(Object.keys(ACCENT_COLORS) as AccentColor[]).map((color) => {
                    const config = ACCENT_COLORS[color]
                    const isActive = accentColor === color
                    return (
                      <button
                        key={color}
                        onClick={() => setAccentColor(color)}
                        style={{ backgroundColor: config.accent }}
                        className={`w-6 h-6 rounded-full transition-all cursor-pointer ${
                          isActive 
                            ? 'ring-2 ring-offset-2 ring-primary scale-110' 
                            : 'opacity-70 hover:opacity-100'
                        }`}
                      />
                    )
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-xs text-text-muted font-semibold uppercase tracking-wider">Appearance</span>
                <div className="flex items-center gap-2 bg-bg-base p-1.5 rounded-xl border border-border-base max-w-[240px]">
                  {[
                    { mode: 'light', label: 'Light', icon: '☀️' },
                    { mode: 'dark', label: 'Dark', icon: '🌙' },
                    { mode: 'system', label: 'System', icon: '🖥️' },
                  ].map(({ mode, label, icon }) => {
                    const isActive = theme === mode
                    return (
                      <button
                        key={mode}
                        onClick={() => setTheme(mode as ThemeMode)}
                        className={`flex-1 py-1.5 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isActive
                            ? 'bg-bg-panel text-primary shadow-sm border border-border-base/50'
                            : 'text-text-muted hover:text-text-base'
                        }`}
                      >
                        <span>{icon}</span>
                        <span>{label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Mobile Auth Controls */}
            <div className="pt-4 border-t border-border-base">
              {isAuthenticated ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 bg-bg-base p-3 rounded-xl border border-border-base">
                    <div className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center font-bold text-primary">
                      SA
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-text-base">{user?.name}</div>
                      <div className="text-xs text-text-muted">{user?.role}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      logout()
                      closeMobileMenu()
                    }}
                    className="w-full py-3 px-4 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-sm font-semibold text-rose-400 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>🚪</span> Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={closeMobileMenu}
                  className="w-full py-3 px-4 rounded-xl bg-primary text-center text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all cursor-pointer block"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <div className="w-full flex-1 flex flex-col">
          {children}
        </div>
      </main>

      {/* Responsive Footer */}
      <footer className="bg-bg-panel/50 border-t border-border-base py-8 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-text-base">SSA</span>
            <span className="text-text-muted">|</span>
            <span className="text-sm text-text-muted">© {new Date().getFullYear()} All Rights Reserved.</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-text-muted">
            <a href="#" className="hover:text-text-base transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-text-base transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-text-base transition-colors">Documentation</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

