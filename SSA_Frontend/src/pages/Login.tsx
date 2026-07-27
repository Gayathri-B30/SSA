import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../utils/useAuth'
import { useTheme } from '../utils/theme'
import type { ThemeMode } from '../utils/themeConfig'
import ssaLogo from '../assets/SSA Logo.png'
import buildingImg from '../assets/loginCard.png'

function validateUsername(value: string): string {
  if (!value.trim()) return 'Username is required.'
  if (value.trim().length < 2) return 'Username must be at least 2 characters.'
  if (value.trim().length > 50) return 'Username cannot exceed 50 characters.'
  return ''
}

function validatePassword(value: string): string {
  if (!value) return 'Password is required.'
  return ''
}

export const Login: React.FC = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [usernameError, setUsernameError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [usernameTouched, setUsernameTouched] = useState(false)
  const [passwordTouched, setPasswordTouched] = useState(false)

  const { login, isAuthenticated, error, clearError, isLoading, user } = useAuth()
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as any)?.from?.pathname || '/dashboard'

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'Super Admin') {
        const dest = from.startsWith('/superadmin') ? from : '/superadmin/dashboard'
        navigate(dest, { replace: true })
      } else if (user.role === 'Branch') {
        const dest = from.startsWith('/branch') ? from : '/branch/dashboard'
        navigate(dest, { replace: true })
      } else {
        const dest = from.startsWith('/superadmin') ? '/dashboard' : from
        navigate(dest, { replace: true })
      }
    }
  }, [isAuthenticated, user, navigate, from])

  useEffect(() => {
    clearError()
    return () => clearError()
  }, [])

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setUsername(val)
    if (usernameTouched) setUsernameError(validateUsername(val))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setPassword(val)
    setPasswordTouched(true)
    setPasswordError(validatePassword(val))
  }

  const handleUsernameBlur = () => {
    setUsernameTouched(true)
    setUsernameError(validateUsername(username))
  }

  const handlePasswordBlur = () => {
    setPasswordTouched(true)
    setPasswordError(validatePassword(password))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUsernameTouched(true)
    setPasswordTouched(true)
    const uErr = validateUsername(username)
    const pErr = validatePassword(password)
    setUsernameError(uErr)
    setPasswordError(pErr)
    if (uErr || pErr) return
    const success = await login(username.trim(), password)
    if (success) navigate(from, { replace: true })
  }



  return (
    <div className="h-screen w-screen bg-bg-base text-text-base font-sans flex flex-col md:flex-row relative overflow-hidden">

      {/* ── LEFT PANE: image as absolute bg, text floats above ── */}
      <div className="hidden md:flex md:w-[58%] bg-bg-base relative shrink-0 flex-col h-full">

        {/* Building image — absolute background, behind everything */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <img
            src={buildingImg}
            alt=""
            className="w-full h-full object-contain"
            style={{ objectPosition: 'right center', transform: 'translateX(12%)' }}
          />
        </div>

        {/* Text content — floats above the image */}
        <div className="relative z-10 flex flex-col justify-start h-full py-12 px-12 space-y-8">

          {/* Top: Brand + headline */}
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center overflow-hidden bg-white dark:bg-[#242424] rounded-lg border border-border-base">
                <img src={ssaLogo} alt="SSA Logo" className="w-full h-full object-contain p-1" />
              </div>
              <div className="leading-none text-left">
                <div className="font-bold text-lg text-text-base tracking-widest uppercase">SSA ERP</div>
                <div className="text-[9px] font-semibold text-text-muted tracking-[0.2em] uppercase mt-0.5">PLAN. DESIGN. DELIVER.</div>
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl xl:text-5xl font-extrabold text-text-base leading-tight tracking-tight">
                Plan. Design. Deliver.<br />
                <span className="text-brand-primary">Seamlessly.</span>
              </h1>
              <p className="text-base text-text-muted leading-relaxed max-w-sm">
                Manage projects, track progress, and deliver excellence with complete control.
              </p>
            </div>

            <div className="h-[3px] w-16 bg-brand-primary" />
          </div>

        </div>
      </div>

      {/* ── RIGHT PANE: LOGIN CARD ── */}
      <div className="w-full md:w-[42%] h-screen flex flex-col justify-center items-center bg-bg-base px-6 py-8 relative z-10">

        {/* Top-Right Theme Toggle */}
        <div className="absolute top-6 right-6 flex items-center gap-1 bg-gray-100 dark:bg-[#242424] border border-gray-200 dark:border-slate-700 p-1 rounded-xl z-30">
          {[
            { mode: 'light', icon: '☀️', title: 'Light' },
            { mode: 'dark', icon: '🌙', title: 'Dark' },
            { mode: 'system', icon: '🖥️', title: 'System' },
          ].map(({ mode, icon, title }) => {
            const isActive = theme === mode
            return (
              <button
                key={mode}
                type="button"
                onClick={() => setTheme(mode as ThemeMode)}
                title={title}
                className={`w-7 h-7 rounded-lg text-xs flex items-center justify-center transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-[#181818] text-brand-primary shadow-sm border border-gray-200 dark:border-slate-600 font-bold'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {icon}
              </button>
            )
          })}
        </div>

        {/* Form Card */}
        <div className="w-full max-w-lg bg-bg-panel rounded-2xl border border-brand-primary/50 dark:border-slate-700/80 shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] p-10">

          {/* Brand header inside card */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 flex items-center justify-center overflow-hidden bg-white dark:bg-[#242424] rounded-lg border border-border-base">
              <img src={ssaLogo} alt="SSA Logo" className="w-full h-full object-contain p-1" />
            </div>
            <div className="leading-none text-left">
              <div className="font-bold text-lg text-text-base tracking-widest uppercase">SSA ERP</div>
              <div className="text-[9px] font-semibold text-text-muted tracking-[0.2em] uppercase mt-0.5">PLAN. DESIGN. DELIVER.</div>
            </div>
          </div>

          {/* Title */}
          <div className="mb-6 text-left">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Sign in to your account</h2>
            <p className="text-sm text-gray-500 mt-1">Enter your username and password to access your portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Username field */}
            <div className="space-y-1.5 text-left">
              <label htmlFor="username" className="text-xs font-bold text-gray-700">Username</label>
              <div className="relative flex items-center">
                <span className={`absolute left-3 transition-colors duration-200 ${usernameError && usernameTouched ? 'text-red-500' : 'text-gray-400'}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={handleUsernameChange}
                  onBlur={handleUsernameBlur}
                  placeholder="Enter your username"
                  maxLength={50}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 transition-all duration-200 ${usernameError && usernameTouched
                    ? 'border-red-500 focus:ring-red-500/25 focus:border-red-500'
                    : 'border-gray-200 focus:ring-brand-primary/25 focus:border-brand-primary'
                    }`}
                />
              </div>
              {usernameError && usernameTouched && (
                <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 mt-0.5">
                  <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {usernameError}
                </p>
              )}
            </div>

            {/* Password field */}
            <div className="space-y-1.5 text-left">
              <label htmlFor="password" className="text-xs font-bold text-gray-700">Password</label>
              <div className="relative flex items-center">
                <span className={`absolute left-3 transition-colors duration-200 ${passwordError && passwordTouched ? 'text-red-500' : 'text-gray-400'}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={handlePasswordChange}
                  onBlur={handlePasswordBlur}
                  placeholder="••••••••••••"
                  maxLength={20}
                  className={`w-full pl-10 pr-10 py-2.5 rounded-lg border text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 transition-all duration-200 ${passwordError && passwordTouched
                    ? 'border-red-500 focus:ring-red-500/25 focus:border-red-500'
                    : 'border-gray-200 focus:ring-brand-primary/25 focus:border-brand-primary'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-gray-400 hover:text-gray-600 cursor-pointer focus:outline-none"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>

              {passwordTouched && password.length === 0 && (
                <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 mt-0.5">
                  <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Password is required.
                </p>
              )}

              {/* Forgot Password Link */}
              <div className="flex justify-end pt-1">
                <Link to="/forgot-password" className="text-xs font-bold text-brand-primary hover:underline transition-colors duration-200">
                  Forgot Password?
                </Link>
              </div>
            </div>

            {/* Server-side auth error */}
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/25 text-red-600 text-xs font-semibold flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Sign In button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-lg bg-brand-primary hover:bg-primary-700 text-white text-sm font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin w-4 h-4 rounded-full border-2 border-white border-t-transparent" />
                  Authenticating...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
      </div>

    </div>
  )
}
