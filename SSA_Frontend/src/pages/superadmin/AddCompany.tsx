import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { SuperadminSidebar } from '../../components/SuperadminSidebar'
import { useTheme } from '../../utils/theme'
import type { ThemeMode } from '../../utils/themeConfig'
import api from '../../services/api'
import { 
  Menu,
  Bell,
  Users,
  Eye,
  EyeOff
} from 'lucide-react'


function validateRequired(value: string, fieldName: string): string {
  if (!value.trim()) return `${fieldName} is required.`
  return ''
}

function validateCompanyName(value: string): string {
  if (!value.trim()) return 'Company name is required.'
  if (value.trim().length < 3) return 'Company name must be at least 3 characters.'
  if (value.trim().length > 30) return 'Company name cannot exceed 30 characters.'
  return ''
}

function validateContactPerson(value: string): string {
  if (!value.trim()) return 'Contact person name is required.'
  if (value.trim().length < 3) return 'Contact person name must be at least 3 characters.'
  if (value.trim().length > 30) return 'Contact person name cannot exceed 30 characters.'
  return ''
}

function validateEmail(value: string): string {
  if (!value.trim()) return 'Email address is required.'
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(value.trim())) return 'Please enter a valid email address.'
  return ''
}

function validateMobile(value: string): string {
  if (!value.trim()) return 'Mobile number is required.'
  const cleaned = value.replace(/\D/g, '')
  if (cleaned.length !== 10) return 'Mobile number must be exactly 10 digits.'
  return ''
}

function validatePassword(value: string): string {
  if (!value) return 'Password is required.'
  if (value.length < 8) return 'Password must be at least 8 characters long.'
  const hasUpperCase = /[A-Z]/.test(value)
  const hasLowerCase = /[a-z]/.test(value)
  const hasNumber = /[0-9]/.test(value)
  const hasSpecial = /[^A-Za-z0-9]/.test(value)
  if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecial) {
    return 'Password must contain at least one uppercase, lowercase, numeric, and special character.'
  }
  return ''
}

function validateGST(value: string): string {
  if (!value.trim()) return 'GST number is required.'
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
  if (!gstRegex.test(value.trim())) {
    return 'GST number must be in exact format (e.g. 33ABCDE1234F1Z0).'
  }
  return ''
}

function validatePAN(value: string): string {
  if (!value.trim()) return 'PAN number is required.'
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
  if (!panRegex.test(value.trim())) {
    return 'PAN number must be in exact format (e.g. ABCDE1234F).'
  }
  return ''
}

