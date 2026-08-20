import React, { useState, useRef, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useForm, Controller } from 'react-hook-form'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiDollarSign,
  FiCheckSquare, FiUsers, FiActivity, FiMessageSquare,
  FiPaperclip, FiX, FiUploadCloud, FiChevronRight, FiSave,
  FiPlusCircle, FiArrowLeft, FiInfo, FiAlertCircle,
  FiFileText, FiImage, FiFile, FiCheckCircle
} from 'react-icons/fi'
import { MdOutlineArchitecture, MdOutlineSource } from 'react-icons/md'
import api from '../../../services/api'
import { useAuth } from '../../../context/AuthContext'

// ─── Types ────────────────────────────────────────────────────────────────────

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  preview?: string
  url: string
}

interface DBProjectCategory {
  id: number
  code: string
  name: string
  description?: string
}

interface DBCategoryTemplateField {
  id: number
  categoryId: number
  fieldKey: string
  fieldName: string
  fieldType: 'text' | 'number' | 'single-select' | 'multi-select' | 'yes-no' | 'attachment'
  fieldOptions?: string[]
  section: string
  capturedAtStage: 'Lead' | 'Requirement Collection' | 'Client Brief'
  isRequired: boolean
  displayOrder: number
}

interface LeadFormData {
  clientId?: string | null
  leadTitle: string
  clientName: string
  company: string
  contactPerson: string
  mobile: string
  email: string
  leadSource: string
  projectType: string
  projectSubType: string
  category: string
  siteAddress: string
  city: string
  state: string
  country: string
  surveyNumber: string
  siteArea: string
  unit: string
  estimatedBudget: string
  expectedStartDate: string
  expectedCompletionDate: string
  assignedEmployee: string
  branch: string
  branchId?: string | null
  status: string
  remarks: string
  categoryValues?: Record<string, any>

  // Aligned backend CRM fields
  decisionMakers?: string
  priorProjectsWithSSA?: string
  landOwnershipDocsAvailable?: string
  topographyLevels?: string
  accessRoadWidth?: string
  orientation?: string
  existingStructures?: string
  soilReportAvailable?: string
  adjacentDevelopments?: string
  ebSupplySanctionedLoad?: string
  waterSource?: string
  sewerSeptic?: string
  stormDrainage?: string
  telecom?: string
  approvingAuthority?: string
  landUseZoning?: string
  fsiCoverageKnown?: string
  setbacksHeightRestrictions?: string
  priorApprovalsViolations?: string
  specialRestrictions?: string
  expectedFloors?: string
  fundingSource?: string
  phasingNeeds?: string
  contractorStatus?: string
  preferredVendors?: string
  siteVisitFrequencyExpectation?: string
  reportingExpectations?: string
  styleReferencesInspiration?: string
  sustainabilityGoals?: string
  vaastuOrientationRequirements?: string
  materialPreferences?: string
}

// ─── Constants & Options ──────────────────────────────────────────────────────

const PRIMARY_COLOR = '#33a18a'

const PROJECT_SUB_TYPES: Record<string, string[]> = {
  Residential: ['Individual House', 'Apartment', 'Villa', 'Row House', 'Penthouse'],
  School: ['Primary School', 'Secondary School', 'Higher Secondary School', 'Play School', 'Boarding School'],
  Institutional: ['College', 'University', 'Training Centre', 'Community Hall', 'Religious Structure', 'Research Centre', 'Library', 'Museum'],
  Hospital: ['Clinic', 'Nursing Home', 'Diagnostic Centre', 'Multi Speciality Hospital', 'Polyclinic'],
  Hospitality: ['Hotel', 'Resort', 'Serviced Apartment', 'Guest House', 'Restaurant'],
  Commercial: ['Office', 'Retail', 'Mall', 'Showroom', 'Bank'],
  Industrial: ['Factory', 'Warehouse', 'Manufacturing Unit', 'Cold Storage', 'Logistics Hub'],
  'Mixed Use': ['Residential + Commercial', 'Office + Retail', 'Integrated Township'],
  Other: ['Other'],
}

const LEAD_SOURCES = [
  { label: 'Website', icon: '🌐' },
  { label: 'Referral', icon: '🤝' },
  { label: 'Walk-in', icon: '🚶' },
  { label: 'Marketing', icon: '📢' },
  { label: 'Social Media', icon: '📱' },
  { label: 'Existing Client', icon: '⭐' },
  { label: 'Other', icon: '🔗' },
]

const SERVICES = [
  { id: 'architecture', label: 'Architecture', icon: '🏛️' },
  { id: 'interior', label: 'Interior', icon: '🛋️' },
  { id: 'structural', label: 'Structural', icon: '🏗️' },
  { id: 'mep', label: 'MEP', icon: '⚡' },
  { id: 'pmc', label: 'PMC', icon: '📋' },
  { id: 'landscape', label: 'Landscape', icon: '🌿' },
  { id: 'automation', label: 'Automation', icon: '🤖' },
  { id: 'liaison', label: 'Liaison', icon: '🤝' },
  { id: 'specialSystems', label: 'Special Systems', icon: '🔧' },
]

const STATUS_OPTIONS = [
  { label: 'New Lead', bg: '#EFF6FF', darkBg: '#1e293b', color: '#2563EB', dot: '#2563EB' },
  { label: 'Contacted', bg: '#F5F3FF', darkBg: '#1e1b4b', color: '#7C3AED', dot: '#7C3AED' },
  { label: 'Requirement Collection', bg: '#FFFBEB', darkBg: '#2a1e0b', color: '#D97706', dot: '#D97706' },
  { label: 'Proposal Sent', bg: '#ECFEFF', darkBg: '#083344', color: '#0891B2', dot: '#0891B2' },
  { label: 'Won', bg: '#F0FDF4', darkBg: '#052e16', color: '#16A34A', dot: '#16A34A' },
  { label: 'Lost', bg: '#FEF2F2', darkBg: '#3b0764', color: '#DC2626', dot: '#DC2626' },
]



// ─── Theme-Aware Input Styles ─────────────────────────────────────────────────

const inputCls = `
  w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all duration-200
  bg-white dark:bg-slate-900 
  text-slate-800 dark:text-slate-100 
  border-slate-200 dark:border-slate-700/80 
  placeholder-slate-400 dark:placeholder-slate-500
  focus:outline-none focus:ring-2 focus:ring-[#33a18a]/20 focus:border-[#33a18a]
`.trim()

const selectCls = `
  w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all duration-200 appearance-none cursor-pointer
  bg-white dark:bg-slate-900 
  text-slate-800 dark:text-slate-100 
  border-slate-200 dark:border-slate-700/80
  focus:outline-none focus:ring-2 focus:ring-[#33a18a]/20 focus:border-[#33a18a]
`.trim()

// ─── Sub-Components ───────────────────────────────────────────────────────────

const SectionCard: React.FC<{
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  delay?: number
}> = ({ title, icon, children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay, ease: 'easeOut' }}
    className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden"
  >
    <div className="flex items-center gap-3 px-6 py-3.5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/40">
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
        style={{ background: `linear-gradient(135deg, ${PRIMARY_COLOR} 0%, #288571 100%)` }}
      >
        {icon}
      </div>
      <h2 className="text-xs font-bold tracking-wider text-slate-700 dark:text-slate-200 uppercase">
        {title}
      </h2>
    </div>
    <div className="p-5 sm:p-6">{children}</div>
  </motion.div>
)

