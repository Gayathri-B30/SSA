import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../utils/theme'
import type { ThemeMode } from '../utils/themeConfig'
import ssaLogo from '../assets/SSA Logo.png'
import buildingImg from '../assets/loginCard.png'

// ── Kept outside component to avoid oxc regex parse issues ──
const DUMMY_OTP = '111111'

const PW_RULES = [
  { label: 'At least 8 characters', test: (v: string) => v.length >= 8 },
  { label: 'At most 20 characters', test: (v: string) => v.length <= 20 && v.length > 0 },
  { label: 'One uppercase letter (A–Z)', test: (v: string) => /[A-Z]/.test(v) },
  { label: 'One number (0–9)', test: (v: string) => /[0-9]/.test(v) },
  { label: 'One special character (!@#$…)', test: (v: string) => /[^A-Za-z0-9]/.test(v) },
]
const STRENGTH_LABELS = ['', 'Weak', 'Weak', 'Fair', 'Good', 'Strong']
const STRENGTH_COLORS = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a']

function getStrength(v: string) {
  return PW_RULES.filter(r => r.test(v)).length
}
function validateUserId(v: string) {
  if (!v.trim()) return 'User ID is required.'
  if (v.trim().length < 2) return 'User ID must be at least 2 characters.'
  if (v.trim().length > 20) return 'User ID cannot exceed 20 characters.'
  return ''
}
function validateNewPw(v: string) {
  if (!v) return 'Password is required.'
  if (v.length < 8) return 'Password must be at least 8 characters.'
  if (v.length > 20) return 'Password cannot exceed 20 characters.'
  if (!/[A-Z]/.test(v)) return 'Must contain at least one uppercase letter.'
  if (!/[0-9]/.test(v)) return 'Must contain at least one number.'
  if (!/[^A-Za-z0-9]/.test(v)) return 'Must contain at least one special character.'
  return ''
}
function validateConfirm(newPw: string, confirm: string) {
  if (!confirm) return 'Please confirm your password.'
  if (confirm !== newPw) return 'Passwords do not match.'
  return ''
}

// ── Step indicators ──
const STEPS = ['User ID', 'OTP', 'New Password']