const countryCodes = [
  { code: '+91', name: 'India (IN)' },
  { code: '+1', name: 'USA/Canada (US/CA)' },
  { code: '+44', name: 'United Kingdom (UK)' },
  { code: '+971', name: 'UAE (AE)' },
  { code: '+61', name: 'Australia (AU)' },
  { code: '+65', name: 'Singapore (SG)' },
  { code: '+966', name: 'Saudi Arabia (SA)' },
  { code: '+974', name: 'Qatar (QA)' },
  { code: '+965', name: 'Kuwait (KW)' },
  { code: '+968', name: 'Oman (OM)' },
  { code: '+973', name: 'Bahrain (BH)' },
  { code: '+60', name: 'Malaysia (MY)' },
  { code: '+62', name: 'Indonesia (ID)' },
  { code: '+81', name: 'Japan (JP)' },
  { code: '+82', name: 'South Korea (KR)' },
  { code: '+86', name: 'China (CN)' },
  { code: '+49', name: 'Germany (DE)' },
  { code: '+33', name: 'France (FR)' },
  { code: '+39', name: 'Italy (IT)' },
  { code: '+34', name: 'Spain (ES)' },
  { code: '+7', name: 'Russia (RU)' },
  { code: '+55', name: 'Brazil (BR)' },
  { code: '+27', name: 'South Africa (ZA)' },
  { code: '+20', name: 'Egypt (EG)' },
  { code: '+234', name: 'Nigeria (NG)' },
  { code: '+92', name: 'Pakistan (PK)' },
  { code: '+880', name: 'Bangladesh (BD)' },
  { code: '+94', name: 'Sri Lanka (LK)' },
  { code: '+977', name: 'Nepal (NP)' },
  { code: '+64', name: 'New Zealand (NZ)' },
  { code: '+31', name: 'Netherlands (NL)' },
  { code: '+41', name: 'Switzerland (CH)' },
  { code: '+46', name: 'Sweden (SE)' },
  { code: '+47', name: 'Norway (NO)' },
  { code: '+45', name: 'Denmark (DK)' },
  { code: '+351', name: 'Portugal (PT)' },
  { code: '+353', name: 'Ireland (IE)' },
  { code: '+32', name: 'Belgium (BE)' },
  { code: '+43', name: 'Austria (AT)' },
  { code: '+30', name: 'Greece (GR)' },
  { code: '+90', name: 'Turkey (TR)' },
  { code: '+63', name: 'Philippines (PH)' },
  { code: '+66', name: 'Thailand (TH)' },
  { code: '+84', name: 'Vietnam (VN)' },
  { code: '+852', name: 'Hong Kong (HK)' },
  { code: '+886', name: 'Taiwan (TW)' },
  { code: '+52', name: 'Mexico (MX)' },
  { code: '+54', name: 'Argentina (AR)' },
  { code: '+56', name: 'Chile (CL)' },
  { code: '+57', name: 'Colombia (CO)' },
  { code: '+972', name: 'Israel (IL)' },
  { code: '+962', name: 'Jordan (JO)' },
  { code: '+961', name: 'Lebanon (LB)' },
  { code: '+964', name: 'Iraq (IQ)' },
  { code: '+358', name: 'Finland (FI)' },
  { code: '+48', name: 'Poland (PL)' },
  { code: '+420', name: 'Czech Republic (CZ)' },
  { code: '+36', name: 'Hungary (HU)' },
  { code: '+40', name: 'Romania (RO)' },
  { code: '+380', name: 'Ukraine (UA)' },
  { code: '+963', name: 'Syria (SY)' },
  { code: '+967', name: 'Yemen (YE)' },
  { code: '+212', name: 'Morocco (MA)' },
  { code: '+213', name: 'Algeria (DZ)' },
  { code: '+216', name: 'Tunisia (TN)' },
  { code: '+218', name: 'Libya (LY)' },
  { code: '+249', name: 'Sudan (SD)' },
  { code: '+251', name: 'Ethiopia (ET)' },
  { code: '+254', name: 'Kenya (KE)' },
  { code: '+255', name: 'Tanzania (TZ)' },
  { code: '+256', name: 'Uganda (UG)' },
  { code: '+233', name: 'Ghana (GH)' },
  { code: '+250', name: 'Rwanda (RW)' },
  { code: '+263', name: 'Zimbabwe (ZW)' },
  { code: '+260', name: 'Zambia (ZM)' },
  { code: '+244', name: 'Angola (AO)' },
  { code: '+258', name: 'Mozambique (MZ)' },
  { code: '+502', name: 'Guatemala (GT)' },
  { code: '+506', name: 'Costa Rica (CR)' },
  { code: '+507', name: 'Panama (PA)' },
  { code: '+593', name: 'Ecuador (EC)' },
  { code: '+51', name: 'Peru (PE)' },
  { code: '+58', name: 'Venezuela (VE)' },
  { code: '+591', name: 'Bolivia (BO)' },
  { code: '+595', name: 'Paraguay (PY)' },
  { code: '+598', name: 'Uruguay (UY)' },
  { code: '+504', name: 'Honduras (HN)' },
  { code: '+503', name: 'El Salvador (SV)' },
  { code: '+505', name: 'Nicaragua (NI)' },
  { code: '+509', name: 'Haiti (HT)' },
  { code: '+501', name: 'Belize (BZ)' },
  { code: '+242', name: 'Congo (CG)' },
  { code: '+243', name: 'DR Congo (CD)' },
  { code: '+221', name: 'Senegal (SN)' },
  { code: '+225', name: 'Ivory Coast (CI)' },
  { code: '+237', name: 'Cameroon (CM)' },
  { code: '+261', name: 'Madagascar (MG)' },
  { code: '+264', name: 'Namibia (NA)' },
  { code: '+267', name: 'Botswana (BW)' },
  { code: '+230', name: 'Mauritius (MU)' },
  { code: '+248', name: 'Seychelles (SC)' },
  { code: '+960', name: 'Maldives (MV)' },
  { code: '+975', name: 'Bhutan (BT)' },
  { code: '+93', name: 'Afghanistan (AF)' },
  { code: '+95', name: 'Myanmar (MM)' },
  { code: '+855', name: 'Cambodia (KH)' },
  { code: '+856', name: 'Laos (LA)' },
  { code: '+998', name: 'Uzbekistan (UZ)' },
  { code: '+995', name: 'Georgia (GE)' },
  { code: '+994', name: 'Azerbaijan (AZ)' },
  { code: '+374', name: 'Armenia (AM)' },
  { code: '+357', name: 'Cyprus (CY)' },
  { code: '+356', name: 'Malta (MT)' },
  { code: '+352', name: 'Luxembourg (LU)' },
  { code: '+370', name: 'Lithuania (LT)' },
  { code: '+371', name: 'Latvia (LV)' },
  { code: '+372', name: 'Estonia (EE)' },
  { code: '+386', name: 'Slovenia (SI)' },
  { code: '+385', name: 'Croatia (HR)' },
  { code: '+387', name: 'Bosnia (BA)' },
  { code: '+381', name: 'Serbia (RS)' },
  { code: '+359', name: 'Bulgaria (BG)' },
  { code: '+421', name: 'Slovakia (SK)' }
];