const FormField: React.FC<{
  label: string
  required?: boolean
  error?: string
  hint?: string
  children: React.ReactNode
}> = ({ label, required, error, hint, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
      {label}
      {required && <span className="text-red-500 font-bold">*</span>}
    </label>
    {children}
    {hint && !error && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{hint}</p>}
    <AnimatePresence>
      {error && (
        <motion.p
          key="error"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          className="text-xs text-red-500 flex items-center gap-1 mt-0.5 font-medium"
        >
          <FiAlertCircle size={11} />
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  </div>
)

const SelectChevron = () => (
  <FiChevronRight
    size={14}
    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none"
  />
)

// ─── Main Page Component ───────────────────────────────────────────────────────

export const CreateLead: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const prefillClientId = searchParams.get('clientId')
  const isEditMode = !!id
  const { user } = useAuth()

  const [clientsList, setClientsList] = useState<any[]>([])
  const [selectedClientId, setSelectedClientId] = useState<string>('')

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isUploadingGeneral, setIsUploadingGeneral] = useState(false)
  const [uploadingFields, setUploadingFields] = useState<Record<string, boolean>>({})
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [dbBranches, setDbBranches] = useState<any[]>([])
  const [dbEmployees, setDbEmployees] = useState<any[]>([])
  const [companyName, setCompanyName] = useState('Sundar Sundram Architects')
  const [loadingExistingLead, setLoadingExistingLead] = useState(false)

  // Auto-generate Lead ID (or use existing on edit)
  const [leadId, setLeadId] = useState(
    () => `LD-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000)).padStart(4, '0')}`
  )

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    getValues,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormData>({
    mode: 'onChange',
    defaultValues: {
      status: 'New Lead',
      country: 'India',
      unit: 'Sq.ft',
      branch: '',
      branchId: null,
      priorProjectsWithSSA: 'No',
      landOwnershipDocsAvailable: 'Yes',
      existingStructures: 'None',
      soilReportAvailable: 'No',
      waterSource: 'Metro Water',
      sewerSeptic: 'Public Sewer line',
      stormDrainage: 'Available / Connected',
      fundingSource: 'Self Funded',
      phasingNeeds: 'Single Phase',
      contractorStatus: 'Not Appointed',
    },
  })

  // ── New Client Popup Modal State & Handlers ──
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false)
  const [newClientSubmitting, setNewClientSubmitting] = useState(false)
  const [clientModalForm, setClientModalForm] = useState({
    clientName: '',
    company: '',
    contactPerson: '',
    clientType: 'Corporate',
    mobile: '',
    alternatePhone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
    gstNo: '',
    panNo: '',
    aadharNo: '',
    remarks: '',
  })
  const [clientModalErrors, setClientModalErrors] = useState<Record<string, string>>({})

  const openNewClientModal = useCallback(() => {
    setClientModalForm({
      clientName: '',
      company: '',
      contactPerson: '',
      clientType: 'Corporate',
      mobile: '',
      alternatePhone: '',
      email: '',
      address: '',
      city: '',
      state: '',
      country: 'India',
      pincode: '',
      gstNo: '',
      panNo: '',
      aadharNo: '',
      remarks: '',
    })
    setClientModalErrors({})
    setIsNewClientModalOpen(true)
  }, [])

  const handleSaveNewClient = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}

    // Client Name Validation
    const nameTrim = clientModalForm.clientName.trim()
    if (!nameTrim) {
      errs.clientName = 'Client name is required'
    } else if (nameTrim.length < 2) {
      errs.clientName = 'Client name must be at least 2 characters'
    } else if (!/^[a-zA-Z\s.'-]+$/.test(nameTrim)) {
      errs.clientName = 'Client name should contain only letters, dots, and hyphens'
    }

    // Mobile Number Validation
    const mobileClean = clientModalForm.mobile.replace(/[\s\-+]/g, '')
    if (!clientModalForm.mobile.trim()) {
      errs.mobile = 'Mobile number is required'
    } else if (!/^[6-9]\d{9}$/.test(mobileClean)) {
      errs.mobile = 'Enter a valid 10-digit mobile number (e.g. 9840012345)'
    }

    // Email Address Validation
    const emailTrim = clientModalForm.email.trim()
    if (!emailTrim) {
      errs.email = 'Email address is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) {
      errs.email = 'Enter a valid email address (e.g. client@example.com)'
    }

    // Address Validation
    const addrTrim = clientModalForm.address.trim()
    if (!addrTrim) {
      errs.address = 'Office / Correspondence address is required'
    } else if (addrTrim.length < 5) {
      errs.address = 'Address must be at least 5 characters'
    }

    // City Validation
    if (!clientModalForm.city.trim()) {
      errs.city = 'City is required'
    }

    // State Validation
    if (!clientModalForm.state.trim()) {
      errs.state = 'State is required'
    }

    // Aadhar Number Validation (Optional)
    const aadharClean = (clientModalForm.aadharNo || '').replace(/\s/g, '')
    if (aadharClean.length > 0 && !/^[2-9]\d{11}$/.test(aadharClean)) {
      errs.aadharNo = 'Aadhar number must be a valid 12-digit number (e.g. 1234 5678 9012)'
    }

    // PAN Number Validation (Optional)
    const panClean = (clientModalForm.panNo || '').trim().toUpperCase()
    if (panClean.length > 0 && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panClean)) {
      errs.panNo = 'PAN format must be 5 letters, 4 digits, 1 letter (e.g. ABCDE1234F)'
    }

    // GST Number Validation (Optional)
    const gstClean = (clientModalForm.gstNo || '').trim().toUpperCase()
    if (gstClean.length > 0 && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstClean)) {
      errs.gstNo = 'GST format must be 15-character GSTIN (e.g. 33ABCDE1234F1Z5)'
    }

    if (Object.keys(errs).length > 0) {
      setClientModalErrors(errs)
      return
    }

    setNewClientSubmitting(true)
    try {
      const res = await api.post('/clients', clientModalForm)
      if (res.data?.success && res.data?.data) {
        const created = res.data.data
        // Add to clientsList state
        setClientsList(prev => [created, ...prev])
        // Automatically select & link to current lead
        setSelectedClientId(created.id)
        setValue('clientId', created.id)
        setValue('clientName', created.clientName || created.company || '', { shouldValidate: true })
        if (created.company) setValue('company', created.company, { shouldValidate: true })
        if (created.contactPerson) setValue('contactPerson', created.contactPerson, { shouldValidate: true })
        if (created.mobile) setValue('mobile', created.mobile, { shouldValidate: true })
        if (created.email) setValue('email', created.email, { shouldValidate: true })
        if (created.address) setValue('siteAddress', created.address, { shouldValidate: true })
        if (created.city) setValue('city', created.city, { shouldValidate: true })
        if (created.state) setValue('state', created.state, { shouldValidate: true })
        if (created.country) setValue('country', created.country || 'India', { shouldValidate: true })

        setIsNewClientModalOpen(false)
      } else {
        alert(res.data?.message || 'Failed to create client')
      }
    } catch (err: any) {
      console.error('Error creating client from modal:', err)
      alert(err.response?.data?.message || err.message || 'Error saving client.')
    } finally {
      setNewClientSubmitting(false)
    }
  }

  const handleSelectClient = useCallback((cId: string) => {
    setSelectedClientId(cId)
    if (!cId) {
      setValue('clientId', null)
      setValue('clientName', '', { shouldValidate: false })
      setValue('company', '', { shouldValidate: false })
      setValue('contactPerson', '', { shouldValidate: false })
      setValue('mobile', '', { shouldValidate: false })
      setValue('email', '', { shouldValidate: false })
      setValue('siteAddress', '', { shouldValidate: false })
      setValue('city', '', { shouldValidate: false })
      setValue('state', '', { shouldValidate: false })
      setValue('country', 'India', { shouldValidate: false })
      return
    }
    const client = clientsList.find(c => c.id === cId || c.clientCode === cId)
    if (client) {
      setValue('clientId', client.id)
      setValue('clientName', client.clientName || client.company || '', { shouldValidate: true })
      if (client.company) setValue('company', client.company, { shouldValidate: true })
      if (client.contactPerson) setValue('contactPerson', client.contactPerson, { shouldValidate: true })
      if (client.mobile) setValue('mobile', client.mobile, { shouldValidate: true })
      if (client.email) setValue('email', client.email, { shouldValidate: true })
      if (client.address) setValue('siteAddress', client.address, { shouldValidate: true })
      if (client.city) setValue('city', client.city, { shouldValidate: true })
      if (client.state) setValue('state', client.state, { shouldValidate: true })
      if (client.country) setValue('country', client.country || 'India', { shouldValidate: true })
    }
  }, [clientsList, setValue])

  // ── Fetch existing lead data when in Edit Mode ──────────────────────────────
  useEffect(() => {
    if (!id) return

    const fetchLeadForEdit = async () => {
      setLoadingExistingLead(true)
      try {
        const res = await api.get(`/leads/${id}`)
        if (res.data?.success && res.data?.data) {
          const lead = res.data.data

          if (lead.leadId) {
            setLeadId(lead.leadId)
          }

          if (Array.isArray(lead.servicesRequired)) {
            setSelectedServices(lead.servicesRequired)
          }

          if (Array.isArray(lead.attachments)) {
            setUploadedFiles(lead.attachments)
          }

          let categoryFormVal = 'New Construction'
          const buildTypeLower = (lead.buildType || lead.leadCategory || '').toLowerCase()
          if (buildTypeLower.includes('renovation')) categoryFormVal = 'Renovation'
          else if (buildTypeLower.includes('extension')) categoryFormVal = 'Extension'

          reset({
            leadTitle: lead.leadTitle || lead.projectName || '',
            clientName: lead.clientName || lead.contactPerson || '',
            company: lead.company || lead.organisation || '',
            contactPerson: lead.contactPerson || '',
            mobile: lead.mobile || '',
            email: lead.email || '',
            leadSource: lead.leadSource || 'Referral / Word of Mouth',
            projectType: lead.projectType || (lead.category?.name) || '',
            projectSubType: lead.projectSubType || lead.subType || '',
            category: categoryFormVal,
            siteAddress: lead.siteAddress || lead.locationAddress || '',
            city: lead.city || '',
            state: lead.state || '',
            country: lead.country || 'India',
            surveyNumber: lead.surveyNumber || '',
            siteArea: lead.siteArea || '',
            unit: lead.unit || 'Sq.ft',
            estimatedBudget: lead.estimatedBudget || '',
            expectedStartDate: lead.expectedStartDate || '',
            expectedCompletionDate: lead.expectedCompletionDate || '',
            assignedEmployee: lead.assignedEmployee || '',
            branch: lead.branch || '',
            branchId: lead.branchId || null,
            status: lead.status || 'New Lead',
            remarks: lead.remarks || '',
            categoryValues: lead.categoryValues || {},

            decisionMakers: lead.decisionMakers || '',
            priorProjectsWithSSA: lead.priorProjectsWithSSA || 'No',
            landOwnershipDocsAvailable: lead.landOwnershipDocsAvailable || 'Yes',
            topographyLevels: lead.topographyLevels || '',
            accessRoadWidth: lead.accessRoadWidth || '',
            orientation: lead.orientation || '',
            existingStructures: lead.existingStructures || 'None',
            soilReportAvailable: lead.soilReportAvailable || 'No',
            adjacentDevelopments: lead.adjacentDevelopments || '',
            ebSupplySanctionedLoad: lead.ebSupplySanctionedLoad || '',
            waterSource: lead.waterSource || 'Metro Water',
            sewerSeptic: lead.sewerSeptic || 'Public Sewer line',
            stormDrainage: lead.stormDrainage || 'Available / Connected',
            telecom: lead.telecom || '',
            approvingAuthority: lead.approvingAuthority || '',
            landUseZoning: lead.landUseZoning || '',
            fsiCoverageKnown: lead.fsiCoverageKnown || '',
            setbacksHeightRestrictions: lead.setbacksHeightRestrictions || '',
            priorApprovalsViolations: lead.priorApprovalsViolations || '',
            specialRestrictions: lead.specialRestrictions || '',
            expectedFloors: lead.expectedFloors || '',
            fundingSource: lead.fundingSource || 'Self Funded',
            phasingNeeds: lead.phasingNeeds || 'Single Phase',
            contractorStatus: lead.contractorStatus || 'Not Appointed',
            preferredVendors: lead.preferredVendors || '',
            siteVisitFrequencyExpectation: lead.siteVisitFrequencyExpectation || '',
            reportingExpectations: lead.reportingExpectations || '',
            styleReferencesInspiration: lead.styleReferencesInspiration || '',
            sustainabilityGoals: lead.sustainabilityGoals || '',
            vaastuOrientationRequirements: lead.vaastuOrientationRequirements || '',
            materialPreferences: lead.materialPreferences || '',
          })
        }
      } catch (err) {
        console.error('Failed to fetch lead for edit:', err)
        alert('Failed to load lead details for modification.')
      } finally {
        setLoadingExistingLead(false)
      }
    }

    fetchLeadForEdit()
  }, [id, reset])

  const watchedProjectType = watch('projectType')
  const watchedStatus = watch('status')
  const watchedLeadSource = watch('leadSource')
  const watchedProjectSubType = watch('projectSubType')
  const subTypes = watchedProjectType ? PROJECT_SUB_TYPES[watchedProjectType] ?? [] : []

  const [dbCategories, setDbCategories] = useState<DBProjectCategory[]>([])
  const [templateFields, setTemplateFields] = useState<DBCategoryTemplateField[]>([])
  const [loadingFields, setLoadingFields] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [_isManageModalOpen, setIsManageModalOpen] = useState(false)

  const findMatchingCategory = (projectType: string, categories: DBProjectCategory[]): DBProjectCategory | undefined => {
    if (!projectType || categories.length === 0) return undefined

    const pTypeClean = projectType.trim().toLowerCase()
    const pTypeUpper = projectType.trim().toUpperCase().replace(/\s+/g, '_')

    // 1. Direct ID match
    const byId = categories.find((c) => c.id.toString() === projectType)
    if (byId) return byId

    // 2. Exact Code match (case-insensitive)
    const byExactCode = categories.find((c) => c.code.toUpperCase() === pTypeUpper)
    if (byExactCode) return byExactCode

    // 3. Exact Name match (case-insensitive)
    const byExactName = categories.find((c) => c.name.trim().toLowerCase() === pTypeClean)
    if (byExactName) return byExactName

    // 4. Normalized Code match (e.g. 'HOSPITAL' vs 'HOSPITALS', 'SCHOOL' vs 'SCHOOLS')
    const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '').replace(/s$/, '')
    const normPType = normalize(projectType)
    const byNormCode = categories.find((c) => normalize(c.code) === normPType)
    if (byNormCode) return byNormCode

    // 5. Synonym / Keyword dictionary mapping
    const SYNONYMS: Record<string, string[]> = {
      hospital: ['hospital', 'hospitals', 'healthcare', 'medical', 'clinic', 'health'],
      healthcare: ['hospital', 'hospitals', 'healthcare', 'medical', 'clinic', 'health'],
      school: ['school', 'schools', 'education', 'academic'],
      institutional: ['institution', 'institutional', 'college', 'university', 'academic'],
      hospitality: ['hospitality', 'hotel', 'resort', 'restaurant'],
      residential: ['residential', 'residence', 'villa', 'housing', 'home', 'apartment'],
      commercial: ['commercial', 'office', 'retail', 'mall', 'showroom'],
      industrial: ['industrial', 'factory', 'warehouse', 'manufacturing', 'plant'],
      mixed_use: ['mixed', 'mixed-use', 'mixed_use', 'township']
    }

    const synonyms = SYNONYMS[normPType] || [normPType]
    const bySynonym = categories.find((c) => {
      const catCodeNorm = normalize(c.code)
      const catNameLower = c.name.toLowerCase()
      return synonyms.some((syn) => catCodeNorm.includes(syn) || catNameLower.includes(syn))
    })
    if (bySynonym) return bySynonym

    // 6. Name or Code partial match (starts with or includes)
    const byNameInclude = categories.find(
      (c) =>
        c.name.toLowerCase().startsWith(pTypeClean) ||
        c.name.toLowerCase().includes(pTypeClean) ||
        pTypeClean.includes(c.name.toLowerCase().split(' ')[0]) ||
        c.code.toLowerCase().includes(pTypeClean)
    )
    if (byNameInclude) return byNameInclude

    return undefined
  }

  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get<{ success: boolean; data: DBProjectCategory[] }>('/leads/categories')
      if (response.data?.success) {
        setDbCategories(response.data.data)
      }
    } catch (err: any) {
      console.error('Failed to fetch categories:', err)
    }
  }, [])

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  // Fetch clients, branches, employees, and company details on mount/user change
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [branchesRes, employeesRes, companiesRes, clientsRes] = await Promise.all([
          api.get('/branches'),
          api.get('/employees'),
          api.get('/companies').catch(() => ({ data: [] })),
          api.get('/clients').catch(() => ({ data: { data: [] } }))
        ])
        const branches = branchesRes.data || []
        setDbBranches(branches)
        setDbEmployees(employeesRes.data || [])

        const clients = clientsRes.data?.data || (Array.isArray(clientsRes.data) ? clientsRes.data : [])
        setClientsList(clients)

        // Handle prefilled client from URL param ?clientId=...
        if (prefillClientId && clients.length > 0) {
          const matchedClient = clients.find((c: any) => c.id === prefillClientId || c.clientCode === prefillClientId)
          if (matchedClient) {
            setSelectedClientId(matchedClient.id)
            setValue('clientId', matchedClient.id)
            setValue('clientName', matchedClient.clientName || matchedClient.company || '')
            if (matchedClient.company) setValue('company', matchedClient.company)
            if (matchedClient.contactPerson) setValue('contactPerson', matchedClient.contactPerson)
            if (matchedClient.mobile) setValue('mobile', matchedClient.mobile)
            if (matchedClient.email) setValue('email', matchedClient.email)
            if (matchedClient.address) setValue('siteAddress', matchedClient.address)
            if (matchedClient.city) setValue('city', matchedClient.city)
            if (matchedClient.state) setValue('state', matchedClient.state)
            if (matchedClient.country) setValue('country', matchedClient.country || 'India')
          }
        }

        // Set default branch only for creation
        if (user?.role === 'Branch' && user?.name) {
          setValue('branch', user.name)
          setValue('branchId', user.id)
        } else if (!isEditMode) {
          setValue('branch', '')
          setValue('branchId', null)
        }

        // Determine company name
        if (user) {
          const matched = (companiesRes.data || []).find((c: any) => c.companyId === user.companyId)
          if (matched) {
            setCompanyName(matched.name)
          } else if (user.role === 'Company') {
            setCompanyName(user.name)
          }
        }
      } catch (err) {
        console.error('Failed to fetch assignment data from db:', err)
      }
    }
    fetchData()
  }, [user, setValue, isEditMode, prefillClientId])

  // Fetch template fields when projectType changes
  useEffect(() => {
    const fetchFields = async () => {
      if (!watchedProjectType) {
        setTemplateFields([])
        return
      }

      const matchedCategory = findMatchingCategory(watchedProjectType, dbCategories)

      if (!matchedCategory) {
        setTemplateFields([])
        return
      }

      setLoadingFields(true)
      setFetchError(null)
      try {
        const response = await api.get<{ success: boolean; data: DBCategoryTemplateField[] }>(
          `/leads/templates?categoryId=${matchedCategory.id}`
        )
        if (response.data?.success) {
          setTemplateFields(response.data.data)
        } else {
          setTemplateFields([])
        }
      } catch (err: any) {
        console.error('Failed to fetch template fields:', err)
        setFetchError('Failed to load category-specific fields.')
        setTemplateFields([])
      } finally {
        setLoadingFields(false)
      }
    }

    fetchFields()
  }, [watchedProjectType, dbCategories])

  // Filter template fields based on project sub-type where applicable and remove duplicates
  const filteredFields = (() => {
    const seen = new Set<string>()
    return templateFields.filter((field) => {
      if (seen.has(field.fieldKey)) return false
      seen.add(field.fieldKey)
      if (watchedProjectType === 'Residential' && field.section === 'Apartments (additional)') {
        return watchedProjectSubType === 'Apartment'
      }
      return true
    })
  })()

  // ── Upload Handlers ─────────────────────────────────────────────────────────

  const processFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const allowed = [
      'image/jpeg', 'image/png', 'image/webp',
      'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]

    setIsUploadingGeneral(true)
    try {
      for (const file of Array.from(files)) {
        if (!allowed.includes(file.type)) {
          alert(`File type "${file.type}" is not supported. Please upload JPG, PNG, PDF, or DOC/DOCX files.`)
          continue
        }

        const formData = new FormData()
        formData.append('file', file)

        const response = await api.post('/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })

        if (response.data?.success) {
          const { url, name, size, type } = response.data
          setUploadedFiles((prev) => [
            ...prev,
            {
              id: `${Date.now()}-${Math.random()}`,
              name,
              size,
              type,
              preview: type.startsWith('image/') ? url : undefined,
              url,
            },
          ])
        } else {
          alert(`Failed to upload file ${file.name}: ${response.data?.message || 'Unknown error'}`)
        }
      }
    } catch (err: any) {
      console.error('Error uploading general attachment:', err)
      alert(`Error uploading file: ${err.response?.data?.message || err.message}`)
    } finally {
      setIsUploadingGeneral(false)
    }
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    processFiles(e.dataTransfer.files)
  }, [])

  const removeFile = (id: string) =>
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id))

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <FiImage size={18} className="text-blue-500" />
    if (type === 'application/pdf') return <FiFileText size={18} className="text-red-500" />
    return <FiFile size={18} className="text-indigo-500" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const renderDynamicField = (field: DBCategoryTemplateField) => {
    const errorMsg = (errors as any).categoryValues?.[field.fieldKey]?.message

    switch (field.fieldType) {
      case 'number':
        return (
          <FormField label={field.fieldName} required={field.isRequired} error={errorMsg}>
            <input
              {...register(`categoryValues.${field.fieldKey}`, {
                required: field.isRequired ? `${field.fieldName} is required` : false,
                valueAsNumber: true
              })}
              type="number"
              placeholder="0"
              className={inputCls}
            />
          </FormField>
        )
      case 'single-select':
        return (
          <FormField label={field.fieldName} required={field.isRequired} error={errorMsg}>
            <div className="relative">
              <select
                {...register(`categoryValues.${field.fieldKey}`, {
                  required: field.isRequired ? `${field.fieldName} is required` : false
                })}
                className={selectCls}
              >
                <option value="">— Select Option —</option>
                {field.fieldOptions?.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <SelectChevron />
            </div>
          </FormField>
        )
      case 'yes-no':
        return (
          <FormField label={field.fieldName} required={field.isRequired} error={errorMsg}>
            <div className="relative">
              <select
                {...register(`categoryValues.${field.fieldKey}`, {
                  required: field.isRequired ? `${field.fieldName} is required` : false
                })}
                className={selectCls}
              >
                <option value="">— Select —</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
              <SelectChevron />
            </div>
          </FormField>
        )
      case 'multi-select':
        return (
          <FormField label={field.fieldName} required={field.isRequired} error={errorMsg}>
            <div className="flex flex-wrap gap-2 mt-1">
              {field.fieldOptions?.map((opt) => (
                <label
                  key={opt}
                  className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs cursor-pointer select-none text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
                >
                  <input
                    type="checkbox"
                    value={opt}
                    {...register(`categoryValues.${field.fieldKey}`, {
                      required: field.isRequired ? `${field.fieldName} is required` : false
                    })}
                    className="rounded border-slate-300 dark:border-slate-700 text-[#33a18a] focus:ring-[#33a18a]"
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </FormField>
        )
      case 'attachment': {
        const fieldKey = `categoryValues.${field.fieldKey}`
        const fileUrl = watch(fieldKey as any)
        const isUploading = uploadingFields[field.fieldKey]

        const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
          const files = e.target.files
          if (!files || files.length === 0) return
          const selectedFile = files[0]

          const allowed = [
            'image/jpeg', 'image/png', 'image/webp',
            'application/pdf', 'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          ]
          if (!allowed.includes(selectedFile.type)) {
            alert(`File type "${selectedFile.type}" is not supported. Please upload JPG, PNG, PDF, or DOC/DOCX.`)
            return
          }

          setUploadingFields((prev) => ({ ...prev, [field.fieldKey]: true }))
          try {
            const formData = new FormData()
            formData.append('file', selectedFile)

            const response = await api.post('/upload', formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            })

            if (response.data?.success) {
              setValue(fieldKey as any, response.data.url)
            } else {
              alert(`Failed to upload file: ${response.data?.message || 'Unknown error'}`)
            }
          } catch (err: any) {
            console.error('Error uploading field attachment:', err)
            alert(`Error uploading file: ${err.response?.data?.message || err.message}`)
          } finally {
            setUploadingFields((prev) => ({ ...prev, [field.fieldKey]: false }))
          }
        }

        const handleClearFile = () => {
          setValue(fieldKey as any, '')
        }

        const getFileNameFromUrl = (url: string) => {
          if (!url) return ''
          try {
            if (url.startsWith('data:')) return 'Uploaded File'
            const parts = url.split('/')
            const rawName = parts[parts.length - 1]
            return rawName.includes('-') && !isNaN(Number(rawName.split('-')[0]))
              ? rawName.split('-').slice(1).join('-')
              : rawName
          } catch {
            return 'Uploaded File'
          }
        }

        return (
          <FormField label={field.fieldName} required={field.isRequired} error={errorMsg}>
            <div className="relative flex flex-col gap-2 mt-1">
              {fileUrl ? (
                <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 group">
                  <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                    {fileUrl.match(/\.(jpg|jpeg|png|webp)/i) || fileUrl.includes('image') ? (
                      <img src={fileUrl} alt="Preview" className="w-10 h-10 rounded-lg object-cover" />
                    ) : fileUrl.endsWith('.pdf') ? (
                      <FiFileText size={18} className="text-red-500" />
                    ) : (
                      <FiFile size={18} className="text-[#33a18a]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
                      {getFileNameFromUrl(fileUrl)}
                    </p>
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-[#33a18a] hover:underline font-semibold flex items-center gap-1 mt-0.5"
                    >
                      View Document
                    </a>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearFile}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all cursor-pointer shrink-0"
                  >
                    <FiX size={14} />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx"
                    disabled={isUploading}
                    onChange={handleFileChange}
                    className="hidden"
                    id={`file-input-${field.fieldKey}`}
                  />
                  <label
                    htmlFor={`file-input-${field.fieldKey}`}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed text-xs font-bold transition-all cursor-pointer select-none bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 ${isUploading
                      ? 'border-[#33a18a] text-[#33a18a] animate-pulse pointer-events-none'
                      : 'border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-[#33a18a]/50 hover:text-[#33a18a]'
                      }`}
                  >
                    {isUploading ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-[#33a18a]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Uploading file...</span>
                      </>
                    ) : (
                      <>
                        <FiUploadCloud size={15} />
                        <span>Upload document ({field.fieldName})</span>
                      </>
                    )}
                  </label>
                  <input
                    type="hidden"
                    {...register(fieldKey as any, {
                      required: field.isRequired ? `${field.fieldName} is required` : false
                    })}
                  />
                </div>
              )}
            </div>
          </FormField>
        )
      }
      case 'text':
      default: {
        const hasOptions = field.fieldOptions && field.fieldOptions.length > 0
        // const exampleHint = hasOptions ? `Examples: ${field.fieldOptions!.join(', ')}` : undefined
        return (
          <FormField label={field.fieldName} required={field.isRequired} error={errorMsg} >
            <input
              {...register(`categoryValues.${field.fieldKey}`, {
                required: field.isRequired ? `${field.fieldName} is required` : false
              })}
              type="text"
              placeholder={
                hasOptions
                  ? `e.g. ${field.fieldOptions!.join(', ')}`
                  : field.fieldName.includes('(')
                    ? `Enter ${field.fieldName}`
                    : `Enter ${field.fieldName.toLowerCase()}`
              }
              className={inputCls}
            />
          </FormField>
        )
      }
    }
  }

  // ── Submit Handlers ─────────────────────────────────────────────────────────

  const onSubmit = async (data: LeadFormData) => {
    try {
      const matchedCategory = findMatchingCategory(data.projectType, dbCategories)

      if (!matchedCategory) {
        alert('Invalid Project Type selected (could not map to database category).')
        return
      }

      // Map category build type
      let buildType = 'new build'
      if (data.category === 'Renovation') buildType = 'renovation'
      if (data.category === 'Extension') buildType = 'extension'

      const payload = {
        // Core required fields
        categoryId: matchedCategory.id,
        clientName: data.clientName,
        status: data.status || 'Lead',
        categoryValues: data.categoryValues || {},
        attachments: uploadedFiles,

        // Legacy composite fields (kept for backward compat — populated from individual columns)
        projectName: data.leadTitle,
        organisation: data.company || '',
        leadSource: data.leadSource || '',
        subType: data.projectSubType || '',
        buildType,
        locationAddress: data.siteAddress || '',
        siteExtent: data.siteArea ? `${data.siteArea} ${data.unit || 'Sq.ft'}`.trim() : '',
        expectedBuiltUpArea: data.siteArea ? `${data.siteArea} ${data.unit || 'Sq.ft'}`.trim() : '',
        budgetRange: data.estimatedBudget ? `₹${data.estimatedBudget}` : '',
        timelineExpectation: [data.expectedStartDate, data.expectedCompletionDate].filter(Boolean).join(' to '),
        servicesRequired: selectedServices,
        remarks: data.remarks || '',

        // ── Individual DB columns ──────────────────────────────────────
        // Lead / Client identification
        clientId: data.clientId || selectedClientId || null,
        leadTitle: data.leadTitle || '',
        company: data.company || '',
        contactPerson: data.contactPerson || '',
        mobile: data.mobile || '',
        email: data.email || '',

        // Project classification
        projectType: data.projectType || '',
        projectSubType: data.projectSubType || '',
        leadCategory: data.category || '',

        // Site location
        siteAddress: data.siteAddress || '',
        city: data.city || '',
        state: data.state || '',
        country: data.country || '',
        surveyNumber: data.surveyNumber || '',
        siteArea: data.siteArea || '',
        unit: data.unit || '',

        // Budget & timeline
        estimatedBudget: data.estimatedBudget || '',
        expectedStartDate: data.expectedStartDate || '',
        expectedCompletionDate: data.expectedCompletionDate || '',

        // Assignment
        assignedEmployee: data.assignedEmployee || '',
        branch: data.branch || '',
        branchId: data.branchId || null,

        // ── Extended CRM fields ────────────────────────────────────────
        decisionMakers: data.decisionMakers || '',
        priorProjectsWithSSA: data.priorProjectsWithSSA || '',
        landOwnershipDocsAvailable: data.landOwnershipDocsAvailable || '',
        topographyLevels: data.topographyLevels || '',
        accessRoadWidth: data.accessRoadWidth || '',
        orientation: data.orientation || '',
        existingStructures: data.existingStructures || '',
        soilReportAvailable: data.soilReportAvailable || '',
        adjacentDevelopments: data.adjacentDevelopments || '',
        ebSupplySanctionedLoad: data.ebSupplySanctionedLoad || '',
        waterSource: data.waterSource || '',
        sewerSeptic: data.sewerSeptic || '',
        stormDrainage: data.stormDrainage || '',
        telecom: data.telecom || '',
        approvingAuthority: data.approvingAuthority || '',
        landUseZoning: data.landUseZoning || '',
        fsiCoverageKnown: data.fsiCoverageKnown || '',
        setbacksHeightRestrictions: data.setbacksHeightRestrictions || '',
        priorApprovalsViolations: data.priorApprovalsViolations || '',
        specialRestrictions: data.specialRestrictions || '',
        expectedFloors: data.expectedFloors || '',
        fundingSource: data.fundingSource || '',
        phasingNeeds: data.phasingNeeds || '',
        contractorStatus: data.contractorStatus || '',
        preferredVendors: data.preferredVendors || '',
        siteVisitFrequencyExpectation: data.siteVisitFrequencyExpectation || '',
        reportingExpectations: data.reportingExpectations || '',
        styleReferencesInspiration: data.styleReferencesInspiration || '',
        sustainabilityGoals: data.sustainabilityGoals || '',
        vaastuOrientationRequirements: data.vaastuOrientationRequirements || '',
        materialPreferences: data.materialPreferences || '',
      }

      console.log('Submitting Lead Payload to backend:', payload)
      const response = isEditMode
        ? await api.put(`/leads/${id}`, payload)
        : await api.post('/leads', payload)

      if (response.data?.success) {
        alert(isEditMode ? 'Lead updated successfully in the database!' : 'Lead created successfully in the database!')
        navigate('/crm/leads')
      } else {
        alert(`Failed to ${isEditMode ? 'update' : 'create'} lead: ${response.data?.message || 'Unknown error'}`)
      }
    } catch (err: any) {
      console.error('Error submitting lead:', err)
      const errorMsg = err.response?.data?.message || err.message || 'Server error'
      alert(`Error: ${errorMsg}`)
    }
  }

  const handleSaveDraft = async () => {
    const values = getValues()
    if (!values.clientName) {
      alert('Please enter a Client Name to save draft.')
      return
    }
    if (!values.projectType) {
      alert('Please select a Project Type to save draft.')
      return
    }

    try {
      const matchedCategory = findMatchingCategory(values.projectType, dbCategories)

      if (!matchedCategory) {
        alert('Invalid Project Type selected (could not map to database category).')
        return
      }

      // Map category build type
      let buildType = 'new build'
      if (values.category === 'Renovation') buildType = 'renovation'
      if (values.category === 'Extension') buildType = 'extension'

      const payload = {
        // Core required fields
        categoryId: matchedCategory.id,
        clientName: values.clientName,
        status: 'Draft',
        categoryValues: values.categoryValues || {},
        attachments: uploadedFiles,

        // Legacy composite fields (kept for backward compat — populated from individual columns)
        projectName: values.leadTitle || '',
        organisation: values.company || '',
        leadSource: values.leadSource || '',
        subType: values.projectSubType || '',
        buildType,
        locationAddress: values.siteAddress || '',
        siteExtent: values.siteArea ? `${values.siteArea} ${values.unit || 'Sq.ft'}`.trim() : '',
        expectedBuiltUpArea: values.siteArea ? `${values.siteArea} ${values.unit || 'Sq.ft'}`.trim() : '',
        budgetRange: values.estimatedBudget ? `₹${values.estimatedBudget}` : '',
        timelineExpectation: [values.expectedStartDate, values.expectedCompletionDate].filter(Boolean).join(' to '),
        servicesRequired: selectedServices,
        remarks: values.remarks || '',

        // ── Individual DB columns ──────────────────────────────────────
        // Lead / Client identification
        clientId: values.clientId || selectedClientId || null,
        leadTitle: values.leadTitle || '',
        company: values.company || '',
        contactPerson: values.contactPerson || '',
        mobile: values.mobile || '',
        email: values.email || '',

        // Project classification
        projectType: values.projectType || '',
        projectSubType: values.projectSubType || '',
        leadCategory: values.category || '',

        // Site location
        siteAddress: values.siteAddress || '',
        city: values.city || '',
        state: values.state || '',
        country: values.country || '',
        surveyNumber: values.surveyNumber || '',
        siteArea: values.siteArea || '',
        unit: values.unit || '',

        // Budget & timeline
        estimatedBudget: values.estimatedBudget || '',
        expectedStartDate: values.expectedStartDate || '',
        expectedCompletionDate: values.expectedCompletionDate || '',

        // Assignment
        assignedEmployee: values.assignedEmployee || '',
        branch: values.branch || '',
        branchId: values.branchId || null,

        // ── Extended CRM fields ────────────────────────────────────────
        decisionMakers: values.decisionMakers || '',
        priorProjectsWithSSA: values.priorProjectsWithSSA || '',
        landOwnershipDocsAvailable: values.landOwnershipDocsAvailable || '',
        topographyLevels: values.topographyLevels || '',
        accessRoadWidth: values.accessRoadWidth || '',
        orientation: values.orientation || '',
        existingStructures: values.existingStructures || '',
        soilReportAvailable: values.soilReportAvailable || '',
        adjacentDevelopments: values.adjacentDevelopments || '',
        ebSupplySanctionedLoad: values.ebSupplySanctionedLoad || '',
        waterSource: values.waterSource || '',
        sewerSeptic: values.sewerSeptic || '',
        stormDrainage: values.stormDrainage || '',
        telecom: values.telecom || '',
        approvingAuthority: values.approvingAuthority || '',
        landUseZoning: values.landUseZoning || '',
        fsiCoverageKnown: values.fsiCoverageKnown || '',
        setbacksHeightRestrictions: values.setbacksHeightRestrictions || '',
        priorApprovalsViolations: values.priorApprovalsViolations || '',
        specialRestrictions: values.specialRestrictions || '',
        expectedFloors: values.expectedFloors || '',
        fundingSource: values.fundingSource || '',
        phasingNeeds: values.phasingNeeds || '',
        contractorStatus: values.contractorStatus || '',
        preferredVendors: values.preferredVendors || '',
        siteVisitFrequencyExpectation: values.siteVisitFrequencyExpectation || '',
        reportingExpectations: values.reportingExpectations || '',
        styleReferencesInspiration: values.styleReferencesInspiration || '',
        sustainabilityGoals: values.sustainabilityGoals || '',
        vaastuOrientationRequirements: values.vaastuOrientationRequirements || '',
        materialPreferences: values.materialPreferences || '',
      }

      console.log('Submitting Lead Draft Payload to backend:', payload)
      const response = isEditMode
        ? await api.put(`/leads/${id}`, payload)
        : await api.post('/leads', payload)

      if (response.data?.success) {
        alert('Draft saved successfully!')
        navigate('/crm/leads')
      } else {
        alert(`Failed to save draft: ${response.data?.message || 'Unknown error'}`)
      }
    } catch (err: any) {
      console.error('Error saving draft:', err)
      const errorMsg = err.response?.data?.message || err.message || 'Server error'
      alert(`Error saving draft: ${errorMsg}`)
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  if (loadingExistingLead) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#33a18a]/30 border-t-[#33a18a] rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Loading lead details for modification...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in text-slate-800 dark:text-slate-100 pb-8">

      {/* ── Page Header / Breadcrumb ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight sm:text-3xl">
              {isEditMode ? 'Modify Lead' : 'Lead Creation'}
            </h1>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-xs font-semibold">
              {leadId}
            </span>
          </div>
        </div>

        {/* Action Buttons Top */}
        <div className="flex items-center gap-2">
          {/* <button
            type="submit"
            form="lead-create-form"
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-extrabold text-white shadow-md transition-all duration-200 hover:opacity-95 active:scale-95 cursor-pointer disabled:opacity-60"
            style={{ background: `linear-gradient(135deg, ${PRIMARY_COLOR} 0%, #288571 100%)` }}
          >
            {isEditMode ? <FiCheckCircle size={14} /> : <FiPlusCircle size={14} />}
            <span>{isSubmitting ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Lead' : 'Create Lead')}</span>
          </button> */}
        </div>
      </div>

      {/* ── Main Form Grid ─────────────────────────────────────────────────── */}
      <form id="lead-create-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          {/* ══════════════════════════════════════════════════════════════
              SECTION 1: Lead Information
          ══════════════════════════════════════════════════════════════ */}
          <SectionCard title="Lead Information" icon={<FiUser size={15} />} delay={0}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* ── Client Selection & Association ── */}
              <div className="sm:col-span-2">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <label className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                        <FiUsers className="text-[#33a18a]" size={15} /> Associated Client Profile <span className="text-[#33a18a]">*</span>
                      </label>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Choose a registered client from the directory or register a new client via popup.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={openNewClientModal}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#33a18a] hover:bg-[#2a8774] text-white text-xs font-bold shadow-xs transition-all cursor-pointer self-start sm:self-auto"
                    >
                      <FiPlusCircle size={14} /> New Client
                    </button>
                  </div>

                  <div className="relative flex items-center">
                    <select
                      value={selectedClientId}
                      onChange={(e) => {
                        const val = e.target.value
                        if (val === '__NEW__') {
                          openNewClientModal()
                        } else {
                          handleSelectClient(val)
                        }
                      }}
                      className={`${selectCls} font-semibold ${selectedClientId ? 'pr-20' : ''}`}
                    >
                      <option value="">-- Select Registered Client Profile --</option>
                      <option value="__NEW__" className="font-bold text-[#33a18a]">
                        + Register New Client
                      </option>
                      {clientsList.length > 0 && (
                        <optgroup label="── Registered Clients ──">
                          {clientsList.map((c: any) => (
                            <option key={c.id} value={c.id}>
                              {c.clientCode ? `[${c.clientCode}] ` : ''}{c.clientName || c.company} {c.company && c.company !== c.clientName ? `(${c.company})` : ''} {c.city ? `• ${c.city}` : ''}
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>

                    {selectedClientId && (
                      <button
                        type="button"
                        onClick={() => handleSelectClient('')}
                        className="absolute right-9 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-400 hover:text-red-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer flex items-center gap-1"
                        title="Clear selected client"
                      >
                        <FiX size={12} /> Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Lead ID */}
              <FormField label="Lead ID" hint="Auto-generated, read-only">
                <input
                  readOnly
                  value={leadId}
                  className={`${inputCls} bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 cursor-not-allowed font-mono text-xs`}
                />
              </FormField>

              {/* Lead Title */}
              <FormField label="Lead Title / Project Name" required error={errors.leadTitle?.message}>
                <input
                  maxLength={150}
                  {...register('leadTitle', {
                    required: 'Lead title is required',
                    pattern: {
                      value: /^[a-zA-Z0-9]+[a-zA-Z0-9\s.'&()_-]*$/,
                      message: 'Title must start with an alphanumeric character and contain valid text'
                    },
                    onChange: (e) => {
                      const val = e.target.value.replace(/[^a-zA-Z0-9\s.'&()_-]/g, '')
                      e.target.value = val
                      setValue('leadTitle', val, { shouldValidate: true })
                    }
                  })}
                  placeholder="e.g. 3BHK Residential Project"
                  className={inputCls}
                />
              </FormField>

              {/* Client Name */}
              <FormField label="Client Name" required error={errors.clientName?.message}>
                <input
                  maxLength={50}
                  {...register('clientName', {
                    required: 'Client name is required',
                    pattern: {
                      value: /^[a-zA-Z]+[a-zA-Z\s.'-]*$/,
                      message: 'Name must start with a letter and contain only alphabets/spaces/dots'
                    },
                    onChange: (e) => {
                      const val = e.target.value.replace(/[^a-zA-Z\s.'-]/g, '')
                      e.target.value = val
                      setValue('clientName', val, { shouldValidate: true })
                    }
                  })}
                  placeholder="Full name"
                  className={inputCls}
                />
              </FormField>

              {/* Company */}
              <FormField label="Company / Organization" error={errors.company?.message}>
                <input
                  maxLength={100}
                  {...register('company', {
                    pattern: {
                      value: /^[a-zA-Z0-9]+[a-zA-Z0-9\s.'&()_-]*$/,
                      message: 'Company name must start with an alphanumeric character'
                    },
                    onChange: (e) => {
                      const val = e.target.value.replace(/[^a-zA-Z0-9\s.'&()_-]/g, '')
                      e.target.value = val
                      setValue('company', val, { shouldValidate: true })
                    }
                  })}
                  placeholder="Company or organization"
                  className={inputCls}
                />
              </FormField>

              {/* Contact Person */}
              <FormField label="Contact Person" error={errors.contactPerson?.message}>
                <div className="relative">
                  <FiUser size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    maxLength={50}
                    {...register('contactPerson', {
                      pattern: {
                        value: /^[a-zA-Z]+[a-zA-Z\s.'-]*$/,
                        message: 'Contact name must start with a letter and contain only alphabets/spaces/dots'
                      },
                      onChange: (e) => {
                        const val = e.target.value.replace(/[^a-zA-Z\s.'-]/g, '')
                        e.target.value = val
                        setValue('contactPerson', val, { shouldValidate: true })
                      }
                    })}
                    placeholder="Primary contact name"
                    className={`${inputCls} pl-9`}
                  />
                </div>
              </FormField>

              {/* Mobile */}
              <FormField label="Mobile Number" required error={errors.mobile?.message}>
                <div className="relative">
                  <FiPhone size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="tel"
                    {...register('mobile', {
                      required: 'Mobile number is required',
                      pattern: {
                        value: /^[6-9]\d{9}$/,
                        message: 'Enter a valid 10-digit mobile number',
                      },
                      onChange: (e) => {
                        const val = e.target.value.replace(/\D/g, '')
                        e.target.value = val
                        setValue('mobile', val, { shouldValidate: true })
                      }
                    })}
                    placeholder="98XXXXXXXX"
                    maxLength={10}
                    className={`${inputCls} pl-9`}
                  />
                </div>
              </FormField>

              {/* Email */}
              <div className="sm:col-span-2">
                <FormField label="Email Address" required error={errors.email?.message}>
                  <div className="relative">
                    <FiMail size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: 'Enter a valid email address',
                        },
                      })}
                      type="email"
                      readOnly={isEditMode}
                      placeholder="client@example.com"
                      className={`${inputCls} pl-9 ${isEditMode ? 'opacity-65 cursor-not-allowed bg-slate-100 dark:bg-slate-800' : ''}`}
                    />
                  </div>
                </FormField>
              </div>

              {/* Decision Makers */}
              <FormField label="Decision Makers" error={errors.decisionMakers?.message}>
                <input
                  {...register('decisionMakers')}
                  placeholder="e.g. Board, Managing Director, Owner"
                  className={inputCls}
                />
              </FormField>

              {/* Prior Projects with SSA */}
              <FormField label="Prior Projects with SSA" error={errors.priorProjectsWithSSA?.message}>
                <div className="relative">
                  <select
                    {...register('priorProjectsWithSSA')}
                    className={selectCls}
                  >
                    <option value="No">No</option>
                    <option value="Yes - Active">Yes - Active</option>
                    <option value="Yes - Completed">Yes - Completed</option>
                  </select>
                  <SelectChevron />
                </div>
              </FormField>
            </div>
          </SectionCard>


          {/* ══════════════════════════════════════════════════════════════
              SECTION 3: Project Details
          ══════════════════════════════════════════════════════════════ */}
          <SectionCard title="Project Details" icon={<MdOutlineArchitecture size={16} />} delay={0.1}>
            {(user?.role === 'Company' || user?.role === 'Super Admin') && (
              <div className="flex justify-end mb-3">
                <button
                  type="button"
                  onClick={() => setIsManageModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[#33a18a] text-xs font-bold transition-all cursor-pointer shadow-xs border border-slate-200 dark:border-slate-700"
                >
                  <FiPlusCircle className="w-3.5 h-3.5" />
                  Manage Categories & Questions
                </button>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Project Type */}
              <FormField label="Project Type" required error={errors.projectType?.message}>
                <div className="relative">
                  <select
                    {...register('projectType', { required: 'Project type is required' })}
                    className={selectCls}
                  >
                    <option value="">— Select Project Type —</option>
                    {Array.from(
                      new Set([
                        ...Object.keys(PROJECT_SUB_TYPES),
                        ...dbCategories.map((c) => c.name.split('—')[0].trim())
                      ])
                    ).map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <SelectChevron />
                </div>
              </FormField>

              {/* Dynamic Project Sub Type */}
              <FormField label="Project Sub Type" error={errors.projectSubType?.message}>
                <div className="relative">
                  <select
                    {...register('projectSubType')}
                    disabled={subTypes.length === 0}
                    className={`${selectCls} ${subTypes.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <option value="">
                      {subTypes.length === 0 ? '— Select type first —' : '— Select Sub Type —'}
                    </option>
                    {subTypes.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <SelectChevron />
                </div>
                <AnimatePresence>
                  {watchedProjectType && (
                    <motion.p
                      key="sub-hint"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-1 text-xs flex items-center gap-1 font-medium text-[#33a18a] dark:text-[#C59D5F]"
                    >
                      <FiInfo size={11} />
                      Sub-types for: <strong>{watchedProjectType}</strong>
                    </motion.p>
                  )}
                </AnimatePresence>
              </FormField>

              {/* Category */}
              <div className="sm:col-span-2">
                <FormField label="Category" required error={errors.category?.message}>
                  <div className="grid grid-cols-3 gap-2">
                    {['New Construction', 'Renovation', 'Extension'].map((cat) => (
                      <Controller
                        key={cat}
                        name="category"
                        control={control}
                        rules={{ required: 'Category is required' }}
                        render={({ field }) => (
                          <button
                            type="button"
                            onClick={() => field.onChange(cat)}
                            className={`px-3 py-2.5 rounded-xl border-2 text-xs font-bold text-center transition-all duration-200 cursor-pointer ${field.value === cat
                              ? 'border-[#33a18a] bg-[#33a18a]/10 text-[#33a18a] dark:text-[#C59D5F]'
                              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                              }`}
                          >
                            {cat}
                          </button>
                        )}
                      />
                    ))}
                  </div>
                </FormField>
              </div>
            </div>
          </SectionCard>

          {/* ══════════════════════════════════════════════════════════════
              SECTION 3.5: Dynamic Category Requirements
          ══════════════════════════════════════════════════════════════ */}
          {watchedProjectType && (templateFields.length > 0 || loadingFields) && (
            <div className="xl:col-span-2">
              <SectionCard title={`${watchedProjectType} Requirements`} icon={<FiCheckSquare size={15} />} delay={0.12}>
                {loadingFields ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin w-6 h-6 rounded-full border-2 border-[#33a18a] border-t-transparent" />
                    <span className="ml-2 text-xs font-semibold text-slate-500">Loading requirements...</span>
                  </div>
                ) : fetchError ? (
                  <div className="text-xs text-red-500 flex items-center gap-1.5 py-4">
                    <FiAlertCircle size={13} />
                    {fetchError}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(
                      filteredFields.reduce<Record<string, DBCategoryTemplateField[]>>((acc, f) => {
                        const sec = f.section || 'General Details'
                        if (!acc[sec]) acc[sec] = []
                        acc[sec].push(f)
                        return acc
                      }, {})
                    ).map(([sectionName, fields]) => (
                      <div key={sectionName} className="space-y-3 pt-4 first:pt-0 border-t first:border-t-0 border-slate-100 dark:border-slate-800">
                        <h4 className="text-[10px] font-bold text-[#33a18a] dark:text-[#C59D5F] uppercase tracking-wider">
                          {sectionName}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {fields.map((field) => (
                            <div key={field.id} className={field.fieldType === 'multi-select' || field.fieldType === 'attachment' ? 'sm:col-span-2' : ''}>
                              {renderDynamicField(field)}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              SECTION 2: Lead Source
          ══════════════════════════════════════════════════════════════ */}
          <div className="xl:col-span-2">
            <SectionCard title="Lead Source" icon={<MdOutlineSource size={16} />} delay={0.05}>
              <input
                type="hidden"
                {...register('leadSource', { required: 'Please select a lead source' })}
              />

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
                  Select Lead Source
                  <span className="text-red-500 font-bold">*</span>
                </label>

                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mt-1">
                  {LEAD_SOURCES.map(({ label, icon }) => {
                    const isSelected = watchedLeadSource === label
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setValue('leadSource', label, { shouldValidate: true })}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-xs font-semibold transition-all duration-200 cursor-pointer ${isSelected
                          ? 'border-[#33a18a] bg-[#33a18a]/10 text-[#33a18a] dark:text-[#C59D5F] shadow-xs scale-[1.02]'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                          }`}
                      >
                        <span className="text-xl leading-none">{icon}</span>
                        <span className="text-center leading-tight">{label}</span>
                      </button>
                    )
                  })}
                </div>

                <AnimatePresence>
                  {errors.leadSource?.message && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="text-xs text-red-500 flex items-center gap-1 mt-1.5 font-medium"
                    >
                      <FiAlertCircle size={11} />
                      {errors.leadSource.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </SectionCard>
          </div>


          {/* ══════════════════════════════════════════════════════════════
              SECTION 4: Site Details
          ══════════════════════════════════════════════════════════════ */}
          <SectionCard title="Site Details" icon={<FiMapPin size={15} />} delay={0.15}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <FormField label="Site Address" error={errors.siteAddress?.message}>
                  <div className="relative">
                    <FiMapPin size={13} className="absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
                    <input
                      {...register('siteAddress')}
                      placeholder="Full site / plot address"
                      className={`${inputCls} pl-9`}
                    />
                  </div>
                </FormField>
              </div>

              <FormField label="City" error={errors.city?.message}>
                <input {...register('city')} placeholder="City" className={inputCls} />
              </FormField>

              <FormField label="State" error={errors.state?.message}>
                <input {...register('state')} placeholder="State" className={inputCls} />
              </FormField>

              <FormField label="Country" error={errors.country?.message}>
                <input {...register('country')} placeholder="Country" className={inputCls} />
              </FormField>

              <FormField label="Survey Number" error={errors.surveyNumber?.message}>
                <input {...register('surveyNumber')} placeholder="Survey / Plot No." className={inputCls} />
              </FormField>

              <div className="sm:col-span-2 grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <FormField label="Site Area" error={errors.siteArea?.message}>
                    <input
                      {...register('siteArea')}
                      type="number"
                      min="0"
                      placeholder="0"
                      className={inputCls}
                    />
                  </FormField>
                </div>
                <FormField label="Unit">
                  <div className="relative">
                    <select {...register('unit')} className={selectCls}>
                      <option value="Sq.ft">Sq.ft</option>
                      <option value="Ground">Ground</option>
                      <option value="Acre">Acre</option>
                    </select>
                    <SelectChevron />
                  </div>
                </FormField>
              </div>

              {/* Land Ownership Docs Available */}
              <FormField label="Land Ownership Docs" error={errors.landOwnershipDocsAvailable?.message}>
                <div className="relative">
                  <select {...register('landOwnershipDocsAvailable')} className={selectCls}>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                    <option value="Under Verification">Under Verification</option>
                  </select>
                  <SelectChevron />
                </div>
              </FormField>

              {/* Topography Levels */}
              <FormField label="Topography / Levels" error={errors.topographyLevels?.message}>
                <input {...register('topographyLevels')} placeholder="e.g. Flat, Sloped, 1m contour" className={inputCls} />
              </FormField>

              {/* Access Road Width */}
              <FormField label="Access Road Width" error={errors.accessRoadWidth?.message}>
                <input {...register('accessRoadWidth')} placeholder="e.g. 30 ft, 12m" className={inputCls} />
              </FormField>

              {/* Orientation */}
              <FormField label="Orientation" error={errors.orientation?.message}>
                <input {...register('orientation')} placeholder="e.g. North-East, East facing" className={inputCls} />
              </FormField>

              {/* Existing Structures */}
              <FormField label="Existing Structures" error={errors.existingStructures?.message}>
                <div className="relative">
                  <select {...register('existingStructures')} className={selectCls}>
                    <option value="None">None</option>
                    <option value="To be demolished">To be demolished</option>
                    <option value="To be retained">To be retained</option>
                    <option value="Partial demolition">Partial demolition</option>
                  </select>
                  <SelectChevron />
                </div>
              </FormField>

              {/* Soil Report Available */}
              <FormField label="Soil Report Available" error={errors.soilReportAvailable?.message}>
                <div className="relative">
                  <select {...register('soilReportAvailable')} className={selectCls}>
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                    <option value="In progress">In progress</option>
                  </select>
                  <SelectChevron />
                </div>
              </FormField>

              {/* Adjacent Developments */}
              <div className="sm:col-span-2">
                <FormField label="Adjacent Developments" error={errors.adjacentDevelopments?.message}>
                  <input {...register('adjacentDevelopments')} placeholder="e.g. Public park on East, residential apartments on North" className={inputCls} />
                </FormField>
              </div>
            </div>
          </SectionCard>

          {/* ══════════════════════════════════════════════════════════════
              SECTION 4.1: Site Utilities
          ══════════════════════════════════════════════════════════════ */}
          <SectionCard title="Site Utilities" icon={<FiMapPin size={15} />} delay={0.16}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="EB Sanctioned Load" error={errors.ebSupplySanctionedLoad?.message}>
                <input {...register('ebSupplySanctionedLoad')} placeholder="e.g. 15 kW, 3 Phase" className={inputCls} />
              </FormField>

              <FormField label="Water Source" error={errors.waterSource?.message}>
                <div className="relative">
                  <select {...register('waterSource')} className={selectCls}>
                    <option value="Metro Water">Metro Water</option>
                    <option value="Borewell">Borewell</option>
                    <option value="Water Tanker">Water Tanker</option>
                    <option value="Combined">Combined</option>
                  </select>
                  <SelectChevron />
                </div>
              </FormField>

              <FormField label="Sewerage / Septic" error={errors.sewerSeptic?.message}>
                <div className="relative">
                  <select {...register('sewerSeptic')} className={selectCls}>
                    <option value="Public Sewer line">Public Sewer line</option>
                    <option value="Septic Tank">Septic Tank</option>
                    <option value="STP Required">STP Required</option>
                  </select>
                  <SelectChevron />
                </div>
              </FormField>

              <FormField label="Storm Water Drainage" error={errors.stormDrainage?.message}>
                <div className="relative">
                  <select {...register('stormDrainage')} className={selectCls}>
                    <option value="Available / Connected">Available / Connected</option>
                    <option value="Not Available">Not Available</option>
                    <option value="To be constructed">To be constructed</option>
                  </select>
                  <SelectChevron />
                </div>
              </FormField>

              <div className="sm:col-span-2">
                <FormField label="Telecom / Connectivity" error={errors.telecom?.message}>
                  <input {...register('telecom')} placeholder="e.g. Fiber line active, landline connectivity" className={inputCls} />
                </FormField>
              </div>
            </div>
          </SectionCard>

          {/* ══════════════════════════════════════════════════════════════
              SECTION 4.2: Regulatory Context
          ══════════════════════════════════════════════════════════════ */}
          <SectionCard title="Regulatory Context" icon={<FiMapPin size={15} />} delay={0.17}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Approving Authority" error={errors.approvingAuthority?.message}>
                <input {...register('approvingAuthority')} placeholder="e.g. CMDA, DTCP, Corporation" className={inputCls} />
              </FormField>

              <FormField label="Land Use Zoning" error={errors.landUseZoning?.message}>
                <input {...register('landUseZoning')} placeholder="e.g. Residential, Commercial, Mixed-Use" className={inputCls} />
              </FormField>

              <FormField label="FSI & Coverage Details" error={errors.fsiCoverageKnown?.message}>
                <input {...register('fsiCoverageKnown')} placeholder="e.g. FSI 1.5, Max Coverage 65%" className={inputCls} />
              </FormField>

              <FormField label="Setbacks / Height Restrictions" error={errors.setbacksHeightRestrictions?.message}>
                <input {...register('setbacksHeightRestrictions')} placeholder="e.g. Setback Front 3m, Side 2m" className={inputCls} />
              </FormField>

              <FormField label="Prior Approvals / Violations" error={errors.priorApprovalsViolations?.message}>
                <input {...register('priorApprovalsViolations')} placeholder="Any details of existing approvals or violations" className={inputCls} />
              </FormField>

              <FormField label="Special Restrictions" error={errors.specialRestrictions?.message}>
                <input {...register('specialRestrictions')} placeholder="e.g. Heritage zone, CRZ, Airport funnel zone" className={inputCls} />
              </FormField>
            </div>
          </SectionCard>

          {/* ══════════════════════════════════════════════════════════════
              SECTION 5: Budget & Timeline
          ══════════════════════════════════════════════════════════════ */}
          <SectionCard title="Budget & Timeline" icon={<FiDollarSign size={15} />} delay={0.2}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <FormField label="Estimated Budget (₹)" required error={errors.estimatedBudget?.message}>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm pointer-events-none select-none">
                      ₹
                    </span>
                    <input
                      {...register('estimatedBudget', { required: 'Budget estimate is required' })}
                      type="number"
                      min="0"
                      placeholder="0.00"
                      className={`${inputCls} pl-8`}
                    />
                  </div>
                </FormField>
              </div>

              <FormField label="Expected Start Date" required error={errors.expectedStartDate?.message}>
                <div className="relative">
                  <FiCalendar size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    {...register('expectedStartDate', { required: 'Start date is required' })}
                    type="date"
                    className={`${inputCls} pl-9`}
                  />
                </div>
              </FormField>

              <FormField label="Expected Completion Date" required error={errors.expectedCompletionDate?.message}>
                <div className="relative">
                  <FiCalendar size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    {...register('expectedCompletionDate', { required: 'Completion date is required' })}
                    type="date"
                    className={`${inputCls} pl-9`}
                  />
                </div>
              </FormField>

              {/* Expected Floors */}
              <FormField label="Expected Floors" error={errors.expectedFloors?.message}>
                <input
                  {...register('expectedFloors')}
                  placeholder="e.g. G + 2 Floors"
                  className={inputCls}
                />
              </FormField>

              {/* Funding Source */}
              <FormField label="Funding Source" error={errors.fundingSource?.message}>
                <div className="relative">
                  <select {...register('fundingSource')} className={selectCls}>
                    <option value="Self Funded">Self Funded</option>
                    <option value="Bank Loan / Construction Finance">Bank Loan / Construction Finance</option>
                    <option value="Private Investor">Private Investor</option>
                  </select>
                  <SelectChevron />
                </div>
              </FormField>

              {/* Phasing Needs */}
              <div className="sm:col-span-2">
                <FormField label="Phasing Needs" error={errors.phasingNeeds?.message}>
                  <div className="relative">
                    <select {...register('phasingNeeds')} className={selectCls}>
                      <option value="Single Phase">Single Phase</option>
                      <option value="Multi-Phase Development">Multi-Phase Development</option>
                      <option value="Core & Shell first">Core & Shell first</option>
                    </select>
                    <SelectChevron />
                  </div>
                </FormField>
              </div>
            </div>
          </SectionCard>

          {/* ══════════════════════════════════════════════════════════════
              SECTION 5.1: Execution Context
          ══════════════════════════════════════════════════════════════ */}
          <SectionCard title="Execution Context" icon={<FiCheckSquare size={15} />} delay={0.22}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Contractor Status" error={errors.contractorStatus?.message}>
                <div className="relative">
                  <select {...register('contractorStatus')} className={selectCls}>
                    <option value="Not Appointed">Not Appointed</option>
                    <option value="Appointed">Appointed</option>
                    <option value="To be selected through SSA referral">To be selected through SSA referral</option>
                  </select>
                  <SelectChevron />
                </div>
              </FormField>

              <FormField label="Preferred Vendors" error={errors.preferredVendors?.message}>
                <input {...register('preferredVendors')} placeholder="e.g. Specific cement or steel brands" className={inputCls} />
              </FormField>

              <FormField label="Site Visit Expectation" error={errors.siteVisitFrequencyExpectation?.message}>
                <input {...register('siteVisitFrequencyExpectation')} placeholder="e.g. Weekly, 2 times a month" className={inputCls} />
              </FormField>

              <FormField label="Reporting Expectations" error={errors.reportingExpectations?.message}>
                <input {...register('reportingExpectations')} placeholder="e.g. Weekly status reports, monthly audit" className={inputCls} />
              </FormField>
            </div>
          </SectionCard>

          {/* ══════════════════════════════════════════════════════════════
              SECTION 6: Services Required
          ══════════════════════════════════════════════════════════════ */}
          <SectionCard title="Services Required" icon={<FiCheckSquare size={15} />} delay={0.25}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {SERVICES.map((svc) => {
                const isSelected = selectedServices.includes(svc.id)
                return (
                  <button
                    key={svc.id}
                    type="button"
                    onClick={() =>
                      setSelectedServices((prev) =>
                        prev.includes(svc.id)
                          ? prev.filter((s) => s !== svc.id)
                          : [...prev, svc.id]
                      )
                    }
                    className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl border-2 text-xs font-semibold transition-all duration-200 cursor-pointer ${isSelected
                      ? 'border-[#33a18a] bg-[#33a18a]/10 text-[#33a18a] dark:text-[#C59D5F]'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                  >
                    <span
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${isSelected ? 'bg-[#33a18a] border-[#33a18a]' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900'
                        }`}
                    >
                      {isSelected && (
                        <svg viewBox="0 0 10 8" fill="none" className="w-2.5 h-2.5">
                          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    <span className="text-base leading-none">{svc.icon}</span>
                    <span className="truncate">{svc.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Selected Tags */}
            <AnimatePresence>
              {selectedServices.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800"
                >
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Selected Services ({selectedServices.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedServices.map((id) => {
                      const svc = SERVICES.find((s) => s.id === id)!
                      return (
                        <span
                          key={id}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#33a18a]/10 text-[#33a18a] dark:text-[#C59D5F] border border-[#33a18a]/20"
                        >
                          {svc.icon} {svc.label}
                          <button
                            type="button"
                            onClick={() => setSelectedServices((prev) => prev.filter((s) => s !== id))}
                            className="ml-0.5 hover:opacity-70 cursor-pointer"
                          >
                            <FiX size={11} />
                          </button>
                        </span>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </SectionCard>

          {/* ══════════════════════════════════════════════════════════════
              SECTION 6.1: Design Preferences
          ══════════════════════════════════════════════════════════════ */}
          <SectionCard title="Design Preferences" icon={<MdOutlineArchitecture size={16} />} delay={0.27}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Style References / Inspiration" error={errors.styleReferencesInspiration?.message}>
                <input {...register('styleReferencesInspiration')} placeholder="e.g. Modernist, Minimalist, Traditional" className={inputCls} />
              </FormField>

              <FormField label="Sustainability Goals" error={errors.sustainabilityGoals?.message}>
                <input {...register('sustainabilityGoals')} placeholder="e.g. Solar panel integration, Net-zero" className={inputCls} />
              </FormField>

              <FormField label="Vaastu / Orientation" error={errors.vaastuOrientationRequirements?.message}>
                <input {...register('vaastuOrientationRequirements')} placeholder="e.g. Strict Vaastu, East facing entry" className={inputCls} />
              </FormField>

              <FormField label="Material Preferences" error={errors.materialPreferences?.message}>
                <input {...register('materialPreferences')} placeholder="e.g. Natural stone cladding, exposed brick" className={inputCls} />
              </FormField>
            </div>
          </SectionCard>

          {/* ══════════════════════════════════════════════════════════════
              SECTION 7: Assignment
          ══════════════════════════════════════════════════════════════ */}
          <SectionCard title="Assignment" icon={<FiUsers size={15} />} delay={0.3}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Company" hint="Auto-filled from account">
                <input
                  readOnly
                  value={companyName}
                  className={`${inputCls} bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 cursor-not-allowed`}
                />
              </FormField>

              {user?.role === 'Branch' ? (
                <FormField label="Branch / Division" hint="Auto-filled from account">
                  <input
                    readOnly
                    value={user?.name || ''}
                    className={`${inputCls} bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 cursor-not-allowed`}
                  />
                </FormField>
              ) : (
                <FormField label="Branch / Division" error={errors.branchId?.message}>
                  <div className="relative">
                    <select
                      {...register('branchId')}
                      className={selectCls}
                      onChange={(e) => {
                        const val = e.target.value;
                        setValue('branchId', val || null);
                        const matched = dbBranches.find(b => b.branchId === val);
                        setValue('branch', matched ? matched.name : '');
                      }}
                    >
                      <option value="">— Company Level (No Branch) —</option>
                      {dbBranches.map((b) => (
                        <option key={b.branchId || b.id} value={b.branchId}>{b.name}</option>
                      ))}
                    </select>
                    <SelectChevron />
                  </div>
                </FormField>
              )}

              <div className="sm:col-span-2">
                <FormField label="Assigned Employee" required error={errors.assignedEmployee?.message}>
                  <div className="relative">
                    <FiUsers size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <select
                      {...register('assignedEmployee', { required: 'Please assign an employee' })}
                      className={`${selectCls} pl-9`}
                    >
                      <option value="">— Select Employee —</option>
                      {dbEmployees.map((emp) => (
                        <option key={emp.employeeId || emp.id} value={emp.name}>{emp.name}</option>
                      ))}
                    </select>
                    <SelectChevron />
                  </div>
                </FormField>
              </div>
            </div>
          </SectionCard>

          {/* ══════════════════════════════════════════════════════════════
              SECTION 8: Status
          ══════════════════════════════════════════════════════════════ */}
          <SectionCard title="Lead Status" icon={<FiActivity size={15} />} delay={0.35}>
            <input
              type="hidden"
              {...register('status', { required: 'Status is required' })}
            />

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
                Current Status
                <span className="text-red-500 font-bold">*</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
                {STATUS_OPTIONS.map(({ label, bg, color, dot }) => {
                  const isSelected = watchedStatus === label
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setValue('status', label, { shouldValidate: true })}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-xs font-bold transition-all duration-200 cursor-pointer ${isSelected
                        ? 'shadow-md scale-[1.03] opacity-100'
                        : 'opacity-65 hover:opacity-95'
                        }`}
                      style={{
                        background: isSelected ? color : bg,
                        color: isSelected ? '#FFFFFF' : color,
                        borderColor: isSelected ? color : `${color}30`,
                      }}
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0 transition-colors duration-200"
                        style={{ background: isSelected ? '#FFFFFF' : dot }}
                      />
                      <span className="text-left leading-tight transition-colors duration-200">{label}</span>
                    </button>
                  )
                })}
              </div>

              <AnimatePresence>
                {errors.status?.message && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="text-xs text-red-500 flex items-center gap-1 mt-1.5 font-medium"
                  >
                    <FiAlertCircle size={11} />
                    {errors.status.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </SectionCard>

          {/* ══════════════════════════════════════════════════════════════
              SECTION 9: Remarks
          ══════════════════════════════════════════════════════════════ */}
          <SectionCard title="Remarks" icon={<FiMessageSquare size={15} />} delay={0.4}>
            <FormField label="Internal Remarks / Notes" error={errors.remarks?.message}>
              <textarea
                {...register('remarks')}
                rows={5}
                placeholder="Add client requirements, special notes, follow-up details, or any internal observations..."
                className={`${inputCls} resize-none`}
              />
            </FormField>
            <p className="mt-2.5 text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <FiInfo size={11} />
              Visible only to internal team members.
            </p>
          </SectionCard>

          {/* ══════════════════════════════════════════════════════════════
              SECTION 10: Attachments
          ══════════════════════════════════════════════════════════════ */}
          <SectionCard title="Attachments" icon={<FiPaperclip size={15} />} delay={0.45}>
            <div
              onDrop={onDrop}
              onDragOver={(e) => { e.preventDefault(); !isUploadingGeneral && setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onClick={() => !isUploadingGeneral && fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${isUploadingGeneral ? 'pointer-events-none opacity-60 border-slate-200 bg-slate-50/50 dark:bg-slate-800/20' :
                isDragging
                  ? 'border-[#33a18a] bg-[#33a18a]/10'
                  : 'border-slate-200 dark:border-slate-700 hover:border-[#33a18a]/40 hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
                }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx"
                className="hidden"
                disabled={isUploadingGeneral}
                onChange={(e) => processFiles(e.target.files)}
              />
              <div className="flex flex-col items-center gap-3 pointer-events-none">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-xs transition-all"
                  style={{ background: isDragging || isUploadingGeneral ? '#33a18a20' : '#F3F4F6' }}
                >
                  {isUploadingGeneral ? (
                    <svg className="animate-spin h-6 w-6 text-[#33a18a]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <FiUploadCloud size={26} className={isDragging ? 'text-[#33a18a]' : 'text-slate-400'} />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    {isUploadingGeneral
                      ? 'Uploading documents...'
                      : isDragging
                        ? 'Release to upload'
                        : 'Drag & drop files here or click to browse'}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    Supports: JPG, PNG, PDF, DOC, DOCX • Max 10MB per file
                  </p>
                </div>
              </div>
            </div>

            {/* Attached Files List */}
            <AnimatePresence>
              {uploadedFiles.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 space-y-2"
                >
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Attached Files ({uploadedFiles.length})
                  </p>
                  {uploadedFiles.map((file) => (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 group"
                    >
                      {file.preview ? (
                        <img
                          src={file.preview}
                          alt={file.name}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                          {getFileIcon(file.type)}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{file.name}</p>
                        <p className="text-xs text-slate-400">{formatFileSize(file.size)}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFile(file.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                      >
                        <FiX size={14} />
                      </button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </SectionCard>

        </div>

        {/* ── Sticky Bottom Action Bar (Contained within page width) ───────────── */}
        <div className="sticky bottom-6 z-20 mt-6 py-3.5 px-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-lg flex items-center justify-between gap-4">
          <p className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 font-medium">
            <span className="text-red-500 font-bold">*</span>
            Required fields must be completed before submission.
          </p>

          <div className="flex items-center gap-3 ml-auto">
            <button
              type="button"
              onClick={() => navigate('/crm/leads')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <FiArrowLeft size={14} />
              <span>Cancel</span>
            </button>
            {!isEditMode && (
              <button
                type="button"
                onClick={handleSaveDraft}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer"
                style={{ color: PRIMARY_COLOR, borderColor: `${PRIMARY_COLOR}40`, backgroundColor: `${PRIMARY_COLOR}0a` }}
              >
                <FiSave size={14} />
                <span>Save Draft</span>
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-extrabold text-white shadow-md transition-all duration-200 hover:opacity-95 active:scale-95 cursor-pointer disabled:opacity-60"
              style={{ background: `linear-gradient(135deg, ${PRIMARY_COLOR} 0%, #288571 100%)` }}
            >
              {isEditMode ? <FiCheckCircle size={14} /> : <FiPlusCircle size={14} />}
              <span>{isSubmitting ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Lead' : 'Create Lead')}</span>
            </button>
          </div>
        </div>
      </form>

      {/* ═════════════════════════════════════════════════════════════════════════
          REGISTER NEW CLIENT POPUP MODAL (Portal)
      ═════════════════════════════════════════════════════════════════════════ */}
      {isNewClientModalOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#33a18a]/10 border border-[#33a18a]/20 flex items-center justify-center text-[#33a18a]">
                  <FiUsers size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Register New Client Profile
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Capture client particulars to automatically link with this lead requirement.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewClientModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveNewClient} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">

                {/* Client Name */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Client Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={clientModalForm.clientName}
                    onChange={(e) => setClientModalForm({ ...clientModalForm, clientName: e.target.value })}
                    placeholder="e.g. Gokul Ramakrishnan"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-semibold outline-none focus:border-[#33a18a]"
                  />
                  {clientModalErrors.clientName && <p className="text-[10px] text-red-500 mt-0.5">{clientModalErrors.clientName}</p>}
                </div>

                {/* Company Name */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Company / Organization Name
                  </label>
                  <input
                    type="text"
                    value={clientModalForm.company}
                    onChange={(e) => setClientModalForm({ ...clientModalForm, company: e.target.value })}
                    placeholder="e.g. GR Prestige Projects"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-semibold outline-none focus:border-[#33a18a]"
                  />
                </div>

                {/* Contact Person */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    value={clientModalForm.contactPerson}
                    onChange={(e) => setClientModalForm({ ...clientModalForm, contactPerson: e.target.value })}
                    placeholder="Primary contact name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-semibold outline-none focus:border-[#33a18a]"
                  />
                </div>

                {/* Client Type */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Client Type
                  </label>
                  <select
                    value={clientModalForm.clientType}
                    onChange={(e) => setClientModalForm({ ...clientModalForm, clientType: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-semibold outline-none focus:border-[#33a18a]"
                  >
                    <option value="Corporate">Corporate Developer</option>
                    <option value="Individual Developer">Individual Developer</option>
                    <option value="Institutional">Institutional Body</option>
                    <option value="Commercial">Commercial Owner</option>
                    <option value="Government">Government / Public</option>
                  </select>
                </div>

                {/* Mobile */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={clientModalForm.mobile}
                    onChange={(e) => setClientModalForm({ ...clientModalForm, mobile: e.target.value })}
                    placeholder="+91 98400 00000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-semibold outline-none focus:border-[#33a18a]"
                  />
                  {clientModalErrors.mobile && <p className="text-[10px] text-red-500 mt-0.5">{clientModalErrors.mobile}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={clientModalForm.email}
                    onChange={(e) => setClientModalForm({ ...clientModalForm, email: e.target.value })}
                    placeholder="client@organization.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-semibold outline-none focus:border-[#33a18a]"
                  />
                  {clientModalErrors.email && <p className="text-[10px] text-red-500 mt-0.5">{clientModalErrors.email}</p>}
                </div>

                {/* Address */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Office / Correspondence Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={clientModalForm.address}
                    onChange={(e) => setClientModalForm({ ...clientModalForm, address: e.target.value })}
                    placeholder="Street address, building, locality..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-semibold outline-none focus:border-[#33a18a] resize-none"
                  />
                  {clientModalErrors.address && <p className="text-[10px] text-red-500 mt-0.5">{clientModalErrors.address}</p>}
                </div>

                {/* City & State */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={clientModalForm.city}
                    onChange={(e) => setClientModalForm({ ...clientModalForm, city: e.target.value })}
                    placeholder="e.g. Chennai"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-semibold outline-none focus:border-[#33a18a]"
                  />
                  {clientModalErrors.city && <p className="text-[10px] text-red-500 mt-0.5">{clientModalErrors.city}</p>}
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={clientModalForm.state}
                    onChange={(e) => setClientModalForm({ ...clientModalForm, state: e.target.value })}
                    placeholder="e.g. Tamil Nadu"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-semibold outline-none focus:border-[#33a18a]"
                  />
                  {clientModalErrors.state && <p className="text-[10px] text-red-500 mt-0.5">{clientModalErrors.state}</p>}
                </div>

                {/* GST, PAN & Aadhar */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">GST Number</label>
                  <input
                    type="text"
                    value={clientModalForm.gstNo}
                    onChange={(e) => setClientModalForm({ ...clientModalForm, gstNo: e.target.value })}
                    placeholder="e.g. 33AABCG1234F1Z5"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-semibold outline-none focus:border-[#33a18a] uppercase font-mono"
                  />
                  {clientModalErrors.gstNo && <p className="text-[10px] text-red-500 mt-0.5">{clientModalErrors.gstNo}</p>}
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">PAN Number</label>
                  <input
                    type="text"
                    value={clientModalForm.panNo}
                    onChange={(e) => setClientModalForm({ ...clientModalForm, panNo: e.target.value })}
                    placeholder="e.g. AABCG1234F"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-semibold outline-none focus:border-[#33a18a] uppercase font-mono"
                  />
                  {clientModalErrors.panNo && <p className="text-[10px] text-red-500 mt-0.5">{clientModalErrors.panNo}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Aadhar Number</label>
                  <input
                    type="text"
                    value={clientModalForm.aadharNo}
                    onChange={(e) => setClientModalForm({ ...clientModalForm, aadharNo: e.target.value })}
                    placeholder="e.g. 1234 5678 9012"
                    maxLength={16}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-semibold outline-none focus:border-[#33a18a] font-mono"
                  />
                  {clientModalErrors.aadharNo && <p className="text-[10px] text-red-500 mt-0.5">{clientModalErrors.aadharNo}</p>}
                </div>

                {/* Remarks */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Notes / Remarks
                  </label>
                  <textarea
                    rows={2}
                    value={clientModalForm.remarks}
                    onChange={(e) => setClientModalForm({ ...clientModalForm, remarks: e.target.value })}
                    placeholder="Key client preferences or relationship notes..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-semibold outline-none focus:border-[#33a18a] resize-none"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewClientModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={newClientSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#33a18a] hover:bg-[#2a8774] text-xs font-extrabold text-white shadow-md transition-all cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {newClientSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving & Linking...
                    </>
                  ) : (
                    <>
                      <FiCheckCircle size={14} />
                      Save & Link Client
                    </>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>,
        document.body
      )}

    </div>
  )
}

export default CreateLead
