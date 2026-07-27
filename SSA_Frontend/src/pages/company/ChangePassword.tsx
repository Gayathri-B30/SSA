import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../utils/useAuth'
import ssaLogo from '../../assets/SSA Logo.png'
import logoBg from '../../assets/login.card.png'

// Password rules — same as login
const PW_RULES = [
  { label: 'At least 8 characters', test: (v: string) => v.length >= 8 },
  { label: 'At most 25 characters', test: (v: string) => v.length <= 25 && v.length > 0 },
  { label: 'One uppercase letter (A–Z)', test: (v: string) => /[A-Z]/.test(v) },
  { label: 'One lowercase letter (a–z)', test: (v: string) => /[a-z]/.test(v) },
  { label: 'One number (0–9)', test: (v: string) => /[0-9]/.test(v) },
  { label: 'One special character (!@#$…)', test: (v: string) => /[^A-Za-z0-9]/.test(v) },
]
const STRENGTH_LABELS = ['', 'Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Strong']
const STRENGTH_COLORS = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a', '#16a34a']

function getStrength(v: string): number {
  return PW_RULES.filter(r => r.test(v)).length
}

function validateNewPassword(value: string): string {
  if (!value) return 'New password is required.'
  if (value.length < 8) return 'Password must be at least 8 characters.'
  if (value.length > 25) return 'Password cannot exceed 25 characters.'
  if (!/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter.'
  if (!/[a-z]/.test(value)) return 'Password must contain at least one lowercase letter.'
  if (!/[0-9]/.test(value)) return 'Password must contain at least one number.'
  if (!/[^A-Za-z0-9]/.test(value)) return 'Password must contain at least one special character.'
  return ''
}

function validateConfirm(newPw: string, confirm: string): string {
  if (!confirm) return 'Please confirm your new password.'
  if (confirm !== newPw) return 'Passwords do not match.'
  return ''
}

function validateCurrent(value: string): string {
  if (!value) return 'Current password is required.'
  return ''
}

export const ChangePassword: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [current, setCurrent] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirm, setConfirm] = useState('')

  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [currentError, setCurrentError] = useState('')
  const [newPwError, setNewPwError] = useState('')
  const [confirmError, setConfirmError] = useState('')

  const [currentTouched, setCurrentTouched] = useState(false)
  const [newPwTouched, setNewPwTouched] = useState(false)
  const [confirmTouched, setConfirmTouched] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [serverError, setServerError] = useState('')

  const strength = getStrength(newPw)
  const showStrength = newPwTouched && newPw.length > 0

  const handleCurrentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setCurrent(val)
    if (currentTouched) setCurrentError(validateCurrent(val))
  }

  const handleNewPwChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setNewPw(val)
    setNewPwTouched(true)
    setNewPwError(validateNewPassword(val))
    if (confirmTouched) setConfirmError(validateConfirm(val, confirm))
  }

  const handleConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setConfirm(val)
    setConfirmTouched(true)
    setConfirmError(validateConfirm(newPw, val))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError('')
    setCurrentTouched(true)
    setNewPwTouched(true)
    setConfirmTouched(true)

    const cErr = validateCurrent(current)
    const nErr = validateNewPassword(newPw)
    const cfErr = validateConfirm(newPw, confirm)

    setCurrentError(cErr)
    setNewPwError(nErr)
    setConfirmError(cfErr)

    if (cErr || nErr || cfErr) return

    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Simulate wrong current password
    if (current !== 'Admin@123') {
      setServerError('Current password is incorrect.')
      setIsLoading(false)
      return
    }

    setIsLoading(false)
    setSuccess(true)
  }

  const EyeIcon = ({ show }: { show: boolean }) =>
    show ? (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
      </svg>
    ) : (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    )

  const FieldError = ({ msg }: { msg: string }) => (
    <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 mt-0.5 text-left">
      <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      {msg}
    </p>
  )

  return (
    <div className="min-h-screen md:h-screen w-screen bg-brand-bg font-sans overflow-y-auto md:overflow-hidden flex flex-col md:flex-row relative">

      {/* ── LEFT PANE: ARCHITECT DRAFTING CANVAS ── */}
      <div className="hidden md:flex md:w-[42%] bg-brand-primary text-white p-8 md:p-12 flex-col justify-between relative overflow-hidden shrink-0">

        {/* Blueprint Wireframe Graphic Overlay */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 flex items-end justify-center">
          <img
            src={logoBg}
            alt="Login Card Background"
            className="w-[105%] h-[105%] object-contain object-bottom opacity-90 brightness-[6] contrast-[0.25] saturate-0 sepia"
          />
        </div>

        {/* Logo + text grouped at top */}
        <div className="relative z-10 space-y-6">
          <div className="w-14 h-14 border border-white/30 flex items-center justify-center overflow-hidden">
            <img src={ssaLogo} alt="SSA Logo" className="w-full h-full object-contain p-1 brightness-0 invert" />
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-sans font-bold tracking-tight text-white leading-tight">
              Change your Password
            </h1>
            <p className="text-white/85 text-xs md:text-sm font-light leading-relaxed max-w-[360px] tracking-wide">
              Establish custom credential configuration parameters to preserve design environment security.
            </p>
            <div className="h-[1.5px] w-10 bg-red-500 mt-4" />
            {/* Active User Clearance Badge */}
            {user && (
              <div className="mt-2 flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg p-3 max-w-xs font-sans text-xs">
                <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center font-bold text-white">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <div className="text-[9.5px] font-bold text-white/50 tracking-wider uppercase">Active User:</div>
                  <div className="text-white font-bold text-sm">{user.name}</div>
                  <div className="text-[10px] text-white/40">{user.role}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1 pointer-events-none" />

      </div>

      {/* ── RIGHT PANE: CONTROL MODULE / FORM CARD ── */}
      <div className="w-full md:w-[58%] min-h-screen md:min-h-0 md:h-full flex flex-col justify-center items-center bg-brand-bg p-4 sm:p-6 md:p-12 overflow-y-auto z-10 relative">

        {/* Form panel */}
        <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-11 max-w-lg w-full transition-all duration-300">

          {/* Header Brand */}
          <div className="flex items-center gap-3 pb-6">
            <div className="w-11 h-11 bg-brand-primary rounded flex items-center justify-center overflow-hidden">
              <img src={ssaLogo} alt="SSA Logo" className="w-full h-full object-contain p-1 brightness-0 invert" />
            </div>
            <div className="leading-none text-left">
              <div className="font-bold text-xl text-gray-900 tracking-wide uppercase">SSA ERP</div>
              <div className="text-[10px] font-semibold text-gray-400 tracking-[0.15em] uppercase mt-0.5">PLAN. DESIGN. DELIVER.</div>
            </div>
          </div>

          <div className="pt-4">
            {!success ? (
              <div className="space-y-6">
                <div className="space-y-1.5 text-left">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Change Password</h2>
                  <p className="text-sm text-gray-500">Update your account password below.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">

                  {/* Current Password */}
                  <div className="space-y-1.5 text-left">
                    <label htmlFor="currentPw" className="text-xs font-bold text-gray-700">Current Password</label>
                    <div className="relative flex items-center">
                      <span className={`absolute left-3.5 text-sm transition-colors duration-200 ${currentError && currentTouched ? 'text-red-500' : 'text-gray-400'}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </span>
                      <input
                        id="currentPw"
                        type={showCurrent ? 'text' : 'password'}
                        value={current}
                        onChange={handleCurrentChange}
                        onBlur={() => { setCurrentTouched(true); setCurrentError(validateCurrent(current)) }}
                        placeholder="Enter current password"
                        maxLength={25}
                        className={`w-full pl-11 pr-10 py-3 rounded-lg border text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 transition-all duration-200 ${currentError && currentTouched
                            ? 'border-red-500 focus:ring-red-500/25 focus:border-red-500'
                            : 'border-gray-200 focus:ring-brand-primary/25 focus:border-brand-primary'
                          }`}
                      />
                      <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3.5 text-gray-400 hover:text-gray-600 cursor-pointer focus:outline-none">
                        <EyeIcon show={showCurrent} />
                      </button>
                    </div>
                    {currentTouched && currentError && <FieldError msg={currentError} />}
                  </div>

                  {/* New Password */}
                  <div className="space-y-1.5 text-left">
                    <label htmlFor="newPw" className="text-xs font-bold text-gray-700">New Password</label>
                    <div className="relative flex items-center">
                      <span className={`absolute left-3.5 text-sm transition-colors duration-200 ${newPwError && newPwTouched ? 'text-red-500' : 'text-gray-400'}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                      </span>
                      <input
                        id="newPw"
                        type={showNew ? 'text' : 'password'}
                        value={newPw}
                        onChange={handleNewPwChange}
                        onBlur={() => { setNewPwTouched(true); setNewPwError(validateNewPassword(newPw)) }}
                        placeholder="Enter new password"
                        maxLength={25}
                        className={`w-full pl-11 pr-10 py-3 rounded-lg border text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 transition-all duration-200 ${newPwError && newPwTouched && newPw.length > 0
                            ? 'border-red-500 focus:ring-red-500/25 focus:border-red-500'
                            : 'border-gray-200 focus:ring-brand-primary/25 focus:border-brand-primary'
                          }`}
                      />
                      <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3.5 text-gray-400 hover:text-gray-600 cursor-pointer focus:outline-none">
                        <EyeIcon show={showNew} />
                      </button>
                    </div>

                    {newPwTouched && newPw.length === 0 && <FieldError msg="New password is required." />}

                    {/* Strength meter */}
                    {showStrength && (
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1 flex-1">
                            {[1, 2, 3, 4, 5].map(i => (
                              <div
                                key={i}
                                className="h-1 flex-1 rounded-full transition-all duration-300"
                                style={{ backgroundColor: i <= strength ? STRENGTH_COLORS[strength] : '#e5e7eb' }}
                              />
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
                                  <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                ) : (
                                  <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
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
                    <label htmlFor="confirmPw" className="text-xs font-bold text-gray-700">Confirm New Password</label>
                    <div className="relative flex items-center">
                      <span className={`absolute left-3.5 text-sm transition-colors duration-200 ${confirmError && confirmTouched ? 'text-red-500' : confirmTouched && confirm && confirm === newPw ? 'text-emerald-500' : 'text-gray-400'}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </span>
                      <input
                        id="confirmPw"
                        type={showConfirm ? 'text' : 'password'}
                        value={confirm}
                        onChange={handleConfirmChange}
                        onBlur={() => { setConfirmTouched(true); setConfirmError(validateConfirm(newPw, confirm)) }}
                        placeholder="Re-enter new password"
                        maxLength={25}
                        className={`w-full pl-11 pr-10 py-3 rounded-lg border text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 transition-all duration-200 ${confirmTouched && confirmError
                            ? 'border-red-500 focus:ring-red-500/25 focus:border-red-500'
                            : confirmTouched && confirm && confirm === newPw
                              ? 'border-emerald-400 focus:ring-emerald-425/25 focus:border-emerald-400'
                              : 'border-gray-200 focus:ring-brand-primary/25 focus:border-brand-primary'
                          }`}
                      />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 text-gray-400 hover:text-gray-600 cursor-pointer focus:outline-none">
                        <EyeIcon show={showConfirm} />
                      </button>
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

                  {/* Server error */}
                  {serverError && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/25 text-red-600 text-xs font-semibold flex items-center gap-2">
                      <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {serverError}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-1 text-sm font-semibold">
                    <button
                      type="button"
                      onClick={() => navigate('/dashboard')}
                      className="flex-1 py-3 px-4 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 hover:text-gray-900 transition-all duration-200 cursor-pointer text-center"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 py-3 px-4 rounded-lg bg-brand-primary hover:bg-primary-700 text-white tracking-wider uppercase shadow-lg shadow-red-800/10 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <span className="animate-spin w-4 h-4 rounded-full border-2 border-white border-t-transparent" />
                          Updating...
                        </>
                      ) : (
                        'Update Password'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* Success */
              <div className="space-y-6 text-center pt-2">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center">
                    <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-gray-900">Password Updated!</h2>
                  <p className="text-sm text-gray-500">Your password has been changed successfully. Use your new password next time you sign in.</p>
                </div>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full py-3 rounded-lg bg-brand-primary hover:bg-primary-700 text-white text-sm font-bold shadow-lg shadow-red-800/10 transition-all duration-200 hover:scale-[1.01]"
                >
                  Back to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