export const AddCompany: React.FC = () => {
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()

  // Mobile sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Desktop sidebar collapsed state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => localStorage.getItem('sa_sidebar_collapsed') === 'true')

  const handleToggleCollapse = (collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed)
    localStorage.setItem('sa_sidebar_collapsed', String(collapsed))
  }

  // Notifications dropdown state
  const [showNotifications, setShowNotifications] = useState(false)

  // Form states matching fields requested:
  const [companyName, setCompanyName] = useState('')
  const [address, setAddress] = useState('')
  const [email, setEmail] = useState('')
  const [contactPerson, setContactPerson] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [designation, setDesignation] = useState('')
  const [gstNo, setGstNo] = useState('')
  const [panNo, setPanNo] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Submission States
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Validation States
  const [companyNameError, setCompanyNameError] = useState('')
  const [addressError, setAddressError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [contactPersonError, setContactPersonError] = useState('')
  const [mobileNumberError, setMobileNumberError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [gstNoError, setGstNoError] = useState('')
  const [panNoError, setPanNoError] = useState('')

  const [countryCode, setCountryCode] = useState('+91')

  // Change Handlers
  const handleCompanyNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setCompanyName(val)
    setCompanyNameError(validateCompanyName(val))
    setError(null)
  }

  const handleAddressChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setAddress(val)
    setAddressError(validateRequired(val, 'Address'))
    setError(null)
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setEmail(val)
    setEmailError(validateEmail(val))
    setError(null)
  }

  const handleContactPersonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setContactPerson(val)
    setContactPersonError(validateContactPerson(val))
    setError(null)
  }

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '')
    setMobileNumber(val)
    setMobileNumberError(validateMobile(val))
    setError(null)
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setPassword(val)
    setPasswordError(validatePassword(val))
    setError(null)
  }

  const handleGstChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase().trim()
    setGstNo(val)
    setGstNoError(validateGST(val))
    setError(null)
  }

  const handlePanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase().trim()
    setPanNo(val)
    setPanNoError(validatePAN(val))
    setError(null)
  }

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const cErr = validateCompanyName(companyName)
    const aErr = validateRequired(address, 'Address')
    const eErr = validateEmail(email)
    const cpErr = validateContactPerson(contactPerson)
    const mErr = validateMobile(mobileNumber)
    const pErr = validatePassword(password)
    const gErr = validateGST(gstNo)
    const panErr = validatePAN(panNo)

    setCompanyNameError(cErr)
    setAddressError(aErr)
    setEmailError(eErr)
    setContactPersonError(cpErr)
    setMobileNumberError(mErr)
    setPasswordError(pErr)
    setGstNoError(gErr)
    setPanNoError(panErr)

    if (cErr || aErr || eErr || cpErr || mErr || pErr || gErr || panErr) {
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      await api.post('/companies', {
        name: companyName,
        address,
        email,
        contactPerson,
        mobileNumber: `${countryCode} ${mobileNumber}`,
        designation,
        gstNo,
        panNo,
        password
      })

      // Navigate to companies tab on dashboard
      navigate('/superadmin/dashboard?tab=company')
    } catch (err: any) {
      console.error('Error creating company:', err)
      const errMsg = err.response?.data?.message || 'Failed to create company. Please try again.'
      setError(errMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen w-full bg-brand-bg text-brand-charcoal font-sans overflow-hidden">
      
      {/* ── SIDEBAR ── */}
      <SuperadminSidebar 
        activeMenu="company" 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      {/* ── MAIN CONTENT AREA ── */}
      <div className={`flex-1 flex flex-col h-screen overflow-y-auto min-w-0 transition-all duration-300 ${
        isSidebarCollapsed ? 'ml-0 md:ml-20' : 'ml-0 md:ml-64'
      }`}>
        
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-border-base px-4 md:px-8 flex items-center justify-between sticky top-0 transition-all duration-300 z-20 shadow-sm shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 text-zinc-500 hover:text-zinc-800 rounded-lg transition-colors cursor-pointer md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb in Nav Bar */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-extrabold text-zinc-400 select-none">
              <Link to="/superadmin/dashboard" className="hover:text-brand-primary transition-colors cursor-pointer">Home</Link>
              <span>/</span>
              <Link to="/superadmin/dashboard?tab=company" className="hover:text-brand-primary transition-colors cursor-pointer">Company</Link>
              <span>/</span>
              <span className="text-brand-primary">Register</span>
            </div>
          </div>

          <div className="flex items-center gap-5">
            {/* Notification bell */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-zinc-500 hover:text-zinc-800 rounded-lg transition-colors cursor-pointer relative"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-brand-primary text-white font-extrabold text-[9px] flex items-center justify-center rounded-full border border-white">
                  3
                </span>
              </button>
            </div>

            {/* Theme Toggle Button Group */}
            <div className="flex items-center gap-1 bg-zinc-100 border border-border-base p-1 rounded-xl">
              {[
                { mode: 'light', icon: '☀️', title: 'Light' },
                { mode: 'dark', icon: '🌙', title: 'Dark' },
                { mode: 'system', icon: '🖥️', title: 'System' },
              ].map(({ mode, icon, title }) => {
                const isActive = theme === mode
                return (
                  <button
                    key={mode}
                    onClick={() => setTheme(mode as ThemeMode)}
                    title={title}
                    className={`w-6 h-6 rounded-lg text-[10px] flex items-center justify-center transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white text-brand-primary shadow-sm border border-border-base'
                        : 'text-zinc-400 hover:text-zinc-600'
                    }`}
                  >
                    {icon}
                  </button>
                )
              })}
            </div>

            <div className="h-5 w-[1px] bg-zinc-200" />

            {/* Profile Dropdown */}
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 border border-border-base">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-xs font-black text-zinc-800">Super Admin</span>
            </div>
          </div>

          {showNotifications && (
            <>
              {/* Invisible click overlay to close dropdown */}
              <div className="fixed inset-0 z-30" onClick={() => setShowNotifications(false)} />
              
              {/* Dropdown panel */}
              <div className="fixed md:absolute top-16 right-4 left-4 md:left-auto md:right-8 mt-1 w-auto md:w-80 bg-white border border-border-base shadow-2xl rounded-2xl z-40 overflow-hidden py-1 text-left animate-fade-in">
                <div className="px-4 py-2.5 border-b border-zinc-100 flex items-center justify-between">
                  <span className="text-xs font-black text-zinc-800">Notifications</span>
                  <span className="text-[9px] font-black uppercase bg-red-50 text-brand-primary px-2 py-0.5 rounded-full">3 New</span>
                </div>
                
                <div className="divide-y divide-zinc-50 max-h-[300px] overflow-y-auto">
                  <div className="p-3.5 hover:bg-zinc-50/50 transition-colors cursor-pointer flex gap-3 items-start">
                    <div className="w-2.5 h-2.5 rounded-full bg-brand-primary mt-1 shrink-0" />
                    <div className="space-y-0.5">
                      <p className="text-xs font-extrabold text-zinc-800">New company registered</p>
                      <p className="text-[10px] text-zinc-500 font-bold leading-normal">Design Studio Ltd. has registered as a new system tenant.</p>
                      <span className="text-[9px] text-zinc-400 font-bold block mt-1">2 hours ago</span>
                    </div>
                  </div>
                  
                  <div className="p-3.5 hover:bg-zinc-50/50 transition-colors cursor-pointer flex gap-3 items-start">
                    <div className="w-2.5 h-2.5 rounded-full bg-brand-primary mt-1 shrink-0" />
                    <div className="space-y-0.5">
                      <p className="text-xs font-extrabold text-zinc-800">Database Backup Successful</p>
                      <p className="text-[10px] text-zinc-500 font-bold leading-normal">Daily automated database synchronization completed successfully.</p>
                      <span className="text-[9px] text-zinc-400 font-bold block mt-1">5 hours ago</span>
                    </div>
                  </div>
                  
                  <div className="p-3.5 hover:bg-zinc-50/50 transition-colors cursor-pointer flex gap-3 items-start">
                    <div className="w-2.5 h-2.5 rounded-full bg-brand-primary mt-1 shrink-0" />
                    <div className="space-y-0.5">
                      <p className="text-xs font-extrabold text-zinc-800">System update deployed</p>
                      <p className="text-[10px] text-zinc-500 font-bold leading-normal">Superadmin control panel updated to version 1.4.2.</p>
                      <span className="text-[9px] text-zinc-400 font-bold block mt-1">1 day ago</span>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => setShowNotifications(false)}
                  className="w-full text-center py-2.5 text-brand-primary hover:text-primary-600 hover:bg-zinc-50/50 font-black text-[9px] uppercase tracking-wider border-t border-zinc-100 block transition-colors"
                >
                  Clear all notifications
                </button>
              </div>
            </>
          )}
        </header>

        {/* Page Body */}
        <main className="flex-grow p-4 sm:p-6 md:p-8 pt-4 sm:pt-6 md:pt-8 space-y-6 max-w-[1000px] w-full mx-auto">
          
          {/* Title Header */}
          <div className="flex items-center justify-between shrink-0">
            <div className="text-left space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">Register New Company</h2>
              <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Setup tenant details</p>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl border border-border-base shadow-[0_8px_32px_rgba(0,0,0,0.03)] p-4 sm:p-6 md:p-10 text-left">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Form Section 1: General Company Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-black text-brand-primary uppercase tracking-wider border-b border-zinc-100 pb-2">
                  Company Information
                </h3>
                
                <div className="grid grid-cols-1 gap-5">
                  {/* Company Name */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-zinc-500 tracking-wider uppercase block">
                      Company Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={30}
                      placeholder="e.g. Design Studio Architects"
                      value={companyName}
                      onChange={handleCompanyNameChange}
                      className={`w-full px-4 py-3 rounded-xl border text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 transition-all bg-white ${
                        companyNameError
                          ? 'border-red-500 focus:ring-red-500/25 focus:border-red-500'
                          : 'border-zinc-200 focus:ring-brand-primary/10 focus:border-brand-primary'
                      }`}
                    />
                    {companyNameError && (
                      <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 mt-0.5">
                        <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {companyNameError}
                      </p>
                    )}
                  </div>

                  {/* Company Address */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-zinc-500 tracking-wider uppercase block">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Sector V, Salt Lake, Kolkata, West Bengal - 700091"
                      value={address}
                      onChange={handleAddressChange}
                      className={`w-full px-4 py-3 rounded-xl border text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 transition-all bg-white resize-none ${
                        addressError
                          ? 'border-red-500 focus:ring-red-500/25 focus:border-red-500'
                          : 'border-zinc-200 focus:ring-brand-primary/10 focus:border-brand-primary'
                      }`}
                    />
                    {addressError && (
                      <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 mt-0.5">
                        <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {addressError}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Form Section 2: Contact Details */}
              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-black text-brand-primary uppercase tracking-wider border-b border-zinc-100 pb-2">
                  Contact & Representative Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-zinc-500 tracking-wider uppercase block">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. contact@designstudio.com"
                      value={email}
                      onChange={handleEmailChange}
                      className={`w-full px-4 py-3 rounded-xl border text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 transition-all bg-white ${
                        emailError
                          ? 'border-red-500 focus:ring-red-500/25 focus:border-red-500'
                          : 'border-zinc-200 focus:ring-brand-primary/10 focus:border-brand-primary'
                      }`}
                    />
                    {emailError && (
                      <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 mt-0.5">
                        <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {emailError}
                      </p>
                    )}
                  </div>

                  {/* Contact Person Name */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-zinc-500 tracking-wider uppercase block">
                      Contact Person Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={30}
                      placeholder="e.g. Arjun Sen"
                      value={contactPerson}
                      onChange={handleContactPersonChange}
                      className={`w-full px-4 py-3 rounded-xl border text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 transition-all bg-white ${
                        contactPersonError
                          ? 'border-red-500 focus:ring-red-500/25 focus:border-red-500'
                          : 'border-zinc-200 focus:ring-brand-primary/10 focus:border-brand-primary'
                      }`}
                    />
                    {contactPersonError && (
                      <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 mt-0.5">
                        <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {contactPersonError}
                      </p>
                    )}
                  </div>

                  {/* Mobile Number */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-zinc-500 tracking-wider uppercase block">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="px-3 py-3 rounded-xl border border-zinc-200 text-xs text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/10 focus:border-brand-primary transition-all w-24"
                      >
                        {countryCodes.map((cc) => (
                          <option key={cc.code} value={cc.code}>
                            {cc.code} ({cc.name})
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        maxLength={10}
                        placeholder="9876543210"
                        value={mobileNumber}
                        onChange={handleMobileChange}
                        className={`flex-grow px-4 py-3 rounded-xl border text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 transition-all bg-white ${
                          mobileNumberError
                            ? 'border-red-500 focus:ring-red-500/25 focus:border-red-500'
                            : 'border-zinc-200 focus:ring-brand-primary/10 focus:border-brand-primary'
                        }`}
                      />
                    </div>
                    {mobileNumberError && (
                      <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 mt-0.5">
                        <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {mobileNumberError}
                      </p>
                    )}
                  </div>

                  {/* Designation */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-zinc-500 tracking-wider uppercase block">
                      Designation in Company
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Managing Partner / Principal Architect"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/10 focus:border-brand-primary transition-all bg-white"
                    />
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-zinc-500 tracking-wider uppercase block">
                      Company Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter a secure password for this company"
                        value={password}
                        onChange={handlePasswordChange}
                        className={`w-full pl-4 pr-10 py-3 rounded-xl border text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 transition-all bg-white ${
                          passwordError
                            ? 'border-red-500 focus:ring-red-500/25 focus:border-red-500'
                            : 'border-zinc-200 focus:ring-brand-primary/10 focus:border-brand-primary'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {passwordError && (
                      <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 mt-0.5">
                        <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {passwordError}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Form Section 3: Tax & Registration */}
              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-black text-brand-primary uppercase tracking-wider border-b border-zinc-100 pb-2">
                  Taxation & Financial Registrations
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* GST No */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-zinc-500 tracking-wider uppercase block">
                      GST Number (GSTIN) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={15}
                      placeholder="e.g. 19AAACD1234A1Z1"
                      value={gstNo}
                      onChange={handleGstChange}
                      className={`w-full px-4 py-3 rounded-xl border text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 transition-all bg-white font-mono ${
                        gstNoError
                          ? 'border-red-500 focus:ring-red-500/25 focus:border-red-500'
                          : 'border-zinc-200 focus:ring-brand-primary/10 focus:border-brand-primary'
                      }`}
                    />
                    {gstNoError && (
                      <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 mt-0.5">
                        <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {gstNoError}
                      </p>
                    )}
                  </div>

                  {/* PAN No */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-zinc-500 tracking-wider uppercase block">
                      PAN Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={10}
                      placeholder="e.g. AAACD1234A"
                      value={panNo}
                      onChange={handlePanChange}
                      className={`w-full px-4 py-3 rounded-xl border text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 transition-all bg-white font-mono ${
                        panNoError
                          ? 'border-red-500 focus:ring-red-500/25 focus:border-red-500'
                          : 'border-zinc-200 focus:ring-brand-primary/10 focus:border-brand-primary'
                      }`}
                    />
                    {panNoError && (
                      <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 mt-0.5">
                        <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {panNoError}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Server Error Alert */}
              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold flex items-center gap-2 mt-4">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {/* Actions button footer */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 pt-6 border-t border-zinc-100 sm:justify-end">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => navigate('/superadmin/dashboard?tab=company')}
                  className="w-full sm:w-auto px-6 py-3 bg-brand-cancel hover:bg-brand-cancel-hover text-black text-xs font-black rounded-xl uppercase transition-colors tracking-wide cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto px-8 py-3 bg-brand-primary hover:bg-primary-600 text-white text-xs font-black rounded-xl uppercase shadow-lg shadow-brand-primary/20 transition-all tracking-wide cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-center"
                >
                  {isLoading ? 'Creating...' : 'Create Company'}
                </button>
              </div>

            </form>
          </div>

        </main>
      </div>

    </div>
  )
}