export const ForgotPassword: React.FC = () => {
  const { theme, setTheme } = useTheme()
  const [step, setStep] = useState<1 | 2 | 3>(1)

  // Step 1
  const [userId, setUserId] = useState('')
  const [userIdError, setUserIdError] = useState('')
  const [userIdTouched, setUserIdTouched] = useState(false)
  const [step1Loading, setStep1Loading] = useState(false)

  // Step 2
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [otpError, setOtpError] = useState('')
  const [step2Loading, setStep2Loading] = useState(false)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  // Step 3
  const [newPw, setNewPw] = useState('')
  const [confirm, setConfirm] = useState('')
  const [newPwError, setNewPwError] = useState('')
  const [confirmError, setConfirmError] = useState('')
  const [newPwTouched, setNewPwTouched] = useState(false)
  const [confirmTouched, setConfirmTouched] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [step3Loading, setStep3Loading] = useState(false)
  const [done, setDone] = useState(false)

  const strength = getStrength(newPw)
  const showStrength = newPwTouched && newPw.length > 0

  // Focus first OTP box when step 2 appears
  useEffect(() => {
    if (step === 2) {
      setTimeout(() => otpRefs.current[0]?.focus(), 80)
    }
  }, [step])

  // ── Step 1 ──
  const handleUserIdSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUserIdTouched(true)
    const err = validateUserId(userId)
    setUserIdError(err)
    if (err) return
    setStep1Loading(true)
    await new Promise(r => setTimeout(r, 900))
    setStep1Loading(false)
    setStep(2)
  }

  // ── Step 2 — OTP box logic ──
  const handleOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return
    const next = [...otp]
    next[index] = val.slice(-1)
    setOtp(next)
    setOtpError('')
    if (val && index < 5) otpRefs.current[index + 1]?.focus()
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const next = [...otp]
    pasted.split('').forEach((ch, i) => { next[i] = ch })
    setOtp(next)
    const lastFilled = Math.min(pasted.length, 5)
    otpRefs.current[lastFilled]?.focus()
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const entered = otp.join('')
    if (entered.length < 6) { setOtpError('Please enter all 6 digits.'); return }
    setStep2Loading(true)
    await new Promise(r => setTimeout(r, 800))
    setStep2Loading(false)
    if (entered !== DUMMY_OTP) {
      setOtpError('Invalid OTP. Please try again.')
      return
    }
    setStep(3)
  }

  // Resend OTP
  const [resendCooldown, setResendCooldown] = useState(0)
  const handleResend = () => {
    setOtp(['', '', '', '', '', ''])
    setOtpError('')
    setResendCooldown(30)
    otpRefs.current[0]?.focus()
    const interval = setInterval(() => {
      setResendCooldown(c => { if (c <= 1) { clearInterval(interval); return 0 } return c - 1 })
    }, 1000)
  }

  // ── Step 3 ──
  const handleNewPwChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setNewPw(val)
    setNewPwTouched(true)
    setNewPwError(validateNewPw(val))
    if (confirmTouched) setConfirmError(validateConfirm(val, confirm))
  }

  const handleConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setConfirm(val)
    setConfirmTouched(true)
    setConfirmError(validateConfirm(newPw, val))
  }

  const handleStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setNewPwTouched(true)
    setConfirmTouched(true)
    const nErr = validateNewPw(newPw)
    const cErr = validateConfirm(newPw, confirm)
    setNewPwError(nErr)
    setConfirmError(cErr)
    if (nErr || cErr) return
    setStep3Loading(true)
    await new Promise(r => setTimeout(r, 1000))
    setStep3Loading(false)
    setDone(true)
  }

  // ── Shared components ──
  const FieldError = ({ msg }: { msg: string }) => (
    <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 mt-0.5 text-left">
      <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      {msg}
    </p>
  )

  const EyeBtn = ({ show, toggle }: { show: boolean; toggle: () => void }) => (
    <button type="button" onClick={toggle} className="absolute right-3 text-gray-400 hover:text-gray-600 cursor-pointer focus:outline-none">
      {show ? (
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
  )

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

      {/* ── RIGHT PANE: FORM CARD ── */}
      <div className="w-full md:w-[42%] h-screen flex flex-col justify-center items-center bg-bg-base px-6 py-8 relative z-10 overflow-y-auto">

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

        <div className="w-full max-w-lg bg-bg-panel rounded-2xl border border-brand-primary/50 dark:border-slate-700/80 shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] p-10">

          {/* Brand header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 flex items-center justify-center overflow-hidden bg-white dark:bg-[#242424] rounded-lg border border-border-base">
              <img src={ssaLogo} alt="SSA Logo" className="w-full h-full object-contain p-1" />
            </div>
            <div className="leading-none text-left">
              <div className="font-bold text-lg text-text-base tracking-widest uppercase">SSA ERP</div>
              <div className="text-[9px] font-semibold text-text-muted tracking-[0.2em] uppercase mt-0.5">PLAN. DESIGN. DELIVER.</div>
            </div>
          </div>

          {/* Step Progress Line */}
          <div className="space-y-1.5 mb-6">
            <div className="flex justify-between text-[11px] text-gray-500 font-bold">
              <span>Step {done ? 3 : step} of 3</span>
              <span>{done ? '✓ Complete' : STEPS[step - 1]}</span>
            </div>
            <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full bg-brand-primary transition-all duration-500 ease-out rounded-full"
                style={{ width: done ? '100%' : `${((step - 1) / 3) * 100 + 33}%` }}
              />
            </div>
          </div>

          <div>
            {/* ─── STEP 1: User ID ─── */}
            {step === 1 && (
              <div className="space-y-5">
                <div className="space-y-1 text-left">
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Enter User ID</h2>
                  <p className="text-sm text-gray-500">We'll send an OTP to your registered contact.</p>
                </div>
                <form onSubmit={handleUserIdSubmit} className="space-y-4">
                  <div className="space-y-1.5 text-left">
                    <label htmlFor="forgotUserId" className="text-xs font-bold text-gray-700">User ID</label>
                    <div className="relative flex items-center">
                      <span className={`absolute left-3 transition-colors duration-200 ${userIdError && userIdTouched ? 'text-red-500' : 'text-gray-400'}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </span>
                      <input
                        id="forgotUserId"
                        type="text"
                        value={userId}
                        onChange={e => { setUserId(e.target.value); if (userIdTouched) setUserIdError(validateUserId(e.target.value)) }}
                        onBlur={() => { setUserIdTouched(true); setUserIdError(validateUserId(userId)) }}
                        placeholder="Enter your User ID"
                        maxLength={20}
                        className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 transition-all duration-200 ${userIdError && userIdTouched
                          ? 'border-red-500 focus:ring-red-500/25 focus:border-red-500'
                          : 'border-gray-200 focus:ring-brand-primary/25 focus:border-brand-primary'
                          }`}
                      />
                    </div>
                    {userIdError && userIdTouched && <FieldError msg={userIdError} />}
                  </div>
                  <button type="submit" disabled={step1Loading}
                    className="w-full py-2.5 rounded-lg bg-brand-primary hover:bg-primary-700 text-white text-sm font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer">
                    {step1Loading ? (<><span className="animate-spin w-4 h-4 rounded-full border-2 border-white border-t-transparent" />Sending OTP...</>) : 'Send OTP'}
                  </button>
                  <Link to="/login" className="flex items-center justify-center gap-2 text-sm font-bold text-brand-primary hover:underline transition-colors duration-200">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Sign In
                  </Link>
                </form>
              </div>
            )}

            {/* ─── STEP 2: OTP ─── */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="space-y-1 text-left">
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Enter OTP</h2>
                  <p className="text-sm text-gray-500">
                    A 6-digit code was sent for <span className="font-semibold text-gray-900">{userId}</span>.
                  </p>
                </div>


                <form onSubmit={handleOtpSubmit} className="space-y-4">
                  <div className="space-y-3 text-left">
                    <label className="text-xs font-bold text-gray-700">6-Digit OTP</label>
                    <div className="flex gap-2 justify-between" onPaste={handleOtpPaste}>
                      {otp.map((digit, i) => (
                        <input
                          key={i}
                          ref={el => { otpRefs.current[i] = el }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={e => handleOtpChange(i, e.target.value)}
                          onKeyDown={e => handleOtpKeyDown(i, e)}
                          className={`w-11 h-12 text-center text-lg font-bold rounded-lg border bg-white text-gray-900 focus:outline-none transition-all duration-200 ${otpError
                            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                            : digit
                              ? 'border-brand-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20'
                              : 'border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20'
                            }`}
                        />
                      ))}
                    </div>
                    {otpError && <FieldError msg={otpError} />}
                  </div>

                  <button type="submit" disabled={step2Loading}
                    className="w-full py-2.5 rounded-lg bg-brand-primary hover:bg-primary-700 text-white text-sm font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer">
                    {step2Loading ? (<><span className="animate-spin w-4 h-4 rounded-full border-2 border-white border-t-transparent" />Verifying...</>) : 'Verify OTP'}
                  </button>

                  <div className="flex items-center justify-between text-sm">
                    <button type="button" onClick={() => setStep(1)} className="text-gray-500 hover:text-brand-primary font-bold transition-colors duration-200 flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      Change User ID
                    </button>
                    <button type="button" onClick={handleResend} disabled={resendCooldown > 0}
                      className="text-brand-primary hover:underline font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200">
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ─── STEP 3: New Password ─── */}
            {step === 3 && !done && (
              <div className="space-y-5">
                <div className="space-y-1 text-left">
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight">New Password</h2>
                  <p className="text-sm text-gray-500">Choose a strong password to secure your account.</p>
                </div>
                <form onSubmit={handleStep3Submit} className="space-y-4">

                  {/* New Password */}
                  <div className="space-y-1.5 text-left">
                    <label htmlFor="newPwFP" className="text-xs font-bold text-gray-700">New Password</label>
                    <div className="relative flex items-center">
                      <span className={`absolute left-3 transition-colors duration-200 ${newPwError && newPwTouched ? 'text-red-500' : 'text-gray-400'}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </span>
                      <input
                        id="newPwFP"
                        type={showNew ? 'text' : 'password'}
                        value={newPw}
                        onChange={handleNewPwChange}
                        onBlur={() => { setNewPwTouched(true); setNewPwError(validateNewPw(newPw)) }}
                        placeholder="Enter new password"
                        maxLength={20}
                        className={`w-full pl-10 pr-10 py-2.5 rounded-lg border text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 transition-all duration-200 ${newPwTouched && newPwError
                          ? 'border-red-500 focus:ring-red-500/25 focus:border-red-500'
                          : 'border-gray-200 focus:ring-brand-primary/25 focus:border-brand-primary'
                          }`}
                      />
                      <EyeBtn show={showNew} toggle={() => setShowNew(!showNew)} />
                    </div>
                    {newPwTouched && newPw.length === 0 && <FieldError msg="Password is required." />}

                    {showStrength && (
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1 flex-1">
                            {[1, 2, 3, 4, 5].map(i => (
                              <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                                style={{ backgroundColor: i <= strength ? STRENGTH_COLORS[strength] : '#e5e7eb' }} />
                            ))}
                          </div>
                          <span className="text-[10px] font-semibold w-10 text-right" style={{ color: STRENGTH_COLORS[strength] }}>
                            {STRENGTH_LABELS[strength]}
                          </span>
                        </div>
                        <ul className="space-y-0.5 text-left">
                          {PW_RULES.map((rule, i) => {
                            const passed = rule.test(newPw)
                            return (
                              <li key={i} className={`text-[10px] flex items-center gap-1.5 font-medium transition-colors duration-200 ${passed ? 'text-emerald-500' : 'text-red-500'}`}>
                                {passed ? (
                                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                ) : (
                                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                )}
                                {rule.label}
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5 text-left">
                    <label htmlFor="confirmPwFP" className="text-xs font-bold text-gray-700">Confirm Password</label>
                    <div className="relative flex items-center">
                      <span className={`absolute left-3 transition-colors duration-200 ${confirmError && confirmTouched ? 'text-red-500' :
                        confirmTouched && confirm && confirm === newPw ? 'text-emerald-500' :
                          'text-gray-400'
                        }`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </span>
                      <input
                        id="confirmPwFP"
                        type={showConfirm ? 'text' : 'password'}
                        value={confirm}
                        onChange={handleConfirmChange}
                        onBlur={() => { setConfirmTouched(true); setConfirmError(validateConfirm(newPw, confirm)) }}
                        placeholder="Re-enter new password"
                        maxLength={20}
                        className={`w-full pl-10 pr-10 py-2.5 rounded-lg border text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 transition-all duration-200 ${confirmTouched && confirmError
                          ? 'border-red-500 focus:ring-red-500/25 focus:border-red-500'
                          : confirmTouched && confirm && confirm === newPw
                            ? 'border-emerald-400 focus:ring-emerald-400/25 focus:border-emerald-400'
                            : 'border-gray-200 focus:ring-brand-primary/25 focus:border-brand-primary'
                          }`}
                      />
                      <EyeBtn show={showConfirm} toggle={() => setShowConfirm(!showConfirm)} />
                    </div>
                    {confirmTouched && confirmError && <FieldError msg={confirmError} />}
                    {confirmTouched && !confirmError && confirm && (
                      <p className="text-[11px] text-emerald-500 font-medium flex items-center gap-1 mt-0.5">
                        <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Passwords match!
                      </p>
                    )}
                  </div>

                  <button type="submit" disabled={step3Loading}
                    className="w-full py-2.5 rounded-lg bg-brand-primary hover:bg-primary-700 text-white text-sm font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer">
                    {step3Loading ? (<><span className="animate-spin w-4 h-4 rounded-full border-2 border-white border-t-transparent" />Resetting...</>) : 'Reset Password'}
                  </button>
                </form>
              </div>
            )}

            {/* ─── SUCCESS ─── */}
            {done && (
              <div className="space-y-6 text-center">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center">
                    <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-gray-900">Password Reset!</h2>
                  <p className="text-sm text-gray-500">Your password has been reset successfully. Sign in with your new password.</p>
                </div>
                <Link to="/login"
                  className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-brand-primary hover:bg-primary-700 text-white text-sm font-bold transition-all duration-200">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Sign In with New Password
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
