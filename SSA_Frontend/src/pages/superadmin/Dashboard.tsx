import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { SuperadminSidebar } from '../../components/SuperadminSidebar'
import { useTheme } from '../../utils/theme'
import type { ThemeMode } from '../../utils/themeConfig'
import { CompanyTable } from './components/CompanyTable'
import { StatsCards } from './components/StatsCards'
import api from '../../services/api'
import { 
  Building2,
  Users,
  ChevronRight,
  Menu,
  Bell,
  X,
  AlertCircle
} from 'lucide-react'

// Define Company interface with new registration and tax fields
interface Company {
  id: string
  name: string
  status: 'Active' | 'Inactive'
  joinedDate: string
  address: string
  email: string
  contactPerson: string
  mobileNumber: string
  designation: string
  gstNo: string
  panNo: string
}

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

export const SuperadminDashboard: React.FC = () => {
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()

  // State to manage active menu selection, prefilled from URL query parameters
  const [currentMenu, setCurrentMenu] = useState<'dashboard' | 'company'>(() => {
    const params = new URLSearchParams(window.location.search)
    const tab = params.get('tab')
    return tab === 'company' ? 'company' : 'dashboard'
  })

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

  // Search filter
  const [searchQuery, setSearchQuery] = useState('')

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null)
  const [companyToDeleteId, setCompanyToDeleteId] = useState<string | null>(null)
  const [editCompanyName, setEditCompanyName] = useState('')
  const [editCompanyStatus, setEditCompanyStatus] = useState<'Active' | 'Inactive'>('Active')
  const [editCompanyAddress, setEditCompanyAddress] = useState('')
  const [editCompanyEmail, setEditCompanyEmail] = useState('')
  const [editCompanyContactPerson, setEditCompanyContactPerson] = useState('')
  const [editCompanyMobileNumber, setEditCompanyMobileNumber] = useState('')
  const [editCompanyDesignation, setEditCompanyDesignation] = useState('')
  const [editCompanyGstNo, setEditCompanyGstNo] = useState('')
  const [editCompanyPanNo, setEditCompanyPanNo] = useState('')

  // Validation States for Edit Modal
  const [editCompanyNameError, setEditCompanyNameError] = useState('')
  const [editCompanyAddressError, setEditCompanyAddressError] = useState('')
  const [editCompanyEmailError, setEditCompanyEmailError] = useState('')
  const [editCompanyContactPersonError, setEditCompanyContactPersonError] = useState('')
  const [editCompanyMobileNumberError, setEditCompanyMobileNumberError] = useState('')
  const [editCompanyGstNoError, setEditCompanyGstNoError] = useState('')
  const [editCompanyPanNoError, setEditCompanyPanNoError] = useState('')

  const [editCompanyCountryCode, setEditCompanyCountryCode] = useState('+91')

  // Change Handlers for Edit Modal
  const handleEditCompanyNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setEditCompanyName(val)
    setEditCompanyNameError(validateCompanyName(val))
  }

  const handleEditCompanyAddressChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setEditCompanyAddress(val)
    setEditCompanyAddressError(validateRequired(val, 'Address'))
  }

  const handleEditCompanyEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setEditCompanyEmail(val)
    setEditCompanyEmailError(validateEmail(val))
  }

  const handleEditCompanyContactPersonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setEditCompanyContactPerson(val)
    setEditCompanyContactPersonError(validateContactPerson(val))
  }

  const handleEditCompanyMobileNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '')
    setEditCompanyMobileNumber(val)
    setEditCompanyMobileNumberError(validateMobile(val))
  }

  const handleEditCompanyGstChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase().trim()
    setEditCompanyGstNo(val)
    setEditCompanyGstNoError(validateGST(val))
  }

  const handleEditCompanyPanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase().trim()
    setEditCompanyPanNo(val)
    setEditCompanyPanNoError(validatePAN(val))
  }

  // Unified companies list state synchronized with DB
  const [companies, setCompanies] = useState<Company[]>([])

  const fetchCompanies = async () => {
    try {
      const response = await api.get('/companies')
      const mapped = response.data.map((item: any) => ({
        ...item,
        id: item.companyId,
        joinedDate: (() => {
          const d = new Date(item.joinedDate);
          if (isNaN(d.getTime())) return item.joinedDate;
          const day = String(d.getDate()).padStart(2, '0');
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const year = d.getFullYear();
          return `${day}-${month}-${year}`;
        })()
      }))
      setCompanies(mapped)
    } catch (err) {
      console.error('Failed to fetch companies from DB:', err)
    }
  }

  useEffect(() => {
    fetchCompanies()
  }, [])


  // Handle Tab Menu Changes
  const handleMenuChange = (menu: 'dashboard' | 'company') => {
    setCurrentMenu(menu)
    if (menu === 'dashboard') {
      navigate('/superadmin/dashboard', { replace: true })
    } else {
      navigate(`/superadmin/dashboard?tab=${menu}`, { replace: true })
    }
  }

  // Handle Delete Company
  const handleDeleteCompany = (id: string) => {
    setCompanyToDeleteId(id)
  }

  const confirmDeleteCompany = async () => {
    if (companyToDeleteId) {
      try {
        await api.delete(`/companies?companyId=${companyToDeleteId}`)
        await fetchCompanies()
        setCompanyToDeleteId(null)
      } catch (err: any) {
        console.error('Failed to delete company:', err)
        alert(err.response?.data?.message || 'Failed to delete company. Please try again.')
      }
    }
  }

  // Handle Edit Click
  const handleEditClick = (company: Company) => {
    // Reset validation states
    setEditCompanyNameError('')
    setEditCompanyAddressError('')
    setEditCompanyEmailError('')
    setEditCompanyContactPersonError('')
    setEditCompanyMobileNumberError('')
    setEditCompanyGstNoError('')
    setEditCompanyPanNoError('')

    setEditingCompanyId(company.id)
    setEditCompanyName(company.name)
    setEditCompanyStatus(company.status)
    setEditCompanyAddress(company.address || '')
    setEditCompanyEmail(company.email || '')
    setEditCompanyContactPerson(company.contactPerson || '')
    setEditCompanyDesignation(company.designation || '')
    setEditCompanyGstNo(company.gstNo || '')
    setEditCompanyPanNo(company.panNo || '')

    // Parse country code and number
    let cc = '+91'
    let num = company.mobileNumber || ''
    if (num.startsWith('+')) {
      const parts = num.trim().split(' ')
      if (parts.length > 1) {
        cc = parts[0]
        num = parts.slice(1).join(' ')
      } else {
        const match = num.match(/^(\+\d{1,4})(.*)$/)
        if (match) {
          cc = match[1]
          num = match[2]
        }
      }
    }
    setEditCompanyCountryCode(cc)
    setEditCompanyMobileNumber(num.replace(/\D/g, ''))

    setIsEditModalOpen(true)
  }

  // Save Edit Changes
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()

    const cErr = validateCompanyName(editCompanyName)
    const aErr = validateRequired(editCompanyAddress, 'Address')
    const eErr = validateEmail(editCompanyEmail)
    const cpErr = validateContactPerson(editCompanyContactPerson)
    const mErr = validateMobile(editCompanyMobileNumber)
    const gErr = validateGST(editCompanyGstNo)
    const panErr = validatePAN(editCompanyPanNo)

    setEditCompanyNameError(cErr)
    setEditCompanyAddressError(aErr)
    setEditCompanyEmailError(eErr)
    setEditCompanyContactPersonError(cpErr)
    setEditCompanyMobileNumberError(mErr)
    setEditCompanyGstNoError(gErr)
    setEditCompanyPanNoError(panErr)

    if (cErr || aErr || eErr || cpErr || mErr || gErr || panErr) {
      return
    }

    if (!editingCompanyId || !editCompanyName) return

    try {
      await api.put('/companies', {
        companyId: editingCompanyId,
        name: editCompanyName,
        status: editCompanyStatus,
        address: editCompanyAddress,
        email: editCompanyEmail,
        contactPerson: editCompanyContactPerson,
        mobileNumber: `${editCompanyCountryCode} ${editCompanyMobileNumber}`,
        designation: editCompanyDesignation,
        gstNo: editCompanyGstNo,
        panNo: editCompanyPanNo
      })

      await fetchCompanies()
      setIsEditModalOpen(false)
      setEditingCompanyId(null)
    } catch (err: any) {
      console.error('Failed to update company:', err)
      alert(err.response?.data?.message || 'Failed to update company. Please try again.')
    }
  }

  // Filter organizations by search query
  const filteredCompanies = companies.filter(company => 
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Calculations for KPIs
  const totalCompaniesCount = companies.length
  const activeCompaniesCount = companies.filter(c => c.status === 'Active').length
  const totalUsersCount = companies.filter(c => c.status === 'Active').length
  const recentlyAddedCount = companies.filter(c => {
    // joinedDate is stored as DD-MM-YYYY after mapping
    const parts = c.joinedDate.split('-')
    if (parts.length !== 3) return false
    const d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`)
    if (isNaN(d.getTime())) return false
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return d >= thirtyDaysAgo
  }).length

  return (
    <div className="min-h-screen w-screen bg-brand-bg text-brand-charcoal font-sans flex overflow-x-hidden">
      
      {/* ── SIDEBAR ── */}
      <SuperadminSidebar 
        activeMenu={currentMenu} 
        onMenuChange={handleMenuChange} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      {/* ── MAIN CONTENT AREA ── */}
      <div className={`flex-grow min-h-screen flex flex-col w-full transition-all duration-300 ${
        isSidebarCollapsed ? 'ml-0 md:ml-20 md:w-[calc(100vw-80px)]' : 'ml-0 md:ml-64 md:w-[calc(100vw-256px)]'
      }`}>
        
        {/* Top Navbar */}
        <header className={`h-16 bg-white border-b border-zinc-200/80 px-4 md:px-8 flex items-center justify-between fixed top-0 right-0 left-0 transition-all duration-300 z-20 shadow-sm shrink-0 ${
          isSidebarCollapsed ? 'md:left-20' : 'md:left-64'
        }`}>
          <div>
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 text-zinc-500 hover:text-zinc-800 rounded-lg transition-colors cursor-pointer md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
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
            <div className="flex items-center gap-1 bg-zinc-100 border border-zinc-200/80 p-1 rounded-xl">
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
                        ? 'bg-white text-brand-primary shadow-sm border border-zinc-200/50'
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
              <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 border border-zinc-200">
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
              <div className="fixed md:absolute top-16 right-4 left-4 md:left-auto md:right-8 mt-1 w-auto md:w-80 bg-white border border-zinc-200 shadow-2xl rounded-2xl z-40 overflow-hidden py-1 text-left animate-fade-in">
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
        <main className="flex-grow p-8 pt-24 space-y-8 max-w-[1400px] w-full mx-auto">
          
          {currentMenu === 'dashboard' ? (
            <>
              {/* Dashboard Title & Breadcrumb */}
              <div className="flex items-center justify-between shrink-0">
                <div className="text-left space-y-1">
                  <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Dashboard</h2>
                  <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Overview</p>
                </div>
                
                <div className="text-xs font-bold text-zinc-400 flex items-center gap-2 select-none">
                  <span>Home</span>
                  <span>/</span>
                  <span className="text-brand-primary">Dashboard</span>
                </div>
              </div>

              {/* ── KPI SECTION ── */}
              <StatsCards
                totalCompaniesCount={totalCompaniesCount}
                activeCompaniesCount={activeCompaniesCount}
                totalUsersCount={totalUsersCount}
                recentlyAddedCount={recentlyAddedCount}
              />

              {/* ── COMPANIES OVERVIEW SECTION ── */}
              <div className="space-y-4 shrink-0 text-left">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-zinc-800">Companies Overview</h3>
                  <button 
                    onClick={() => setCurrentMenu('company')}
                    className="px-4 py-2 bg-brand-primary hover:bg-primary-600 text-white text-xs font-black tracking-wider uppercase rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    View All Companies
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Company Cards Grid Slider Container */}
                <div className="relative">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 overflow-x-hidden py-1">
                    {companies.slice(0, 4).map((company) => (
                      <div 
                        key={company.id}
                        className="bg-white rounded-2xl border border-zinc-200/80 overflow-hidden shadow-sm flex flex-col relative group hover:border-brand-primary/30 transition-all duration-300"
                      >
                        {/* Grayscale Building Header Image */}
                        <div className="h-[140px] w-full relative overflow-hidden bg-zinc-200 shrink-0">
                          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>

                        {/* Floating building icon circle */}
                        <div className="absolute top-[120px] left-4 z-10 w-9 h-9 rounded-xl bg-white border border-zinc-200/80 shadow-md flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-brand-primary" />
                        </div>

                         {/* Card Content body */}
                        <div className="pt-6 p-4 flex flex-col justify-between flex-grow text-left">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="text-sm font-black text-zinc-800 truncate" title={company.name}>
                                {company.name}
                              </h4>
                              {/* Status pill badge */}
                              <span className={`px-2.5 py-0.5 rounded-full font-black text-[9px] uppercase tracking-wide inline-block shrink-0 ${
                                company.status === 'Active' 
                                  ? 'bg-emerald-100 text-emerald-800' 
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {company.status}
                              </span>
                            </div>
                            <p className="text-[10px] text-zinc-400 font-mono tracking-tight truncate">
                              {company.email}
                            </p>
                          </div>

                          {/* Contact Details (from form fields) */}
                          <div className="mt-3 pt-3 border-t border-zinc-100 text-[10px] space-y-1.5 text-zinc-600 font-bold">
                            <div>
                              <span className="text-zinc-400 font-extrabold uppercase text-[8px] tracking-wider block">Contact Person</span>
                              <span className="text-zinc-700 font-black truncate block">{company.contactPerson || 'N/A'}</span>
                              {company.designation && <span className="text-zinc-400 font-bold text-[9px] block">({company.designation})</span>}
                            </div>
                            <div>
                              <span className="text-zinc-400 font-extrabold uppercase text-[8px] tracking-wider block">Contact Details</span>
                              <span className="text-zinc-700 font-black truncate block">{company.mobileNumber || 'N/A'}</span>
                              <span className="text-zinc-500 font-mono text-[9px] truncate block">{company.email || 'N/A'}</span>
                            </div>
                          </div>


                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              </div>
            </>
          ) : (
            <>
              {/* Company Management Title & Breadcrumb */}
              <div className="flex items-center justify-between shrink-0">
                <div className="text-left space-y-1">
                  <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Company Management</h2>
                  <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Manage system tenants</p>
                </div>
                
                <div className="text-xs font-bold text-zinc-400 flex items-center gap-2 select-none">
                  <span>Home</span>
                  <span>/</span>
                  <span className="text-brand-primary">Company</span>
                </div>
              </div>

              <CompanyTable
                filteredCompanies={filteredCompanies}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onAddClick={() => navigate('/superadmin/add-company')}
                onEditClick={handleEditClick}
                onDeleteClick={handleDeleteCompany}
              />
            </>
          )}
        </main>
      </div>

      {/* ── EDIT COMPANY MODAL ── */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-zinc-200 shadow-2xl p-6 relative">
            <button
              onClick={() => {
                setIsEditModalOpen(false)
                setEditingCompanyId(null)
              }}
              className="absolute right-4 top-4 p-1 text-zinc-400 hover:text-zinc-700 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-5 text-left border-b border-zinc-100 pb-3">
              <h3 className="text-lg font-black text-zinc-950 tracking-tight">Edit Company Details</h3>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                Update register profiles, contact representative details, and financial values.
              </p>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-left max-h-[70vh] overflow-y-auto px-1">
              
              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Company Name */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-bold text-zinc-500 tracking-wider uppercase block">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={30}
                    value={editCompanyName}
                    onChange={handleEditCompanyNameChange}
                    className={`w-full px-3 py-2 rounded-lg border text-xs text-zinc-900 focus:outline-none focus:ring-2 transition-all bg-white ${
                      editCompanyNameError
                        ? 'border-red-500 focus:ring-red-500/25 focus:border-red-500'
                        : 'border-zinc-200 focus:ring-brand-primary/10 focus:border-brand-primary'
                    }`}
                  />
                  {editCompanyNameError && (
                    <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 mt-0.5">
                      <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {editCompanyNameError}
                    </p>
                  )}
                </div>

                {/* Company Address */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-bold text-zinc-500 tracking-wider uppercase block">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={editCompanyAddress}
                    onChange={handleEditCompanyAddressChange}
                    className={`w-full px-3 py-2 rounded-lg border text-xs text-zinc-900 focus:outline-none focus:ring-2 transition-all bg-white resize-none ${
                      editCompanyAddressError
                        ? 'border-red-500 focus:ring-red-500/25 focus:border-red-500'
                        : 'border-zinc-200 focus:ring-brand-primary/10 focus:border-brand-primary'
                    }`}
                  />
                  {editCompanyAddressError && (
                    <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 mt-0.5">
                      <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {editCompanyAddressError}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 tracking-wider uppercase block">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={editCompanyEmail}
                    onChange={handleEditCompanyEmailChange}
                    className={`w-full px-3 py-2 rounded-lg border text-xs text-zinc-900 focus:outline-none focus:ring-2 transition-all bg-white ${
                      editCompanyEmailError
                        ? 'border-red-500 focus:ring-red-500/25 focus:border-red-500'
                        : 'border-zinc-200 focus:ring-brand-primary/10 focus:border-brand-primary'
                    }`}
                  />
                  {editCompanyEmailError && (
                    <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 mt-0.5">
                      <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {editCompanyEmailError}
                    </p>
                  )}
                </div>

                {/* Contact Person Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 tracking-wider uppercase block">
                    Contact Person Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={30}
                    value={editCompanyContactPerson}
                    onChange={handleEditCompanyContactPersonChange}
                    className={`w-full px-3 py-2 rounded-lg border text-xs text-zinc-900 focus:outline-none focus:ring-2 transition-all bg-white ${
                      editCompanyContactPersonError
                        ? 'border-red-500 focus:ring-red-500/25 focus:border-red-500'
                        : 'border-zinc-200 focus:ring-brand-primary/10 focus:border-brand-primary'
                    }`}
                  />
                  {editCompanyContactPersonError && (
                    <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 mt-0.5">
                      <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {editCompanyContactPersonError}
                    </p>
                  )}
                </div>

                {/* Mobile Number */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 tracking-wider uppercase block">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={editCompanyCountryCode}
                      onChange={(e) => setEditCompanyCountryCode(e.target.value)}
                      className="px-2 py-2 rounded-lg border border-zinc-200 text-xs text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/10 focus:border-brand-primary transition-all w-24"
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
                      value={editCompanyMobileNumber}
                      onChange={handleEditCompanyMobileNumberChange}
                      className={`flex-grow px-3 py-2 rounded-lg border text-xs text-zinc-900 focus:outline-none focus:ring-2 transition-all bg-white ${
                        editCompanyMobileNumberError
                          ? 'border-red-500 focus:ring-red-500/25 focus:border-red-500'
                          : 'border-zinc-200 focus:ring-brand-primary/10 focus:border-brand-primary'
                      }`}
                    />
                  </div>
                  {editCompanyMobileNumberError && (
                    <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 mt-0.5">
                      <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {editCompanyMobileNumberError}
                    </p>
                  )}
                </div>

                {/* Designation */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 tracking-wider uppercase block">Designation</label>
                  <input
                    type="text"
                    value={editCompanyDesignation}
                    onChange={(e) => setEditCompanyDesignation(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/10 focus:border-brand-primary transition-all bg-white"
                  />
                </div>


                {/* GST No */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 tracking-wider uppercase block">GST Number <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    maxLength={15}
                    value={editCompanyGstNo}
                    onChange={handleEditCompanyGstChange}
                    className={`w-full px-3 py-2 rounded-lg border text-xs text-zinc-900 focus:outline-none focus:ring-2 transition-all bg-white font-mono ${
                      editCompanyGstNoError
                        ? 'border-red-500 focus:ring-red-500/25 focus:border-red-500'
                        : 'border-zinc-200 focus:ring-brand-primary/10 focus:border-brand-primary'
                    }`}
                  />
                  {editCompanyGstNoError && (
                    <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 mt-0.5">
                      <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {editCompanyGstNoError}
                    </p>
                  )}
                </div>

                {/* PAN No */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 tracking-wider uppercase block">PAN Number <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    maxLength={10}
                    value={editCompanyPanNo}
                    onChange={handleEditCompanyPanChange}
                    className={`w-full px-3 py-2 rounded-lg border text-xs text-zinc-900 focus:outline-none focus:ring-2 transition-all bg-white font-mono ${
                      editCompanyPanNoError
                        ? 'border-red-500 focus:ring-red-500/25 focus:border-red-500'
                        : 'border-zinc-200 focus:ring-brand-primary/10 focus:border-brand-primary'
                    }`}
                  />
                  {editCompanyPanNoError && (
                    <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 mt-0.5">
                      <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {editCompanyPanNoError}
                    </p>
                  )}
                </div>

                {/* Status Selection */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-bold text-zinc-500 tracking-wider uppercase block">Status</label>
                  <select
                    value={editCompanyStatus}
                    onChange={(e) => setEditCompanyStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/10 focus:border-brand-primary transition-all bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-zinc-100 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false)
                    setEditingCompanyId(null)
                  }}
                  className="px-5 py-2.5 bg-brand-cancel hover:bg-brand-cancel-hover text-black text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-7 py-2.5 bg-brand-primary hover:bg-primary-600 text-white text-xs font-bold rounded-lg transition-colors shadow-md cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRMATION MODAL ── */}
      {companyToDeleteId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-fade-in">
          {/* Backdrop click overlay to close modal */}
          <div 
            className="fixed inset-0 bg-black/10"
            onClick={() => setCompanyToDeleteId(null)}
          />
          
          <div className="bg-white rounded-2xl max-w-sm w-full border border-zinc-200 shadow-2xl p-6 relative z-10 text-center">
            <button
              onClick={() => setCompanyToDeleteId(null)}
              className="absolute right-4 top-4 p-1 text-zinc-400 hover:text-zinc-700 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4 text-brand-primary">
              <AlertCircle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-black text-zinc-950 tracking-tight">Confirm Deletion</h3>
            <p className="text-xs text-zinc-500 mt-2 leading-relaxed font-bold">
              Are you sure you want to delete this company? This action cannot be undone.
            </p>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                type="button"
                onClick={() => setCompanyToDeleteId(null)}
                className="px-4 py-2.5 bg-brand-cancel hover:bg-brand-cancel-hover text-black text-xs font-black rounded-xl uppercase transition-colors tracking-wide cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteCompany}
                className="px-4 py-2.5 bg-brand-primary hover:bg-primary-600 text-white text-xs font-black rounded-xl uppercase transition-colors tracking-wide cursor-pointer shadow-md shadow-brand-primary/10"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
