import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../context/AuthContext'
import { ShieldCheck, Palette, Building, User } from 'lucide-react'

interface ProfileInputs {
  name: string
  email: string
  notificationsEnabled: boolean
}

interface PasswordInputs {
  currentPass: string
  newPass: string
  confirmPass: string
}

export const SettingsPage: React.FC = () => {
  const { user } = useAuth()
  const [activeSubTab, setActiveSubTab] = useState<'company' | 'profile' | 'theme' | 'security'>('company')
  
  // Theme highlights state
  const [glassOpacity, setGlassOpacity] = useState(45)
  const [accentTone, setAccentTone] = useState('standard')

  // Forms
  const { register: registerProfile, handleSubmit: handleProfileSubmit, setValue: setProfileValue, formState: { errors: profileErrors } } = useForm<ProfileInputs>({
    mode: 'onChange',
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      notificationsEnabled: true
    }
  })

  const { register: registerPassword, handleSubmit: handlePasswordSubmit, reset: resetPassword, formState: { errors: passErrors } } = useForm<PasswordInputs>({ mode: 'onChange' })

  // Form submits
  const onProfileSave = (_data: ProfileInputs) => {
    alert('Profile configurations updated successfully!')
  }

  const onPasswordSave = (data: PasswordInputs) => {
    if (data.newPass !== data.confirmPass) {
      alert('Confirm password does not match new password!')
      return
    }
    alert('Access password updated successfully!')
    resetPassword()
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-brand-charcoal tracking-tight sm:text-3xl font-extrabold">System Configurations</h1>
        <p className="text-sm text-brand-gray mt-1 font-medium font-sans">Tune operational constraints, profile contacts, layout highlighting tones, and login policies.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* 1. Left Sub-Tabs Navigation */}
        <div className="glass-card rounded-2xl border border-slate-200/80 p-3 lg:col-span-1 space-y-1">
          {[
            { id: 'company', label: 'Company Settings', icon: Building },
            { id: 'profile', label: 'User Profile Settings', icon: User },
            { id: 'theme', label: 'Theme Customizer', icon: Palette },
            { id: 'security', label: 'Security & Access Control', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                  activeSubTab === tab.id
                    ? 'text-white bg-brand-primary shadow'
                    : 'text-brand-gray hover:text-brand-charcoal hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4.5 h-4.5" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* 2. Right Form View */}
        <div className="lg:col-span-3 glass-card rounded-2xl border border-slate-200/80 p-6">
          
          {/* A. Company Settings */}
          {activeSubTab === 'company' && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-4">
                <h2 className="text-lg font-extrabold text-brand-charcoal">Company Identity & Branding</h2>
                <p className="text-xs text-brand-gray mt-1">Configure legal details and default values for report generation.</p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-brand-gray uppercase tracking-wider mb-2">Primary Domain</label>
                    <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-brand-charcoal" defaultValue="sundaramarchitects.com" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-brand-gray uppercase tracking-wider mb-2">Default Currency</label>
                    <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-brand-charcoal">
                      <option>INR - Indian Rupee (₹)</option>
                      <option>AED - UAE Dirham</option>
                      <option>USD - US Dollar ($)</option>
                    </select>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                  <h4 className="font-bold text-brand-primary uppercase tracking-wider text-[9px] mb-1">Branding Logos</h4>
                  <p className="text-[10px] text-gray-500 leading-relaxed">System interfaces use default orange gradients. Dark layout remains static for enterprise standard conformity.</p>
                </div>

                <button
                  type="button"
                  onClick={() => alert('Company parameters saved!')}
                  className="px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/95 text-xs font-bold text-white shadow-md shadow-brand-primary/10 cursor-pointer transition-colors"
                >
                  Save Settings
                </button>
              </div>
            </div>
          )}

          {/* B. User Profile */}
          {activeSubTab === 'profile' && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-4">
                <h2 className="text-lg font-extrabold text-brand-charcoal">Edit Profile Details</h2>
                <p className="text-xs text-brand-gray mt-1">Modify your personal contact credentials.</p>
              </div>

              <form onSubmit={handleProfileSubmit(onProfileSave)} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-brand-gray uppercase tracking-wider mb-2">Full Name</label>
                    <input
                      type="text"
                      maxLength={50}
                      {...registerProfile('name', {
                        required: 'Name is required',
                        pattern: {
                          value: /^[a-zA-Z]+[a-zA-Z\s.'-]*$/,
                          message: 'Name must start with a letter and contain only alphabets/spaces/dots'
                        },
                        onChange: (e) => {
                          const val = e.target.value.replace(/[^a-zA-Z\s.'-]/g, '')
                          e.target.value = val
                          setProfileValue('name', val, { shouldValidate: true })
                        }
                      })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-brand-charcoal"
                    />
                    {profileErrors.name && <p className="text-red-500 text-[10px] mt-1">{profileErrors.name.message}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-brand-gray uppercase tracking-wider mb-2">Work Email Address</label>
                    <input
                      type="email"
                      {...registerProfile('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: 'Enter a valid email address'
                        }
                      })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-brand-charcoal"
                    />
                    {profileErrors.email && <p className="text-red-500 text-[10px] mt-1">{profileErrors.email.message}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-3 py-2">
                  <input type="checkbox" {...registerProfile('notificationsEnabled')} id="notif-check" className="w-4 h-4 accent-brand-primary" />
                  <label htmlFor="notif-check" className="text-brand-charcoal font-medium">Subscribe to email transmittal warnings and low stock alerts</label>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/95 text-xs font-bold text-white shadow-md shadow-brand-primary/10 cursor-pointer transition-colors"
                >
                  Save Profile
                </button>
              </form>
            </div>
          )}

          {/* C. Theme Settings */}
          {activeSubTab === 'theme' && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-4">
                <h2 className="text-lg font-extrabold text-brand-charcoal">Visual Customization Panel</h2>
                <p className="text-xs text-brand-gray mt-1">Configure layout glassmorphic styles and custom orange SaaS colors.</p>
              </div>

              <div className="space-y-6 text-xs">
                {/* Accent Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between font-bold">
                    <span className="text-brand-gray uppercase text-[10px]">Glassmorphism Backdrop Opacity</span>
                    <span className="text-brand-primary">{glassOpacity}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    value={glassOpacity}
                    onChange={(e) => setGlassOpacity(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                  />
                </div>

                {/* Theme Highlights selection */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-brand-gray uppercase tracking-wider">Highlight Palette Accent</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'standard', label: 'Vibrant Orange (SaaS)', color: 'bg-brand-primary' },
                      { id: 'amber', label: 'Warm Amber', color: 'bg-amber-500' },
                      { id: 'coral', label: 'Sunset Coral', color: 'bg-rose-500' },
                    ].map((tone) => (
                      <button
                        key={tone.id}
                        onClick={() => {
                          setAccentTone(tone.id)
                          alert(`Swapped UI highlights theme to ${tone.label}! (Simulated)`)
                        }}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          accentTone === tone.id
                            ? 'border-brand-primary bg-brand-primary/10'
                            : 'border-slate-200 bg-slate-50 hover:border-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-3.5 h-3.5 rounded-full ${tone.color}`} />
                          <span className="font-extrabold text-brand-charcoal text-[11px]">{tone.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* D. Security Settings */}
          {activeSubTab === 'security' && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-4">
                <h2 className="text-lg font-extrabold text-brand-charcoal">System Security & Access Controls</h2>
                <p className="text-xs text-brand-gray mt-1">Configure security password constraints and IP lock restrictions.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
                {/* Form pass change */}
                <form onSubmit={handlePasswordSubmit(onPasswordSave)} className="space-y-4">
                  <h3 className="font-extrabold text-brand-charcoal uppercase tracking-wider text-[10px]">Change Password</h3>
                  <div>
                    <label className="block text-[10px] font-bold text-brand-gray uppercase mb-2">Current Password</label>
                    <input
                      type="password"
                      required
                      maxLength={25}
                      {...registerPassword('currentPass')}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-brand-charcoal"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-brand-gray uppercase mb-2">New Password</label>
                    <input
                      type="password"
                      required
                      maxLength={25}
                      {...registerPassword('newPass', {
                        validate: (value) => {
                          if (!value) return 'New password is required'
                          if (value.length < 8) return 'Password must be at least 8 characters'
                          if (value.length > 25) return 'Password cannot exceed 25 characters'
                          if (!/[A-Z]/.test(value)) return 'Must contain at least one uppercase letter'
                          if (!/[a-z]/.test(value)) return 'Must contain at least one lowercase letter'
                          if (!/[0-9]/.test(value)) return 'Must contain at least one number'
                          if (!/[^A-Za-z0-9]/.test(value)) return 'Must contain at least one special character'
                          return true
                        }
                      })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-brand-charcoal"
                    />
                    {passErrors.newPass && <p className="text-red-500 text-[10px] mt-1">{passErrors.newPass.message}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-brand-gray uppercase mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      required
                      maxLength={25}
                      {...registerPassword('confirmPass')}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-brand-charcoal"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/95 text-xs font-bold text-white shadow-md shadow-brand-primary/10 cursor-pointer transition-colors"
                  >
                    Update Password
                  </button>
                </form>

                {/* Additional parameters */}
                <div className="space-y-4">
                  <h3 className="font-extrabold text-brand-charcoal uppercase tracking-wider text-[10px]">Network Policies</h3>
                  <div>
                    <label className="block text-[10px] font-bold text-brand-gray uppercase mb-2">Allowed Office IP Range</label>
                    <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-brand-charcoal" defaultValue="192.168.1.0/24" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-brand-gray uppercase mb-2">Session Expiry Timeout (JWT Expire)</label>
                    <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-brand-charcoal">
                      <option>1 Hour (Recommended)</option>
                      <option>8 Hours</option>
                      <option>24 Hours</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  )
}
