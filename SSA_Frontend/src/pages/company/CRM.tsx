import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useForm } from 'react-hook-form'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  type Lead,
  type Opportunity,
  type Client
} from '../../data/mockData'
import {
  Plus, UserCheck, Phone, Mail, Calendar, Trash2, Eye, User,
  MapPin, Layers, FileText, Briefcase, Edit2,
  CheckCircle2, XCircle, Zap, Folder, FolderPlus,
  Search, ArrowLeft, Download, Users, Building, ShieldCheck, Tag,
  Upload, X, AlertCircle, AlertTriangle, RotateCcw, Archive
} from 'lucide-react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { deriveProjectCodeFromName, DISCIPLINE_CATALOG, PROJECT_17_FOLDERS, type DisciplineCode } from '../../data/masterDrawingListData'
import { CategoryQuestionManagerModal } from './leads/CategoryQuestionManagerModal'

interface CRMProps {
  defaultTab?: 'clients' | 'leads' | 'opportunities' | 'drawings'
}

interface ClientFormInputs {
  clientName: string
  company: string
  contactPerson: string
  mobile: string
  alternatePhone?: string
  email: string
  address: string
  city: string
  state: string
  country: string
  pincode?: string
  gstNo?: string
  panNo?: string
  aadharNo?: string
  clientType: string
  status: string
  remarks?: string
}

const getDrawingFileUrl = (dwg: any): string | null => {
  if (!dwg) return null
  if (dwg.fileUrl && typeof dwg.fileUrl === 'string' && dwg.fileUrl.trim()) return dwg.fileUrl.trim()
  if (dwg.url && typeof dwg.url === 'string' && dwg.url.trim()) return dwg.url.trim()
  if (dwg.file && typeof dwg.file === 'string' && dwg.file.trim()) return dwg.file.trim()
  if (dwg.filePath && typeof dwg.filePath === 'string' && dwg.filePath.trim()) return dwg.filePath.trim()
  if (dwg.documentUrl && typeof dwg.documentUrl === 'string' && dwg.documentUrl.trim()) return dwg.documentUrl.trim()
  if (dwg.previewUrl && typeof dwg.previewUrl === 'string' && dwg.previewUrl.trim()) return dwg.previewUrl.trim()
  if (dwg.attachment && typeof dwg.attachment === 'string' && dwg.attachment.trim()) return dwg.attachment.trim()
  if (Array.isArray(dwg.revisions) && dwg.revisions.length > 0) {
    for (let i = dwg.revisions.length - 1; i >= 0; i--) {
      const rev = dwg.revisions[i]
      const revUrl = rev?.fileUrl || rev?.url || rev?.file || rev?.filePath
      if (revUrl && typeof revUrl === 'string' && revUrl.trim()) return revUrl.trim()
    }
  }
  if (dwg.latestRevision) {
    const revUrl = dwg.latestRevision.fileUrl || dwg.latestRevision.url || dwg.latestRevision.file
    if (revUrl && typeof revUrl === 'string' && revUrl.trim()) return revUrl.trim()
  }
  return null
}

const hasDocOrImage = (dwg: any): boolean => {
  return Boolean(getDrawingFileUrl(dwg))
}

const deriveDisciplineCode = (title: string): string => {
  if (!title) return ''
  const words = title.trim().split(/\s+/).filter(Boolean)
  if (words.length >= 2) {
    const code = words.slice(0, 3).map(w => w.replace(/[^A-Za-z0-9]/g, '')[0] || '').join('').toUpperCase()
    return code.slice(0, 4)
  }
  const clean = words[0].replace(/[^A-Za-z0-9]/g, '')
  if (clean.length <= 2) return clean.toUpperCase()
  return clean.slice(0, 2).toUpperCase()
}

export type DrawingWorkflowStage = 'WIP' | 'REVIEW' | 'SHARED' | 'ARCHIVE'

export interface DrawingWorkflowFolderMeta {
  id: DrawingWorkflowStage
  number: string
  name: string
  shortName: string
  color: string
  badgeText: string
  badgeBg: string
  iconColor: string
  iconBg: string
  cardBorder: string
  activeBg: string
  description: string
  statuses: string[]
}

export const DRAWING_WORKFLOW_FOLDERS: DrawingWorkflowFolderMeta[] = [
  {
    id: 'WIP',
    number: '1',
    name: '1. Work In Progress',
    shortName: 'Work In Progress',
    color: 'amber',
    badgeText: 'text-amber-700 dark:text-amber-300',
    badgeBg: 'bg-amber-500/10 dark:bg-amber-500/20 border-amber-500/30 text-amber-600 dark:text-amber-400',
    iconColor: 'text-amber-500',
    iconBg: 'text-amber-500 fill-amber-500/20',
    cardBorder: 'hover:border-amber-500',
    activeBg: 'bg-amber-500/10 border-amber-500 shadow-md shadow-amber-500/10 ring-1 ring-amber-500',
    description: 'Drawings actively drafted or undergoing rework by the design team.',
    statuses: ['Draft', 'Work In Progress', 'Revision Required', 'Rejected', 'In Progress']
  },
  {
    id: 'REVIEW',
    number: '2',
    name: '2. Under Review',
    shortName: 'Under Review',
    color: 'amber',
    badgeText: 'text-amber-700 dark:text-amber-300',
    badgeBg: 'bg-amber-500/10 dark:bg-amber-500/20 border-amber-500/30 text-amber-600 dark:text-amber-400',
    iconColor: 'text-amber-500',
    iconBg: 'text-amber-500 fill-amber-500/20',
    cardBorder: 'hover:border-amber-500',
    activeBg: 'bg-amber-500/10 border-amber-500 shadow-md shadow-amber-500/10 ring-1 ring-amber-500',
    description: 'Completed deliverables submitted for internal check, QA & review notes.',
    statuses: ['Under Review', 'Submitted for Review', 'Submitted', 'For Review', 'Internal Review']
  },
  {
    id: 'SHARED',
    number: '3',
    name: '3. Shared',
    shortName: 'Shared (Client / GFC)',
    color: 'amber',
    badgeText: 'text-amber-700 dark:text-amber-300',
    badgeBg: 'bg-amber-500/10 dark:bg-amber-500/20 border-amber-500/30 text-amber-600 dark:text-amber-400',
    iconColor: 'text-amber-500',
    iconBg: 'text-amber-500 fill-amber-500/20',
    cardBorder: 'hover:border-amber-500',
    activeBg: 'bg-amber-500/10 border-amber-500 shadow-md shadow-amber-500/10 ring-1 ring-amber-500',
    description: 'Approved drawings released to Client, PMC, Site team & Consultants.',
    statuses: ['Approved', 'Shared', 'Issued for Construction', 'GFC', 'Client Shared']
  },
  {
    id: 'ARCHIVE',
    number: '4',
    name: '4. Archive',
    shortName: 'Archive',
    color: 'amber',
    badgeText: 'text-amber-700 dark:text-amber-300',
    badgeBg: 'bg-amber-500/10 dark:bg-amber-500/20 border-amber-500/30 text-amber-600 dark:text-amber-400',
    iconColor: 'text-amber-500',
    iconBg: 'text-amber-500 fill-amber-500/20',
    cardBorder: 'hover:border-amber-500',
    activeBg: 'bg-amber-500/10 border-amber-500 shadow-md shadow-amber-500/10 ring-1 ring-amber-500',
    description: 'Superseded revisions and closed historical drawing records.',
    statuses: ['Archived', 'Superseded', 'Closed']
  },
]

export const getDrawingWorkflowStage = (status: string = ''): DrawingWorkflowStage => {
  const s = (status || '').toLowerCase().trim()
  if (s === 'under review' || s === 'for review' || s === 'submitted' || s.includes('review')) return 'REVIEW'
  if (s === 'approved' || s === 'shared' || s.includes('construction') || s === 'ifc' || s === 'gfc' || s.includes('client')) return 'SHARED'
  if (s === 'archived' || s === 'superseded' || s === 'closed' || s.includes('archive')) return 'ARCHIVE'
  return 'WIP'
}

export const isDrawingDiscipline = (codeOrName: string): boolean => {
  if (!codeOrName || codeOrName === 'ALL') return false
  const code = codeOrName.trim().toUpperCase()

  const DRAWING_CODES = new Set([
    'AR', 'ST', 'IN', 'MEP', 'EL', 'PL', 'FF', 'HV', 'LA', 'MG', 'LV', 'VT', 'SP', 'ARCH', 'STRUCT', 'ELEC', 'PLUMB'
  ])
  if (DRAWING_CODES.has(code)) return true

  const meta = PROJECT_17_FOLDERS.find(f => f.code === code || f.name.toUpperCase().includes(code))
  if (meta?.category === 'Design & Engineering') return true
  if (meta?.name?.toLowerCase().includes('drawing')) return true

  const lower = codeOrName.toLowerCase()
  if (
    lower.includes('drawing') ||
    lower.includes('architect') ||
    lower.includes('struct') ||
    lower.includes('interior') ||
    lower.includes('mep') ||
    lower.includes('landscape') ||
    lower.includes('hvac') ||
    lower.includes('electrical') ||
    lower.includes('plumbing') ||
    lower.includes('fire')
  ) {
    return true
  }

  return false
}

export const CRM: React.FC<CRMProps> = ({ defaultTab = 'clients' }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'clients' | 'leads' | 'opportunities' | 'drawings'>(defaultTab)

  // Reset drilldown folders / modals and refresh data whenever defaultTab or navigation route changes
  useEffect(() => {
    setActiveTab(defaultTab)
    setSelectedDrawingProject(null)
    setDrawingDisciplineFilter('ALL')
    setDrawingsSearch('')
    setSelectedLeadDetails(null)
    setClient360(null)
    setIsClientModalOpen(false)
    setEditingClient(null)
    setConvertingLead(null)
    setIsAddDisciplineModalOpen(false)
    setIsAddDrawingModalOpen(false)
    setPreviewDrawing(null)
    fetchData()
  }, [defaultTab, location.pathname, location.key, (location.state as any)?.refreshKey])

  const [clients, setClients] = useState<Client[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [projectsList, setProjectsList] = useState<any[]>([])
  const [loadingData, setLoadingData] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Filters & Searches
  const [clientSearch, setClientSearch] = useState('')
  const [clientTypeFilter, setClientTypeFilter] = useState('ALL')
  const [leadSearch, setLeadSearch] = useState('')

  // Client Modals
  const [isClientModalOpen, setIsClientModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [clientSubmitting, setClientSubmitting] = useState(false)
  const [client360, setClient360] = useState<any | null>(null)
  const [client360Tab, setClient360Tab] = useState<'leads' | 'projects' | 'profile'>('leads')

  // Lead Conversion & Drawings State
  const [convertingLead, setConvertingLead] = useState<Lead | null>(null)
  const [employeesList, setEmployeesList] = useState<any[]>([])
  const [convertAssignedEmployee, setConvertAssignedEmployee] = useState<string>('')
  const [convertLoading, setConvertLoading] = useState(false)
  const [contractValue, setContractValue] = useState<string>('')
  const [convertProjectPrefix, setConvertProjectPrefix] = useState<string>('GVR')
  const [selectedDisciplines, setSelectedDisciplines] = useState<string[]>([])
  const [selectedFloors, setSelectedFloors] = useState<string[]>(['GF', '01', '02', '03', '04', 'TR'])

  // Master Disciplines (from Database)
  const [masterDisciplines, setMasterDisciplines] = useState<Array<{ code: string; name: string; description?: string }>>([
    { code: 'AR', name: 'Architecture' },
    { code: 'ST', name: 'Structural' },
    { code: 'EL', name: 'Electrical (MEP)' },
    { code: 'PL', name: 'Plumbing (MEP)' },
    { code: 'FF', name: 'Fire Fighting' },
    { code: 'HV', name: 'HVAC' },
    { code: 'IN', name: 'Interior' },
    { code: 'LA', name: 'Landscape' },
    { code: 'CS', name: 'Civil & Infrastructure' },
    { code: 'ID', name: 'Interior Details' },
    { code: 'AV', name: 'Audio Visual' },
    { code: 'SE', name: 'Security & Surveillance' },
    { code: 'MG', name: 'Medical Gas' },
    { code: 'LV', name: 'Low Voltage / ELV' },
    { code: 'VT', name: 'Vertical Transport' },
  ])
  const [isNewMasterDisciplineModalOpen, setIsNewMasterDisciplineModalOpen] = useState(false)
  const [masterDisciplineForm, setMasterDisciplineForm] = useState({ code: '', name: '', description: '' })
  const [savingMasterDiscipline, setSavingMasterDiscipline] = useState(false)

  // Discipline Creation inside Project Folder
  const [isAddDisciplineModalOpen, setIsAddDisciplineModalOpen] = useState(false)
  const [newDisciplineCode, setNewDisciplineCode] = useState('AR')
  const [customDisciplineCode, setCustomDisciplineCode] = useState('')
  const [customDisciplineName, setCustomDisciplineName] = useState('')
  const [customDisciplineDesc, setCustomDisciplineDesc] = useState('')
  const [addingDiscipline, setAddingDiscipline] = useState(false)
  const [folderModalSearch, setFolderModalSearch] = useState('')
  const [folderModalCategory, setFolderModalCategory] = useState<string>('ALL')

  const [selectedLeadDetails, setSelectedLeadDetails] = useState<any | null>(null)
  const [selectedDrawingProject, setSelectedDrawingProject] = useState<any | null>(null)
  const [drawingsSearch, setDrawingsSearch] = useState<string>('')
  const [drawingDisciplineFilter, setDrawingDisciplineFilter] = useState<string>('ALL')
  const [previewDrawing, setPreviewDrawing] = useState<any | null>(null)
  const [blobPdfUrl, setBlobPdfUrl] = useState<string | null>(null)
  const [pdfLoading, setPdfLoading] = useState<boolean>(false)
  const [projectDrawingsList, setProjectDrawingsList] = useState<any[]>([])
  const [loadingDrawings, setLoadingDrawings] = useState<boolean>(false)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [selectedDrawingSubFolder, setSelectedDrawingSubFolder] = useState<string | null>(null)
  const [selectedWorkflowStage, setSelectedWorkflowStage] = useState<DrawingWorkflowStage | null>(null)
  const [reviewActionModal, setReviewActionModal] = useState<{
    isOpen: boolean
    drawing: any | null
    action: 'approve' | 'rework' | 'submit_review' | 'archive'
    note: string
  }>({
    isOpen: false,
    drawing: null,
    action: 'submit_review',
    note: ''
  })
  const [isAddSubFolderModalOpen, setIsAddSubFolderModalOpen] = useState(false)
  const [newSubFolderName, setNewSubFolderName] = useState('')
  const [subFolderTargetDiscipline, setSubFolderTargetDiscipline] = useState<string>('AR')
  const [subFoldersList, setSubFoldersList] = useState<{ id: string; name: string; discipline: string; projectCode: string }[]>([])

  // Submit Drawing for Internal Review Modal State
  const [submitReviewModal, setSubmitReviewModal] = useState<{
    isOpen: boolean
    drawing: any | null
    reviewerId: string
    reviewerName: string
    reviewerRole: string
    reviewerEmail: string
    priority: 'Normal' | 'High' | 'Urgent'
    dueDate: string
    drafterNotes: string
  }>({
    isOpen: false,
    drawing: null,
    reviewerId: '',
    reviewerName: '',
    reviewerRole: '',
    reviewerEmail: '',
    priority: 'Normal',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    drafterNotes: ''
  })

  const [reviewerSearchTerm, setReviewerSearchTerm] = useState('')

  const availableReviewers = React.useMemo(() => {
    const list = employeesList.map((e, idx) => ({
      id: String(e.id ?? e.employeeId ?? e._id ?? `EMP-${idx}-${e.name}`),
      name: e.name || e.fullName || 'Design Lead',
      role: e.designation || e.role || 'Design Lead / Checker',
      email: e.email || '',
      department: e.department || 'Architecture'
    }))

    if (list.length === 0) {
      return [
        { id: 'EMP-01', name: 'Sundar Sundram', role: 'Principal Architect & MD', email: 'sundar@ssa.com', department: 'Management' },
        { id: 'EMP-02', name: 'Senior Design Lead', role: 'Lead Architect & Checker', email: 'lead.arch@ssa.com', department: 'Architecture' },
        { id: 'EMP-03', name: 'Structural Checker', role: 'Senior Structural Engineer', email: 'structural@ssa.com', department: 'Structural' },
        { id: 'EMP-04', name: 'MEP Services Lead', role: 'MEP Consultant & Checker', email: 'mep@ssa.com', department: 'MEP' },
        { id: 'EMP-05', name: 'Project Quality Manager', role: 'QA & Compliance Head', email: 'qa@ssa.com', department: 'Quality' },
      ]
    }
    return list
  }, [employeesList])

  const openSubmitReviewModal = (dwg: any) => {
    const firstReviewer = availableReviewers[0]
    setReviewerSearchTerm('')
    setSubmitReviewModal({
      isOpen: true,
      drawing: dwg,
      reviewerId: firstReviewer?.id || 'EMP-01',
      reviewerName: firstReviewer?.name || 'Principal Architect',
      reviewerRole: firstReviewer?.role || 'Lead Architect',
      reviewerEmail: firstReviewer?.email || 'reviewer@ssa.com',
      priority: 'Normal',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      drafterNotes: ''
    })
  }

  // Custom Delete Confirmation & Toast Popups
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'client' | 'lead'; id: string; name: string } | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Fetch remote PDF as typed in-memory Blob to bypass Content-Disposition: attachment header and prevent auto-download
  useEffect(() => {
    if (!previewDrawing) {
      setBlobPdfUrl(null)
      setPdfLoading(false)
      return
    }

    const rawUrl = getDrawingFileUrl(previewDrawing) || previewDrawing.fileUrl || previewDrawing.url || previewDrawing.file || previewDrawing.filePath || ''
    if (!rawUrl || rawUrl.endsWith('placeholder')) {
      setBlobPdfUrl(null)
      setPdfLoading(false)
      return
    }

    const isImage = /\.(png|jpg|jpeg|webp|gif|svg)(\?.*)?$/i.test(rawUrl) || (previewDrawing.originalFileName && /\.(png|jpg|jpeg|webp|gif|svg)$/i.test(previewDrawing.originalFileName))
    if (isImage) {
      setBlobPdfUrl(null)
      setPdfLoading(false)
      return
    }

    if (rawUrl.startsWith('blob:')) {
      setBlobPdfUrl(rawUrl)
      setPdfLoading(false)
      return
    }

    setPdfLoading(true)
    let active = true

    fetch(rawUrl)
      .then(async (res) => {
        if (!res.ok) throw new Error('Fetch failed')
        const blob = await res.blob()
        const pdfBlob = new Blob([blob], { type: 'application/pdf' })
        const objUrl = URL.createObjectURL(pdfBlob)
        if (active) {
          setBlobPdfUrl(objUrl)
          setPdfLoading(false)
        }
      })
      .catch((err) => {
        console.warn('PDF blob fetch fallback to Google Docs Viewer:', err)
        if (active) {
          setBlobPdfUrl(`https://docs.google.com/viewer?url=${encodeURIComponent(rawUrl)}&embedded=true`)
          setPdfLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [previewDrawing])

  // Add Drawing State inside Discipline Folder
  const [isAddDrawingModalOpen, setIsAddDrawingModalOpen] = useState(false)
  const [drawingForm, setDrawingForm] = useState({
    drawingTitle: '',
    drawingNumber: '',
    discipline: 'AR',
    subFolder: '',
    level: 'GF',
    revisionNumber: 'R00',
    preparedBy: '',
    purpose: '',
    status: 'Draft',
  })
  const [selectedDrawingFile, setSelectedDrawingFile] = useState<File | null>(null)
  const [isSubmittingDrawing, setIsSubmittingDrawing] = useState(false)
  const [drawingFolderSuccess, setDrawingFolderSuccess] = useState<string | null>(null)

  const openAddDrawingModal = () => {
    const pId = selectedDrawingProject?.id || selectedDrawingProject?.projectCode || ''
    const pCode = selectedDrawingProject?.projectCode || deriveProjectCodeFromName(selectedDrawingProject?.companyName || selectedDrawingProject?.company || 'Project', pId)
    const existingDisciplines = selectedDrawingProject?.disciplines || []
    const disc = drawingDisciplineFilter !== 'ALL'
      ? drawingDisciplineFilter
      : (existingDisciplines.length > 0 ? existingDisciplines[0] : 'AR')

    const nextNum = String(projectDrawingsList.filter(d => (d.discipline === disc || d.disciplineCode === disc)).length + 1).padStart(3, '0')
    const discTitle = DISCIPLINE_CATALOG[disc as DisciplineCode]?.name || disc

    const initialStatus = selectedWorkflowStage === 'REVIEW'
      ? 'Under Review'
      : selectedWorkflowStage === 'SHARED'
        ? 'Approved'
        : selectedWorkflowStage === 'ARCHIVE'
          ? 'Archived'
          : 'Draft'

    setDrawingForm({
      drawingTitle: selectedDrawingSubFolder ? `Ground Floor ${selectedDrawingSubFolder}` : `Ground Floor ${discTitle} Plan`,
      drawingNumber: `${pCode}-${disc}-GF-${nextNum}`,
      discipline: disc,
      subFolder: selectedDrawingSubFolder || '',
      level: 'GF',
      revisionNumber: 'R00',
      preparedBy: user?.name || '',
      purpose: '',
      status: initialStatus,
    })
    setSelectedDrawingFile(null)
    setDrawingFolderSuccess(null)
    setIsAddDrawingModalOpen(true)
  }

  const handleCreateSubFolder = (discOverride?: string) => {
    if (!newSubFolderName.trim() || !selectedDrawingProject) return
    const targetDisc = discOverride || subFolderTargetDiscipline || (drawingDisciplineFilter !== 'ALL' ? drawingDisciplineFilter : 'AR')
    const pCode = selectedDrawingProject.projectCode || selectedDrawingProject.id
    const newSub = {
      id: `sf_${Date.now()}`,
      name: newSubFolderName.trim(),
      discipline: targetDisc,
      projectCode: pCode,
      createdAt: new Date().toISOString()
    }
    const updated = [...subFoldersList, newSub]
    setSubFoldersList(updated)
    try {
      localStorage.setItem(`ssa_subfolders_${pCode}`, JSON.stringify(updated))
    } catch (e) {
      console.error(e)
    }
    showToast('success', `Drawing Folder "${newSub.name}" created in ${targetDisc}!`)
    setNewSubFolderName('')
    setIsAddSubFolderModalOpen(false)
  }

  const handleUpdateDrawingStatus = async (dwgIdOrNum: string, newStatus: string, reviewNotes?: string) => {
    if (!selectedDrawingProject) return
    const pCode = selectedDrawingProject.projectCode || selectedDrawingProject.id
    const timestamp = new Date().toISOString()
    const reviewerName = user?.name || 'Lead Architect'

    // Update in projectDrawingsList state
    setProjectDrawingsList(prev =>
      prev.map(d => {
        if (d.id === dwgIdOrNum || d.drawingNumber === dwgIdOrNum || d.drawingCode === dwgIdOrNum) {
          const updatedD = {
            ...d,
            status: newStatus,
            reviewNotes: reviewNotes !== undefined ? reviewNotes : d.reviewNotes,
            reviewedBy: reviewerName,
            reviewedAt: timestamp,
            reviewHistory: [
              ...(d.reviewHistory || []),
              ...(reviewNotes ? [{ note: reviewNotes, status: newStatus, reviewer: reviewerName, date: timestamp }] : [])
            ]
          }
          if (previewDrawing && (previewDrawing.id === dwgIdOrNum || previewDrawing.drawingNumber === dwgIdOrNum || previewDrawing.drawingCode === dwgIdOrNum)) {
            setPreviewDrawing(updatedD)
          }
          return updatedD
        }
        return d
      })
    )

    // Try API
    try {
      await api.patch(`/projects/${pCode}/drawings/${dwgIdOrNum}`, {
        status: newStatus,
        reviewNotes,
        reviewedBy: reviewerName,
        reviewedAt: timestamp
      })
    } catch { }

    // Update in localStorage
    try {
      const raw = localStorage.getItem(`ssa_drawings_${pCode}`) || '[]'
      const list = JSON.parse(raw)
      const updated = list.map((d: any) => {
        if (d.id === dwgIdOrNum || d.drawingNumber === dwgIdOrNum || d.drawingCode === dwgIdOrNum) {
          return {
            ...d,
            status: newStatus,
            reviewNotes: reviewNotes !== undefined ? reviewNotes : d.reviewNotes,
            reviewedBy: reviewerName,
            reviewedAt: timestamp
          }
        }
        return d
      })
      localStorage.setItem(`ssa_drawings_${pCode}`, JSON.stringify(updated))
    } catch { }

    showToast('success', `Status updated to "${newStatus}"!`)
  }

  const handleSubmitForReview = async () => {
    if (!submitReviewModal.drawing || !selectedDrawingProject) return
    const dwg = submitReviewModal.drawing
    const dwgId = dwg.id || dwg.drawingNumber || dwg.drawingCode
    const pCode = selectedDrawingProject.projectCode || selectedDrawingProject.id

    const timestamp = new Date().toISOString()
    const drafterName = user?.name || dwg.preparedBy || 'Drafter / Architect'

    const reviewPayload = {
      status: 'Under Review',
      assignedReviewer: {
        id: submitReviewModal.reviewerId,
        name: submitReviewModal.reviewerName,
        role: submitReviewModal.reviewerRole,
        email: submitReviewModal.reviewerEmail
      },
      reviewPriority: submitReviewModal.priority,
      reviewDueDate: submitReviewModal.dueDate,
      drafterNotes: submitReviewModal.drafterNotes,
      submittedBy: drafterName,
      submittedAt: timestamp,
      reviewHistory: [
        ...(dwg.reviewHistory || []),
        {
          action: 'SUBMITTED_FOR_REVIEW',
          by: drafterName,
          assignedTo: submitReviewModal.reviewerName,
          priority: submitReviewModal.priority,
          dueDate: submitReviewModal.dueDate,
          notes: submitReviewModal.drafterNotes,
          date: timestamp
        }
      ]
    }

    // Update in state
    setProjectDrawingsList(prev =>
      prev.map(d => (d.id === dwgId || d.drawingNumber === dwgId || d.drawingCode === dwgId) ? { ...d, ...reviewPayload } : d)
    )

    if (previewDrawing && (previewDrawing.id === dwgId || previewDrawing.drawingNumber === dwgId || previewDrawing.drawingCode === dwgId)) {
      setPreviewDrawing({ ...previewDrawing, ...reviewPayload })
    }

    // API Call
    try {
      await api.patch(`/projects/${pCode}/drawings/${dwgId}`, reviewPayload)
    } catch { }

    // Save to localStorage
    try {
      const raw = localStorage.getItem(`ssa_drawings_${pCode}`) || '[]'
      const list = JSON.parse(raw)
      const updated = list.map((d: any) => (d.id === dwgId || d.drawingNumber === dwgId || d.drawingCode === dwgId) ? { ...d, ...reviewPayload } : d)
      localStorage.setItem(`ssa_drawings_${pCode}`, JSON.stringify(updated))
    } catch { }

    // Dispatch In-App Notification to Reviewer
    try {
      const rawNotifs = localStorage.getItem('ssa_notifications') || '[]'
      const notifs = JSON.parse(rawNotifs)
      const newNotification = {
        id: `NOTIF-${Date.now()}`,
        recipientId: submitReviewModal.reviewerId,
        recipientName: submitReviewModal.reviewerName,
        senderName: drafterName,
        projectCode: pCode,
        projectName: selectedDrawingProject.companyName,
        drawingNumber: dwg.drawingNumber || dwg.drawingCode,
        drawingTitle: dwg.drawingTitle || dwg.title,
        type: 'DRAWING_REVIEW_REQUEST',
        priority: submitReviewModal.priority,
        message: `${drafterName} submitted drawing "${dwg.drawingTitle}" (${dwg.drawingNumber}) for your internal review.`,
        notes: submitReviewModal.drafterNotes,
        createdAt: timestamp,
        read: false
      }
      localStorage.setItem('ssa_notifications', JSON.stringify([newNotification, ...notifs]))
      window.dispatchEvent(new CustomEvent('ssa_new_notification', { detail: newNotification }))
    } catch { }

    showToast('success', `🔔 Review request sent to ${submitReviewModal.reviewerName}! Notification dispatched.`)
    setSubmitReviewModal({
      isOpen: false,
      drawing: null,
      reviewerId: '',
      reviewerName: '',
      reviewerRole: '',
      reviewerEmail: '',
      priority: 'Normal',
      dueDate: '',
      drafterNotes: ''
    })
  }

  // Load and sync custom subfolders per project
  useEffect(() => {
    if (selectedDrawingProject) {
      const pCode = selectedDrawingProject.projectCode || selectedDrawingProject.id
      try {
        const stored = JSON.parse(localStorage.getItem(`ssa_subfolders_${pCode}`) || '[]')
        setSubFoldersList(Array.isArray(stored) ? stored : [])
      } catch {
        setSubFoldersList([])
      }
    }
  }, [selectedDrawingProject])



  const handleDeleteSubFolder = (subId: string, subName: string) => {
    if (!selectedDrawingProject) return
    const pCode = selectedDrawingProject.projectCode || selectedDrawingProject.id

    const updated = subFoldersList.filter(s => s.id !== subId)
    setSubFoldersList(updated)
    try {
      localStorage.setItem(`ssa_subfolders_${pCode}`, JSON.stringify(updated))
    } catch { }

    if (selectedDrawingSubFolder === subName) {
      setSelectedDrawingSubFolder(null)
    }

    showToast('success', `Folder "${subName}" removed.`)
  }

  const handleAddDrawing = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDrawingProject) return
    setIsSubmittingDrawing(true)

    try {
      const pId = selectedDrawingProject.id || selectedDrawingProject.projectCode
      const pCode = selectedDrawingProject.projectCode || deriveProjectCodeFromName(selectedDrawingProject.companyName || selectedDrawingProject.company, pId)
      const disc = drawingForm.discipline || (drawingDisciplineFilter !== 'ALL' ? drawingDisciplineFilter : 'AR')

      const newD: any = {
        id: `DWG-${Math.floor(1000 + Math.random() * 9000)}`,
        drawingNumber: drawingForm.drawingNumber || `${pCode}-${disc}-${drawingForm.level}-001`,
        drawingCode: drawingForm.drawingNumber || `${pCode}-${disc}-${drawingForm.level}-001`,
        drawingTitle: drawingForm.drawingTitle || 'Drawing Deliverable',
        discipline: disc,
        disciplineCode: disc,
        subFolder: drawingForm.subFolder || selectedDrawingSubFolder || '',
        level: drawingForm.level,
        revisionNumber: drawingForm.revisionNumber || 'R00',
        revisionDate: new Date().toISOString().split('T')[0],
        preparedBy: drawingForm.preparedBy || user?.name || 'Architect / Engineer',
        approvedBy: 'Principal Architect',
        purpose: drawingForm.purpose || 'Standard drawing deliverable record.',
        status: drawingForm.status || 'Draft',
        projectCode: pCode,
        createdAt: new Date().toISOString(),
      }

      if (selectedDrawingFile) {
        const localBlobUrl = URL.createObjectURL(selectedDrawingFile)
        newD.fileUrl = localBlobUrl
        newD.originalFileName = selectedDrawingFile.name

        try {
          const folderPath = `project_drawings/${pCode}/${disc}`
          const formData = new FormData()
          formData.append('file', selectedDrawingFile)
          formData.append('folder', folderPath)
          const uploadRes = await api.post('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
          if (uploadRes.data?.url || uploadRes.data?.secure_url) {
            newD.fileUrl = uploadRes.data.url || uploadRes.data.secure_url
          }
        } catch (uploadErr) {
          console.warn('Upload fallback to local Blob URL:', uploadErr)
        }
      } else {
        newD.fileUrl = 'blob:placeholder'
      }

      // Try API submit
      try {
        await api.post(`/projects/${pId}/drawings`, newD)
      } catch (err) {
        console.warn('API drawing creation note:', err)
      }

      // Save to localStorage
      try {
        const rawKeyed = localStorage.getItem(`ssa_drawings_${pCode}`) || '[]'
        const keyedList = JSON.parse(rawKeyed)
        localStorage.setItem(`ssa_drawings_${pCode}`, JSON.stringify([newD, ...keyedList]))

        const rawReg = localStorage.getItem('registered_drawings') || '[]'
        const regList = JSON.parse(rawReg)
        localStorage.setItem('registered_drawings', JSON.stringify([newD, ...regList]))
      } catch { }

      setProjectDrawingsList(prev => [newD, ...prev])
      showToast('success', `Drawing "${newD.drawingTitle}" added successfully!`)
      setIsAddDrawingModalOpen(false)
    } catch {
      showToast('error', 'Failed to add drawing')
    } finally {
      setIsSubmittingDrawing(false)
    }
  }

  const { register: registerClient, handleSubmit: handleSubmitClient, reset: resetClient, watch: watchClient, formState: { errors: clientErrors } } = useForm<ClientFormInputs>({ mode: 'onChange' })

  const watchedClientMobile = watchClient('mobile')

  const duplicateClientWarning = React.useMemo(() => {
    if (!watchedClientMobile) return null
    const cleanWatched = watchedClientMobile.replace(/\D/g, '')
    if (cleanWatched.length < 10) return null
    const match = clients.find(c => {
      if (editingClient && c.id === editingClient.id) return false
      const cMobileClean = (c.mobile || '').replace(/\D/g, '')
      return (cMobileClean && cMobileClean === cleanWatched) || (c.mobile && c.mobile.trim() === watchedClientMobile.trim())
    })
    return match || null
  }, [watchedClientMobile, clients, editingClient])

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 4000)
  }

  // Load Real Drawings for Project Folder Explorer
  useEffect(() => {
    if (!selectedDrawingProject) {
      setProjectDrawingsList([])
      setLoadingDrawings(false)
      return
    }

    const loadRealDrawings = async () => {
      setLoadingDrawings(true)
      try {
        const pId = selectedDrawingProject.id || selectedDrawingProject.projectCode
        const pCode = selectedDrawingProject.projectCode || deriveProjectCodeFromName(selectedDrawingProject.companyName || selectedDrawingProject.company, pId)
        const company = selectedDrawingProject.companyName || selectedDrawingProject.company || ''

        let apiDrawings: any[] = []
        try {
          const res = await api.get(`/projects/${pId}/drawings`)
          if (res.data?.success && Array.isArray(res.data.data)) {
            apiDrawings = res.data.data
          }
        } catch (err) {
          console.warn('API project drawings fetch note:', err)
        }

        let registeredDrawings: any[] = []
        try {
          const rawReg = localStorage.getItem('registered_drawings')
          if (rawReg) {
            const allReg = JSON.parse(rawReg)
            const validCodes = new Set(
              [pId, pCode, company]
                .filter(Boolean)
                .map(s => String(s).trim().toLowerCase())
            )

            registeredDrawings = allReg.filter((item: any) => {
              const itemPrj = String(item.projectCode || item.project || item.projectId || '').trim().toLowerCase()
              if (!itemPrj) return true
              return Array.from(validCodes).some(code => itemPrj === code || itemPrj.includes(code) || code.includes(itemPrj))
            })
          }
        } catch { }

        let projectKeyedDrawings: any[] = []
        try {
          const rawKeyed = localStorage.getItem(`ssa_drawings_${pCode}`) || localStorage.getItem(`ssa_drawings_${pId}`)
          if (rawKeyed) {
            projectKeyedDrawings = JSON.parse(rawKeyed)
          }
        } catch { }

        const mergedMap = new Map()
          ;[...apiDrawings, ...registeredDrawings, ...projectKeyedDrawings].forEach((dwg: any) => {
            const key = dwg.id || dwg.drawingNumber || dwg.drawingCode
            if (key) mergedMap.set(key, dwg)
          })

        setProjectDrawingsList(Array.from(mergedMap.values()))
      } finally {
        setLoadingDrawings(false)
      }
    }

    if (selectedDrawingProject) {
      const pCode = selectedDrawingProject.projectCode || selectedDrawingProject.id
      try {
        const stored = JSON.parse(localStorage.getItem(`ssa_subfolders_${pCode}`) || '[]')
        setSubFoldersList(Array.isArray(stored) ? stored : [])
      } catch {
        setSubFoldersList([])
      }
      setSelectedDrawingSubFolder(null)
    } else {
      setSubFoldersList([])
      setSelectedDrawingSubFolder(null)
    }

    loadRealDrawings()
  }, [selectedDrawingProject])

  // Fetch all CRM Data (Clients, Leads, Employees, Projects, Master Disciplines)
  const fetchData = async () => {
    setLoadingData(true)
    try {
      const [clientsRes, leadsRes, empRes, projRes, discRes] = await Promise.allSettled([
        api.get('/clients'),
        api.get('/leads'),
        api.get('/employees'),
        api.get('/projects'),
        api.get('/disciplines')
      ])

      // Master Disciplines from Database
      if (discRes.status === 'fulfilled' && discRes.value.data?.success && Array.isArray(discRes.value.data.data)) {
        setMasterDisciplines(discRes.value.data.data)
      }

      // 1. Employees
      if (empRes.status === 'fulfilled' && empRes.value.data) {
        const rawEmps = empRes.value.data?.data || empRes.value.data || []
        setEmployeesList(Array.isArray(rawEmps) ? rawEmps : [])
      }

      // 2. Clients
      if (clientsRes.status === 'fulfilled' && clientsRes.value.data?.success && Array.isArray(clientsRes.value.data.data)) {
        setClients(clientsRes.value.data.data)
      } else {
        setClients([])
      }

      // 3. Projects
      if (projRes.status === 'fulfilled' && projRes.value.data?.success) {
        const rawProjs = projRes.value.data.data || []
        setProjectsList(Array.isArray(rawProjs) ? rawProjs : [])
      } else {
        setProjectsList([])
      }

      // 4. Leads & Opportunities
      if (leadsRes.status === 'fulfilled' && leadsRes.value.data?.success) {
        const raw = leadsRes.value.data.data || []

        const allLeads = raw.filter((l: any) => (l.status || '').toLowerCase() !== 'lost')
        const mappedLeads: Lead[] = allLeads.map((l: any) => {
          const isConverted = ['won', 'converted'].includes((l.status || '').toLowerCase())
          const isDraft = (l.status || '').toLowerCase() === 'draft'
          return {
            id: l.leadId || `LD-${l.id}`,
            dbId: l.id,
            clientId: l.clientId,
            leadName: l.leadTitle || l.projectName || 'Unnamed Project',
            company: l.company || l.organisation || 'No Company',
            contactPerson: l.contactPerson || l.clientName || 'No Contact',
            mobile: l.mobile || '',
            email: l.email || '',
            source: l.leadSource || 'Other',
            assignedTo: l.assignedEmployee || 'Unassigned',
            assignedEmployee: l.assignedEmployee || 'Unassigned',
            status: isConverted ? 'Converted' : isDraft ? 'Draft' : (l.status || 'New Lead'),
            projectType: l.projectType || l.leadCategory || '',
            estimatedBudget: l.estimatedBudget || '',
            siteAddress: l.siteAddress || '',
            city: l.city || '',
            state: l.state || '',
            country: l.country || '',
            branch: l.branch || '',
            rawLead: l
          }
        })
        setLeads(mappedLeads)

        const oppLeads = raw.filter((l: any) =>
          ['contacted', 'requirement collection', 'proposal sent', 'negotiation'].includes((l.status || '').toLowerCase())
        )
        const mappedOpps: Opportunity[] = oppLeads.map((opp: any) => {
          const budgetNum = parseFloat((opp.estimatedBudget || '').replace(/[^0-9.]/g, '')) || 0
          let prob = 30
          let stage: Opportunity['stage'] = 'Presentation'
          const statusLower = (opp.status || '').toLowerCase()
          if (statusLower === 'proposal sent') {
            prob = 50
            stage = 'Proposal Preparation'
          } else if (statusLower === 'negotiation') {
            prob = 80
            stage = 'Contract Negotiation'
          } else if (statusLower === 'requirement collection') {
            prob = 40
            stage = 'Proposal Preparation'
          } else if (statusLower === 'contacted') {
            prob = 25
            stage = 'Presentation'
          }
          return {
            id: `OPP-${opp.id}`,
            leadId: opp.leadId || `LD-${opp.id}`,
            leadName: opp.leadTitle || opp.projectName || 'Unnamed Project',
            company: opp.company || opp.organisation || 'No Company',
            opportunityValue: budgetNum,
            probability: prob,
            expectedClosureDate: opp.expectedCompletionDate || 'TBD',
            stage
          }
        })
        setOpportunities(mappedOpps)
      }
    } catch (err) {
      console.error('Failed to fetch CRM data:', err)
    } finally {
      setLoadingData(false)
    }
  }

  // ── Client Actions ──────────────────────────────────────────────────────────
  const openCreateClientModal = () => {
    setEditingClient(null)
    resetClient({
      clientName: '',
      company: '',
      contactPerson: '',
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
      clientType: 'Corporate',
      status: 'Active',
      remarks: ''
    })
    setIsClientModalOpen(true)
  }

  const openEditClientModal = (c: Client) => {
    setEditingClient(c)
    resetClient({
      clientName: c.clientName || '',
      company: c.company || '',
      contactPerson: c.contactPerson || '',
      mobile: c.mobile || '',
      alternatePhone: c.alternatePhone || '',
      email: c.email || '',
      address: c.address || c.siteAddress || '',
      city: c.city || '',
      state: c.state || '',
      country: c.country || 'India',
      pincode: c.pincode || '',
      gstNo: c.gstNo || '',
      panNo: c.panNo || '',
      aadharNo: c.aadharNo || '',
      clientType: c.clientType || 'Corporate',
      status: c.status || 'Active',
      remarks: c.remarks || ''
    })
    setIsClientModalOpen(true)
  }

  const onSubmitClient = async (data: ClientFormInputs) => {
    const cleanMobile = (data.mobile || '').replace(/\D/g, '')
    const existingWithMobile = clients.find(c => {
      if (editingClient && c.id === editingClient.id) return false
      const cMobileClean = (c.mobile || '').replace(/\D/g, '')
      return (cMobileClean && cMobileClean === cleanMobile) || (c.mobile && c.mobile.trim() === data.mobile.trim())
    })

    if (existingWithMobile) {
      const alertMsg = `A client with mobile number "${data.mobile}" already exists in the system (${existingWithMobile.clientName} - ${existingWithMobile.clientCode || 'Existing Client'}).`
      showToast('error', alertMsg)
      return
    }

    setClientSubmitting(true)
    try {
      if (editingClient) {
        const res = await api.put(`/clients/${editingClient.id}`, data)
        if (res.data?.success) {
          showToast('success', `Client "${data.clientName}" updated successfully!`)
        }
      } else {
        const res = await api.post('/clients', data)
        if (res.data?.success) {
          showToast('success', `Client "${data.clientName}" created successfully!`)
        }
      }
      setIsClientModalOpen(false)
      fetchData()
    } catch (err: any) {
      console.error('Save client error:', err)
      const errorMsg = err.response?.data?.message || err.message || 'Failed to save client.'
      showToast('error', errorMsg)
    } finally {
      setClientSubmitting(false)
    }
  }

  const handleDeleteClient = (id: string, name: string) => {
    setDeleteConfirm({ type: 'client', id, name })
  }

  const openClient360 = async (c: Client) => {
    try {
      const res = await api.get(`/clients/${c.id}`)
      if (res.data?.success && res.data?.data) {
        setClient360(res.data.data)
      } else {
        setClient360(c)
      }
    } catch {
      setClient360(c)
    }
    setClient360Tab('leads')
  }

  // ── Lead Deletion ────────────────────────────────────────────────────────────
  const deleteLead = (id: string) => {
    const lead = leads.find(l => l.id === id)
    if (!lead) return
    setDeleteConfirm({ type: 'lead', id, name: lead.leadName || lead.company || lead.id })
  }

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return
    setDeleteLoading(true)
    if (deleteConfirm.type === 'client') {
      try {
        const res = await api.delete(`/clients/${deleteConfirm.id}`)
        if (res.data?.success) {
          showToast('success', `Client "${deleteConfirm.name}" deleted successfully.`)
          setClients(prev => prev.filter(c => c.id !== deleteConfirm.id))
        } else {
          showToast('error', res.data?.message || 'Failed to delete client.')
        }
      } catch (err: any) {
        showToast('error', err.response?.data?.message || 'Error deleting client.')
      } finally {
        setDeleteLoading(false)
        setDeleteConfirm(null)
      }
    } else if (deleteConfirm.type === 'lead') {
      const lead = leads.find(l => l.id === deleteConfirm.id)
      try {
        if (lead?.dbId) {
          const response = await api.delete(`/leads/${lead.dbId}`)
          if (response.data?.success) {
            setLeads(leads.filter(l => l.id !== deleteConfirm.id))
            showToast('success', `Lead "${deleteConfirm.name}" deleted successfully.`)
          } else {
            showToast('error', response.data?.message || 'Failed to delete lead.')
          }
        } else {
          setLeads(leads.filter(l => l.id !== deleteConfirm.id))
          showToast('success', `Lead "${deleteConfirm.name}" deleted.`)
        }
      } catch (err: any) {
        console.error('Error deleting lead:', err)
        showToast('error', err.response?.data?.message || 'Error deleting lead.')
      } finally {
        setDeleteLoading(false)
        setDeleteConfirm(null)
      }
    }
  }

  // ── Lead Conversion Workflow ────────────────────────────────────────────────
  const initiateConvertWorkflow = (lead: Lead) => {
    if ((lead.status || '').toLowerCase() === 'draft') {
      showToast('error', 'Draft leads cannot be converted into projects. Please edit and submit the lead details first.')
      return
    }

    const rawBudget = (lead as any).estimatedBudget || ''
    const parsed = parseFloat(String(rawBudget).replace(/[^0-9.]/g, ''))
    setContractValue(isNaN(parsed) || parsed === 0 ? '18000000' : String(parsed))
    setConvertAssignedEmployee(lead.assignedEmployee || lead.assignedTo || '')

    const autoPrefix = deriveProjectCodeFromName(lead.company && lead.company !== 'No Company' ? lead.company : lead.leadName, lead.id)
    setConvertProjectPrefix(autoPrefix || 'GVR')
    setSelectedFloors(['GF', '01', '02', '03', '04', 'TR'])
    setSelectedDisciplines([])
    setConvertingLead(lead)
  }

  const handleConvertConfirm = async () => {
    if (!convertingLead) return
    const value = parseFloat(contractValue) || 0
    const leadName = convertingLead.leadName || convertingLead.company
    const pPrefix = (convertProjectPrefix || 'GVR').toUpperCase().replace(/[^A-Z0-9]/g, '')

    setConvertLoading(true)
    try {
      let createdProj: any = null
      if (convertingLead) {
        try {
          const res = await api.post('/projects', {
            projectName: leadName,
            projectPrefix: pPrefix,
            clientName: convertingLead.contactPerson || convertingLead.company || convertingLead.leadName,
            clientId: convertingLead.clientId || (convertingLead.rawLead && convertingLead.rawLead.clientId),
            companyId: (user as any)?.companyId || (user as any)?.userId || 'COM-001',
            projectType: convertingLead.projectType || 'Commercial',
            floors: selectedFloors,
            disciplines: selectedDisciplines
          }, { timeout: 25000 })
          if (res.data?.success) {
            createdProj = res.data.data
          }
        } catch (projErr: any) {
          console.warn('[CRM] Project creation API notice:', projErr.message || projErr)
        }
      }

      if (convertingLead.dbId) {
        try {
          await api.put(`/leads/${convertingLead.dbId}`, {
            status: 'Converted',
            estimatedBudget: String(value),
            assignedEmployee: convertAssignedEmployee || convertingLead.assignedEmployee || convertingLead.assignedTo
          }, { timeout: 25000 })
        } catch (apiErr: any) {
          console.warn('[CRM] Backend lead convert API notice:', apiErr.message || apiErr)
        }
      }

      showToast('success', `Lead "${leadName}" successfully converted to Active Project!`)
      setConvertingLead(null)
      await fetchData()

      setActiveTab('drawings')
      if (createdProj) {
        const rawDisc = (createdProj.disciplines && Array.isArray(createdProj.disciplines))
          ? createdProj.disciplines.map((d: any) => typeof d === 'string' ? d : d.code || d.disciplineCode)
          : selectedDisciplines
        setSelectedDrawingProject({
          id: createdProj.id || createdProj.projectCode,
          projectCode: createdProj.projectCode,
          companyName: createdProj.projectName || leadName,
          repName: createdProj.clientName,
          disciplines: rawDisc
        })
      }
    } catch (err: any) {
      console.error('Convert error:', err)
      showToast('error', 'Failed to complete lead conversion.')
    } finally {
      setConvertLoading(false)
    }
  }

  // ── Master Discipline & Project Folder Creation ──────────────────────────────
  const handleSaveMasterDiscipline = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const code = masterDisciplineForm.code.toUpperCase().trim()
    const name = masterDisciplineForm.name.trim()
    if (!code || !name) {
      alert('Please provide both Discipline Code and Discipline Name.')
      return
    }

    setSavingMasterDiscipline(true)
    try {
      const res = await api.post('/disciplines', {
        code,
        name,
        description: masterDisciplineForm.description || `${name} documentation and drawings`
      })

      if (res.data?.success) {
        const savedDisc = res.data.data
        setMasterDisciplines(prev => {
          const exists = prev.some(d => d.code === code)
          if (exists) return prev.map(d => d.code === code ? savedDisc : d)
          return [...prev, savedDisc]
        })

        // If currently inside a project folder, auto-add as a project folder too
        if (selectedDrawingProject) {
          try {
            const pId = selectedDrawingProject.id || selectedDrawingProject.projectCode
            await api.post(`/projects/${pId}/disciplines`, { disciplineCode: code })
            const currentDisc: string[] = selectedDrawingProject.disciplines || []
            if (!currentDisc.includes(code)) {
              setSelectedDrawingProject({
                ...selectedDrawingProject,
                disciplines: [...currentDisc, code]
              })
            }
          } catch (projErr) {
            console.warn('Auto add folder note:', projErr)
          }
        }

        showToast('success', `Discipline "${code} — ${name}" saved to Database!`)
        setIsNewMasterDisciplineModalOpen(false)
        setIsAddDisciplineModalOpen(false)
        setMasterDisciplineForm({ code: '', name: '', description: '' })
      }
    } catch (err: any) {
      console.error('Error saving discipline to master DB:', err)
      showToast('error', err.response?.data?.message || 'Failed to save discipline to DB.')
    } finally {
      setSavingMasterDiscipline(false)
    }
  }

  const handleAddDiscipline = async () => {
    if (!selectedDrawingProject) return

    let code = newDisciplineCode.toUpperCase().trim()
    let name = ''

    if (newDisciplineCode === 'CUSTOM') {
      code = customDisciplineCode.toUpperCase().trim()
      name = customDisciplineName.trim() || code
      if (!code) {
        alert('Please enter a valid Discipline Code.')
        return
      }

      // Save custom discipline to master DB first
      try {
        await api.post('/disciplines', {
          code,
          name,
          description: customDisciplineDesc || `${name} documentation and drawings`
        })
        setMasterDisciplines(prev => {
          if (prev.some(d => d.code === code)) return prev
          return [...prev, { code, name, description: customDisciplineDesc }]
        })
      } catch (masterErr) {
        console.warn('Save custom discipline master note:', masterErr)
      }
    }

    setAddingDiscipline(true)
    try {
      const pId = selectedDrawingProject.id || selectedDrawingProject.projectCode
      try {
        await api.post(`/projects/${pId}/disciplines`, {
          disciplineCode: code
        })
      } catch (err: any) {
        console.warn('API add discipline note:', err.message || err)
      }

      const currentDisc: string[] = selectedDrawingProject.disciplines || []
      if (!currentDisc.includes(code)) {
        const updatedDisc = [...currentDisc, code]
        setSelectedDrawingProject({
          ...selectedDrawingProject,
          disciplines: updatedDisc
        })
      }

      showToast('success', `Discipline folder "${code}" created successfully!`)
      setIsAddDisciplineModalOpen(false)
      setCustomDisciplineCode('')
      setCustomDisciplineName('')
      setCustomDisciplineDesc('')
    } catch (err: any) {
      console.error('Failed to add discipline:', err)
      showToast('error', 'Failed to create discipline folder.')
    } finally {
      setAddingDiscipline(false)
    }
  }



  const filteredClients = clients.filter(c => {
    const matchesSearch = !clientSearch ||
      (c.clientName || '').toLowerCase().includes(clientSearch.toLowerCase()) ||
      (c.company || '').toLowerCase().includes(clientSearch.toLowerCase()) ||
      (c.clientCode || '').toLowerCase().includes(clientSearch.toLowerCase()) ||
      (c.email || '').toLowerCase().includes(clientSearch.toLowerCase()) ||
      (c.mobile || '').toLowerCase().includes(clientSearch.toLowerCase()) ||
      (c.city || '').toLowerCase().includes(clientSearch.toLowerCase())

    const matchesType = clientTypeFilter === 'ALL' || (c.clientType || '').toLowerCase() === clientTypeFilter.toLowerCase()
    return matchesSearch && matchesType
  })

  const filteredLeads = leads
    .filter(l => {
      if (!leadSearch) return true
      return (l.leadName || '').toLowerCase().includes(leadSearch.toLowerCase()) ||
        (l.company || '').toLowerCase().includes(leadSearch.toLowerCase()) ||
        (l.contactPerson || '').toLowerCase().includes(leadSearch.toLowerCase()) ||
        (l.id || '').toLowerCase().includes(leadSearch.toLowerCase())
    })
    .sort((a, b) => {
      const aConverted = ['won', 'converted'].includes((a.status || '').toLowerCase()) ? 1 : 0
      const bConverted = ['won', 'converted'].includes((b.status || '').toLowerCase()) ? 1 : 0
      if (aConverted !== bConverted) {
        return aConverted - bConverted
      }
      return 0
    })

  return (
    <div className="space-y-6 animate-fade-in text-slate-800 dark:text-slate-100">
      {/* Toast Banner */}
      {toast && (
        <div className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold shadow-lg animate-fade-in ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
          }`}>
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="p-1 hover:opacity-80"><XCircle className="w-4 h-4" /></button>
        </div>
      )}

      {/* Top Header & Context Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-brand-primary/10 text-brand-primary text-xs font-extrabold uppercase tracking-wider">
              Client & Project Pipeline
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-brand-charcoal dark:text-white tracking-tight mt-1">
            CRM Workspace
          </h1>
          <p className="text-xs text-brand-gray mt-0.5 leading-relaxed">
            Architecture Workflow: First register <strong>Client</strong> → Create <strong>Leads/Requirements</strong> → Convert to <strong>Project & MDL</strong>.
          </p>
        </div>

        {/* Action Buttons in Header */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap shrink-0">
          {activeTab === 'clients' && (
            <button
              onClick={openCreateClientModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/95 text-xs font-extrabold text-white shadow-md shadow-brand-primary/20 transition-all duration-200 cursor-pointer active:scale-95 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" /> Create Client
            </button>
          )}

          {activeTab === 'leads' && (
            <>
              {(user?.role === 'Company' || user?.role === 'Super Admin') && (
                <button
                  type="button"
                  onClick={() => navigate('/crm/leads/categories-questions')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 transition-all duration-200 cursor-pointer shadow-xs whitespace-nowrap"
                >
                  <Layers className="w-4 h-4 text-brand-primary" /> Manage Categories & Questions
                </button>
              )}

              <button
                onClick={() => navigate('/crm/leads/create')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary text-xs font-extrabold text-white shadow-md shadow-brand-primary/20 transition-all duration-200 cursor-pointer whitespace-nowrap active:scale-95"
              >
                <Plus className="w-4 h-4" /> Create Lead
              </button>
            </>
          )}
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════════
          TAB 1: CLIENTS VIEW (First-Class Root Entity)
      ═════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'clients' && (
        loadingData ? (
          <div className="py-16 flex flex-col justify-center items-center gap-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm animate-fade-in">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-brand-primary/20 animate-ping" />
              <div className="w-10 h-10 border-4 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin" />
            </div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Loading Clients Directory...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  placeholder="Search client, company, email, city..."
                  className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-800 dark:text-white font-medium"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Type:</span>
                <select
                  value={clientTypeFilter}
                  onChange={(e) => setClientTypeFilter(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-800 dark:text-white cursor-pointer"
                >
                  <option value="ALL">All Client Types</option>
                  <option value="Corporate">Corporate</option>
                  <option value="Individual Developer">Individual Developer</option>
                  <option value="Institutional">Institutional</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Government">Government</option>
                </select>
              </div>
            </div>

            {/* Clients Table */}
            <div className="glass-card rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs bg-white dark:bg-slate-900">
              <div className="overflow-x-auto">
                <table className="min-w-[960px] w-full text-left text-xs text-brand-charcoal dark:text-slate-200">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                      <th className="p-3.5 sm:p-4 font-semibold whitespace-nowrap">Client Code</th>
                      <th className="p-3.5 sm:p-4 font-semibold whitespace-nowrap">Client / Company Name</th>
                      <th className="p-3.5 sm:p-4 font-semibold whitespace-nowrap">Primary Contact</th>
                      <th className="p-3.5 sm:p-4 font-semibold whitespace-nowrap">Type & Location</th>
                      <th className="p-3.5 sm:p-4 font-semibold text-center whitespace-nowrap">Project Leads</th>
                      <th className="p-3.5 sm:p-4 font-semibold text-center whitespace-nowrap">Active Projects</th>
                      <th className="p-3.5 sm:p-4 font-semibold whitespace-nowrap">Status</th>
                      <th className="p-3.5 sm:p-4 font-semibold text-right whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                    {filteredClients.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-12 text-center text-slate-400 font-semibold">
                          <Building className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                          <p className="text-sm font-bold text-slate-600 dark:text-slate-400">No Clients Found</p>
                          <p className="text-xs text-slate-400 mt-0.5">Click "+ Create Client" to register the first client account.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredClients.map((c) => {
                        const leadsCount = c.leadsCount ?? (c.leads ? c.leads.length : 0)
                        const projectsCount = c.projectsCount ?? (c.projects ? c.projects.length : 0)

                        return (
                          <tr key={c.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="p-3.5 sm:p-4 font-mono font-bold text-brand-primary whitespace-nowrap">
                              {c.clientCode || c.id}
                            </td>
                            <td className="p-3.5 sm:p-4 min-w-[180px]">
                              <div className="space-y-0.5">
                                <p className="font-extrabold text-slate-900 dark:text-white text-xs">{c.clientName}</p>
                                {c.company && (
                                  <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-semibold">
                                    <Building className="w-3 h-3 text-slate-400 shrink-0" /> <span className="truncate">{c.company}</span>
                                  </p>
                                )}
                              </div>
                            </td>
                            <td className="p-3.5 sm:p-4 space-y-0.5 text-slate-600 dark:text-slate-300 min-w-[160px] whitespace-nowrap">
                              {c.contactPerson && <p className="font-semibold text-slate-800 dark:text-white">{c.contactPerson}</p>}
                              {c.mobile && <p className="flex items-center gap-1 text-[11px]"><Phone className="w-3 h-3 text-brand-primary shrink-0" /> {c.mobile}</p>}
                              {c.email && <p className="flex items-center gap-1 text-[11px]"><Mail className="w-3 h-3 text-brand-primary shrink-0" /> {c.email}</p>}
                            </td>
                            <td className="p-3.5 sm:p-4 min-w-[140px]">
                              <div className="space-y-1">
                                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 whitespace-nowrap">
                                  {c.clientType || 'Corporate'}
                                </span>
                                {(c.city || c.state) && (
                                  <p className="text-[10px] text-slate-400 flex items-center gap-1 whitespace-nowrap">
                                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" /> {[c.city, c.state].filter(Boolean).join(', ')}
                                  </p>
                                )}
                              </div>
                            </td>
                            <td className="p-3.5 sm:p-4 text-center whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                {leadsCount} {leadsCount === 1 ? 'Lead' : 'Leads'}
                              </span>
                            </td>
                            <td className="p-3.5 sm:p-4 text-center whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                {projectsCount} {projectsCount === 1 ? 'Project' : 'Projects'}
                              </span>
                            </td>
                            <td className="p-3.5 sm:p-4 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${(c.status || 'Active').toLowerCase() === 'active'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
                                }`}>
                                {c.status || 'Active'}
                              </span>
                            </td>
                            <td className="p-3.5 sm:p-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* Quick Create Lead for this Client */}
                                <button
                                  onClick={() => navigate(`/crm/leads/create?clientId=${c.id}`)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-brand-primary/10 hover:bg-brand-primary text-brand-primary hover:text-white border border-brand-primary/20 text-[11px] font-extrabold transition-all cursor-pointer shadow-xs whitespace-nowrap"
                                  title="Add new requirement/lead for this Client"
                                >
                                  <Plus className="w-3.5 h-3.5" /> New Lead
                                </button>
                                {/* Client 360 View */}
                                <button
                                  onClick={() => openClient360(c)}
                                  className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-brand-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                  title="View Client 360 & Project History"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                {/* Edit Client */}
                                <button
                                  onClick={() => openEditClientModal(c)}
                                  className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                  title="Edit Client Info"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                {/* Delete Client */}
                                <button
                                  onClick={() => handleDeleteClient(c.id, c.clientName)}
                                  className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-500/10 transition-colors cursor-pointer"
                                  title="Delete Client"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )
      )}

      {/* ═════════════════════════════════════════════════════════════════════════
          TAB 2: LEADS VIEW (Project Requirements per Client)
      ═════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'leads' && (
        loadingData ? (
          <div className="py-16 flex flex-col justify-center items-center gap-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm animate-fade-in">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-brand-primary/20 animate-ping" />
              <div className="w-10 h-10 border-4 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin" />
            </div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Loading Leads...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={leadSearch}
                  onChange={(e) => setLeadSearch(e.target.value)}
                  placeholder="Search lead title, client, owner..."
                  className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-800 dark:text-white font-medium"
                />
              </div>
            </div>

            <div className="glass-card rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
              <div className="overflow-x-auto">
                <table className="min-w-[900px] w-full text-left text-xs text-brand-charcoal dark:text-slate-200">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                      <th className="p-3.5 sm:p-4 font-semibold whitespace-nowrap">Lead ID</th>
                      <th className="p-3.5 sm:p-4 font-semibold whitespace-nowrap">Project Requirement</th>
                      <th className="p-3.5 sm:p-4 font-semibold whitespace-nowrap">Associated Client</th>
                      <th className="p-3.5 sm:p-4 font-semibold whitespace-nowrap">Source</th>
                      <th className="p-3.5 sm:p-4 font-semibold whitespace-nowrap">Assigned Staff</th>
                      <th className="p-3.5 sm:p-4 font-semibold whitespace-nowrap">Pipeline Status</th>
                      <th className="p-3.5 sm:p-4 font-semibold text-right whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {filteredLeads.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400 font-semibold">
                          No active leads available. Click "+ Create Lead" to begin requirement capture.
                        </td>
                      </tr>
                    ) : (
                      filteredLeads.map((l) => (
                        <tr key={l.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="p-3.5 sm:p-4 font-mono font-bold text-brand-primary whitespace-nowrap">{l.id}</td>
                          <td className="p-3.5 sm:p-4 min-w-[180px]">
                            <div className="space-y-0.5">
                              <span className="font-extrabold text-slate-900 dark:text-white">{l.leadName}</span>
                              {l.projectType && <p className="text-[10px] text-brand-primary font-bold">{l.projectType}</p>}
                            </div>
                          </td>
                          <td className="p-3.5 sm:p-4 space-y-0.5 text-slate-600 dark:text-slate-300 min-w-[160px] whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="font-bold text-slate-800 dark:text-white truncate">{l.contactPerson || l.company}</span>
                            </div>
                            {l.mobile && <p className="text-[11px] text-slate-500">{l.mobile}</p>}
                          </td>
                          <td className="p-3.5 sm:p-4 whitespace-nowrap">{l.source}</td>
                          <td className="p-3.5 sm:p-4 font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">{l.assignedTo}</td>
                          <td className="p-3.5 sm:p-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${['won', 'converted', 'qualified'].includes((l.status || '').toLowerCase())
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                : (l.status || '').toLowerCase() === 'draft'
                                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700'
                                  : ['negotiation', 'proposal sent', 'requirement collection'].includes((l.status || '').toLowerCase())
                                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                                    : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                                }`}
                            >
                              {['won', 'converted'].includes((l.status || '').toLowerCase()) ? 'Converted' : l.status}
                            </span>
                          </td>
                          <td className="p-3.5 sm:p-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {['won', 'converted'].includes((l.status || '').toLowerCase()) ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-extrabold border border-emerald-500/20">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Converted
                                </span>
                              ) : (l.status || '').toLowerCase() === 'draft' ? (
                                <button
                                  type="button"
                                  onClick={() => navigate(`/crm/leads/edit/${l.dbId}`)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-bold border border-slate-300 dark:border-slate-600 transition-all cursor-pointer shadow-xs active:scale-95 whitespace-nowrap"
                                  title="Draft Lead: Complete and submit this lead before converting to project"
                                >
                                  <Edit2 className="w-3.5 h-3.5 text-[#33a18a]" /> Complete Lead
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => initiateConvertWorkflow(l)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-[11px] font-extrabold text-white transition-all cursor-pointer shadow-xs active:scale-95 whitespace-nowrap"
                                  title="Convert Lead into Project"
                                >
                                  <UserCheck className="w-3.5 h-3.5" /> Convert to Project
                                </button>
                              )}
                              <button
                                onClick={() => setSelectedLeadDetails(l.rawLead || l)}
                                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-brand-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                title="View Lead Brief"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => navigate(`/crm/leads/edit/${l.dbId}`)}
                                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                title="Edit Lead Details"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteLead(l.id)}
                                className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-500/10 transition-colors cursor-pointer"
                                title="Delete Lead"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )
      )}

      {/* ═════════════════════════════════════════════════════════════════════════
          TAB 3: OPPORTUNITIES VIEW
      ═════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'opportunities' && (
        <div className="glass-card rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
          <div className="overflow-x-auto">
            <table className="min-w-[850px] w-full text-left text-xs text-brand-charcoal dark:text-slate-200">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="p-3.5 sm:p-4 font-semibold whitespace-nowrap">Deal ID</th>
                  <th className="p-3.5 sm:p-4 font-semibold whitespace-nowrap">Opportunity Name</th>
                  <th className="p-3.5 sm:p-4 font-semibold whitespace-nowrap">Client / Account</th>
                  <th className="p-3.5 sm:p-4 font-semibold whitespace-nowrap">Est. Deal Value</th>
                  <th className="p-3.5 sm:p-4 font-semibold whitespace-nowrap">Win Probability</th>
                  <th className="p-3.5 sm:p-4 font-semibold whitespace-nowrap">Expected Closure</th>
                  <th className="p-3.5 sm:p-4 font-semibold whitespace-nowrap">Deal Stage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {opportunities.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 font-semibold">
                      No active negotiation deals.
                    </td>
                  </tr>
                ) : (
                  opportunities.map((opp) => (
                    <tr key={opp.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 sm:p-4 font-mono font-bold text-brand-primary whitespace-nowrap">{opp.id}</td>
                      <td className="p-3.5 sm:p-4 font-extrabold text-slate-900 dark:text-white min-w-[160px]">{opp.leadName}</td>
                      <td className="p-3.5 sm:p-4 text-slate-600 dark:text-slate-300 min-w-[140px] whitespace-nowrap">{opp.company}</td>
                      <td className="p-3.5 sm:p-4 font-extrabold text-brand-charcoal dark:text-white whitespace-nowrap">
                        ₹{(opp.opportunityValue / 100000).toFixed(1)} Lakhs
                      </td>
                      <td className="p-3.5 sm:p-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-brand-primary h-full rounded-full" style={{ width: `${opp.probability}%` }} />
                          </div>
                          <span className="font-extrabold text-slate-800 dark:text-white">{opp.probability}%</span>
                        </div>
                      </td>
                      <td className="p-3.5 sm:p-4 text-slate-500 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                          <span>{opp.expectedClosureDate}</span>
                        </div>
                      </td>
                      <td className="p-3.5 sm:p-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] bg-brand-primary/10 text-brand-primary font-bold border border-brand-primary/20">
                          {opp.stage}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════════
          TAB 4: DRAWINGS EXPLORER VIEW (Only for Converted Active Projects)
      ═════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'drawings' && (
        (loadingData || loadingDrawings) ? (
          <div className="p-16 flex flex-col items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-4 animate-fade-in my-6">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 animate-ping" />
              <div className="w-14 h-14 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
              <Folder className="w-6 h-6 text-amber-500 absolute" />
            </div>
            <p className="text-sm font-extrabold text-slate-900 dark:text-white tracking-wide">Loading Drawings & Project Folders...</p>
          </div>
        ) : selectedDrawingProject ? (
          <div className="space-y-6">
            {/* Header & Breadcrumb */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl shadow-sm">
              <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                <button
                  onClick={() => {
                    if (selectedWorkflowStage !== null) {
                      setSelectedWorkflowStage(null)
                    } else if (drawingDisciplineFilter !== 'ALL') {
                      setDrawingDisciplineFilter('ALL')
                    } else {
                      setSelectedDrawingProject(null)
                    }
                  }}
                  className="p-2 sm:p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 transition-colors cursor-pointer shrink-0"
                  title="Back"
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] sm:text-xs font-mono font-extrabold shrink-0">
                      {selectedDrawingProject.projectCode}
                    </span>
                    <h2 className="text-sm sm:text-lg font-extrabold text-brand-charcoal dark:text-white truncate">
                      {selectedDrawingProject.companyName}
                    </h2>
                  </div>
                  <p className="text-[10px] sm:text-xs text-brand-gray mt-0.5 flex items-center gap-1.5 flex-wrap">
                    <span>Folder:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setDrawingDisciplineFilter('ALL')
                        setSelectedWorkflowStage(null)
                        setSelectedDrawingSubFolder(null)
                      }}
                      className={`font-mono font-bold hover:underline cursor-pointer ${drawingDisciplineFilter === 'ALL' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-600 dark:text-slate-300'}`}
                    >
                      All Disciplines
                    </button>
                    {drawingDisciplineFilter !== 'ALL' && (
                      <>
                        <span className="text-slate-400">/</span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedWorkflowStage(null)
                            setSelectedDrawingSubFolder(null)
                          }}
                          className={`font-mono font-bold hover:underline cursor-pointer ${selectedWorkflowStage === null && selectedDrawingSubFolder === null ? 'text-amber-600 dark:text-amber-400' : 'text-slate-600 dark:text-slate-300'}`}
                        >
                          {drawingDisciplineFilter}
                        </button>
                      </>
                    )}
                    {selectedDrawingSubFolder !== null && (
                      <>
                        <span className="text-slate-400">/</span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedWorkflowStage(null)
                          }}
                          className={`font-mono font-bold hover:underline cursor-pointer ${selectedWorkflowStage === null ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'}`}
                        >
                          📁 {selectedDrawingSubFolder}
                        </button>
                      </>
                    )}
                    {selectedWorkflowStage !== null && (
                      <>
                        <span className="text-slate-400">/</span>
                        <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                          📂 {DRAWING_WORKFLOW_FOLDERS.find(f => f.id === selectedWorkflowStage)?.name || selectedWorkflowStage}
                        </span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full md:w-auto shrink-0">
                <div className="relative w-full sm:w-60">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-brand-gray" />
                  <input
                    type="text"
                    value={drawingsSearch}
                    onChange={(e) => setDrawingsSearch(e.target.value)}
                    placeholder="Search drawings..."
                    className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-brand-charcoal dark:text-white font-medium"
                  />
                </div>

                {drawingDisciplineFilter === 'ALL' && (
                  <button
                    type="button"
                    onClick={() => {
                      setNewDisciplineCode('AR')
                      setIsAddDisciplineModalOpen(true)
                    }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer whitespace-nowrap active:scale-95"
                  >
                    <FolderPlus className="w-4 h-4" /> Add Discipline Folder
                  </button>
                )}
              </div>
            </div>

            {/* Folder Grid - Level 1: All Disciplines */}
            {drawingDisciplineFilter === 'ALL' && !drawingsSearch && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Discipline Folders for {selectedDrawingProject.companyName}
                  </p>
                </div>

                {(!selectedDrawingProject.disciplines || selectedDrawingProject.disciplines.length === 0) ? (
                  <div className="p-8 sm:p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-xs space-y-3">
                    <Folder className="w-12 h-12 text-amber-500/40 mx-auto" />
                    <p className="text-sm font-extrabold text-slate-800 dark:text-white">No Discipline Folders in this Project</p>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Discipline folders were not pre-selected during lead conversion. Click below to create discipline folders manually.
                    </p>
                    <div className="flex items-center justify-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setNewDisciplineCode('AR')
                          setIsAddDisciplineModalOpen(true)
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer active:scale-95"
                      >
                        <Plus className="w-4 h-4" /> Create Discipline Folder
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-5">
                    {selectedDrawingProject.disciplines.map((code: string) => {
                      const masterItem = masterDisciplines.find(m => m.code === code)
                      const info = DISCIPLINE_CATALOG[code as DisciplineCode] || { name: masterItem?.name || code }
                      const displayName = masterItem?.name || info.name || code
                      const count = projectDrawingsList.filter(d => (d.discipline === code || d.disciplineCode === code) && hasDocOrImage(d)).length
                      return (
                        <div
                          key={code}
                          onClick={() => {
                            setDrawingDisciplineFilter(code)
                            setSelectedWorkflowStage(null)
                            setSelectedDrawingSubFolder(null)
                          }}
                          className="group relative flex flex-col items-center p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer text-center"
                        >
                          <Folder className="w-10 h-10 sm:w-12 sm:h-12 text-amber-500 fill-amber-500/20 mb-2 group-hover:scale-110 transition-transform shrink-0" />
                          <p className="font-extrabold text-[11px] sm:text-xs text-slate-800 dark:text-white break-words text-center leading-snug">{code} — {displayName}</p>
                          <span className="mt-1 text-[9px] sm:text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                            {count} Documents
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Level 2 & 3: Inside Discipline Folder -> Workflow Folders (for Drawings) or Custom Folders (for Non-Drawings) */}
            {(drawingDisciplineFilter !== 'ALL' || drawingsSearch) && (() => {
              const isDrawingFolder = isDrawingDiscipline(drawingDisciplineFilter)
              const nonDrawingMeta = PROJECT_17_FOLDERS.find(f => f.code === drawingDisciplineFilter)
              const activeCustomSubfolders = subFoldersList.filter(s => s.discipline === drawingDisciplineFilter)

              const disciplineDrawings = projectDrawingsList.filter(d => {
                const matchDisc = (drawingDisciplineFilter === 'ALL' || d.discipline === drawingDisciplineFilter || d.disciplineCode === drawingDisciplineFilter)
                if (!matchDisc) return false
                if (!hasDocOrImage(d)) return false
                if (selectedDrawingSubFolder) {
                  if (d.subFolder !== selectedDrawingSubFolder) return false
                }
                if (drawingsSearch) {
                  const s = drawingsSearch.toLowerCase()
                  const num = (d.drawingNumber || d.drawingCode || '').toLowerCase()
                  const title = (d.drawingTitle || d.title || '').toLowerCase()
                  return num.includes(s) || title.includes(s)
                }
                return true
              })

              // CASE A: NON-DRAWING FOLDERS (e.g. PI, SI, BQ, TD, SA, PS, CA, HO) - CUSTOM FOLDERS ONLY
              if (!isDrawingFolder && !drawingsSearch) {
                // When at root of non-drawing discipline (no subfolder opened)
                if (selectedDrawingSubFolder === null) {
                  return (
                    <div className="space-y-6">
                      {/* Top Bar for Non-Drawing Discipline */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                        <div>
                          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                            <Folder className="w-5 h-5 text-amber-500 fill-amber-500/20" />
                            <span>{nonDrawingMeta?.name || drawingDisciplineFilter}</span>
                          </h3>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {nonDrawingMeta?.description || 'Custom folders and project records.'}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={openAddDrawingModal}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer whitespace-nowrap active:scale-95"
                          >
                            <Plus className="w-4 h-4" /> Upload File
                          </button>
                        </div>
                      </div>

                      {/* Custom Subfolders Grid */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Custom Folders ({activeCustomSubfolders.length})
                          </p>
                          <span className="text-[11px] text-slate-400">
                            Create custom folders to organize documents
                          </span>
                        </div>

                        {activeCustomSubfolders.length === 0 ? (
                          <div className="p-8 sm:p-10 text-center bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl space-y-3">
                            <FolderPlus className="w-10 h-10 text-brand-primary/40 mx-auto" />
                            <p className="text-sm font-extrabold text-slate-800 dark:text-white">
                              No Custom Folders Created Yet
                            </p>
                            <p className="text-xs text-slate-400 max-w-sm mx-auto">
                              You can create customized folders for this section (e.g. Survey Reports, Photos, Vendor Files).
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setNewSubFolderName('')
                                setIsAddSubFolderModalOpen(true)
                              }}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-primary hover:bg-primary-600 text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer active:scale-95"
                            >
                              <FolderPlus className="w-4 h-4" />Create First Folder
                            </button>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {activeCustomSubfolders.map((sub) => {
                              const count = projectDrawingsList.filter(d =>
                                (d.discipline === drawingDisciplineFilter || d.disciplineCode === drawingDisciplineFilter) &&
                                d.subFolder === sub.name &&
                                hasDocOrImage(d)
                              ).length

                              return (
                                <div
                                  key={sub.id}
                                  onClick={() => setSelectedDrawingSubFolder(sub.name)}
                                  className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-brand-primary hover:shadow-xl shadow-xs transition-all duration-200 cursor-pointer flex flex-col justify-between group relative"
                                >
                                  <div>
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                      <Folder className="w-12 h-12 text-brand-primary fill-brand-primary/20 transition-transform group-hover:scale-110 shrink-0" />
                                      <div className="flex items-center gap-1.5">
                                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-extrabold border bg-brand-primary/10 text-brand-primary dark:text-primary-300 border-brand-primary/20">
                                          {count} {count === 1 ? 'File' : 'Files'}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            handleDeleteSubFolder(sub.id, sub.name)
                                          }}
                                          className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                          title="Delete Folder"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug">
                                      {sub.name}
                                    </h4>
                                  </div>

                                  <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                                    <span className="font-extrabold text-brand-primary dark:text-primary-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                                      Open Folder →
                                    </span>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>

                      {/* Direct / Root Documents in this Category (if any) */}
                      {disciplineDrawings.length > 0 && (
                        <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                          <div className="flex items-center justify-between">
                            <p className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                              All Documents in {drawingDisciplineFilter} ({disciplineDrawings.length})
                            </p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-4">
                            {disciplineDrawings.map((dwg) => {
                              const dwgId = dwg.id || dwg.drawingNumber || dwg.drawingCode
                              return (
                                <div
                                  key={dwgId}
                                  className="group relative flex flex-col justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-primary shadow-xs hover:shadow-lg transition-all duration-200 text-slate-800 dark:text-white"
                                >
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <FileText className="w-4 h-4 text-brand-primary shrink-0" />
                                      <p className="font-mono font-bold text-xs group-hover:text-brand-primary transition-colors truncate">
                                        {dwg.drawingNumber || dwg.drawingCode}
                                      </p>
                                    </div>
                                    <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mt-1 line-clamp-2">
                                      {dwg.drawingTitle || dwg.title}
                                    </p>
                                    <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2 mt-1.5 flex-wrap">
                                      {dwg.subFolder && <span className="text-brand-primary dark:text-primary-300 font-bold">📁 {dwg.subFolder}</span>}
                                      {dwg.originalFileName && <span className="text-slate-400 truncate">({dwg.originalFileName})</span>}
                                    </div>
                                  </div>

                                  <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                                    <button
                                      type="button"
                                      onClick={() => setPreviewDrawing(dwg)}
                                      className="w-full py-1.5 px-2.5 rounded-xl bg-brand-primary hover:bg-primary-600 text-white font-extrabold text-[10px] flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                      <span>View & Download</span>
                                    </button>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                }

                // Inside Selected Custom Subfolder
                return (
                  <div className="space-y-6">
                    {/* Non-Drawing Subfolder Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setSelectedDrawingSubFolder(null)}
                          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer text-xs font-bold flex items-center gap-1 shrink-0"
                          title={`Back to ${drawingDisciplineFilter} Folders`}
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>All Folders</span>
                        </button>

                        <div className="flex items-center gap-2.5">
                          <Folder className="w-7 h-7 text-brand-primary fill-brand-primary/20 shrink-0" />
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                                {selectedDrawingSubFolder}
                              </h3>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border bg-brand-primary/10 text-brand-primary dark:text-primary-300 border-brand-primary/20">
                                {disciplineDrawings.length} {disciplineDrawings.length === 1 ? 'Document' : 'Documents'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 line-clamp-1">
                              Inside {nonDrawingMeta?.name || drawingDisciplineFilter}
                            </p>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={openAddDrawingModal}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-brand-primary hover:bg-primary-600 text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer whitespace-nowrap active:scale-95"
                      >
                        <Plus className="w-4 h-4" /> Upload Document to Folder
                      </button>
                    </div>

                    {/* Non-Drawing Documents List */}
                    {disciplineDrawings.length === 0 ? (
                      <div className="p-8 sm:p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-xs space-y-3">
                        <FileText className="w-12 h-12 text-brand-primary/40 mx-auto" />
                        <p className="text-sm font-extrabold text-slate-800 dark:text-white">
                          No Documents in "{selectedDrawingSubFolder}" Yet
                        </p>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto">
                          Upload contracts, site reports, investigation files, or specifications into this folder.
                        </p>
                        <div className="flex items-center justify-center gap-3 pt-2">
                          <button
                            type="button"
                            onClick={openAddDrawingModal}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-primary-600 text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer active:scale-95"
                          >
                            <Plus className="w-4 h-4" /> Upload Document
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-4">
                        {disciplineDrawings.map((dwg) => {
                          const dwgId = dwg.id || dwg.drawingNumber || dwg.drawingCode
                          return (
                            <div
                              key={dwgId}
                              className="group relative flex flex-col justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-primary shadow-xs hover:shadow-lg transition-all duration-200 text-slate-800 dark:text-white"
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-brand-primary shrink-0" />
                                  <p className="font-mono font-bold text-xs group-hover:text-brand-primary transition-colors truncate">
                                    {dwg.drawingNumber || dwg.drawingCode}
                                  </p>
                                </div>
                                <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mt-1 line-clamp-2">
                                  {dwg.drawingTitle || dwg.title}
                                </p>
                                <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2 mt-1.5 flex-wrap">
                                  {dwg.subFolder && <span className="text-brand-primary dark:text-primary-300 font-bold">📁 {dwg.subFolder}</span>}
                                  {dwg.originalFileName && <span className="text-slate-400 truncate">({dwg.originalFileName})</span>}
                                </div>
                              </div>

                              <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                                <button
                                  type="button"
                                  onClick={() => setPreviewDrawing(dwg)}
                                  className="w-full py-1.5 px-2.5 rounded-xl bg-brand-primary hover:bg-primary-600 text-white font-extrabold text-[10px] flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>View & Download</span>
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              }

              // CASE B: DRAWING DISCIPLINE FOLDERS (AR, ST, IN, MEP, EL, PL, FF, HV, LA, etc.)
              // Drawing folders are created on-demand through the "+ Add Drawing Folder" form
              const allPackageFolders: { id: string; name: string; isDefault: boolean }[] = activeCustomSubfolders.map(s => ({
                id: s.id,
                name: s.name,
                isDefault: false,
              }))

              // LEVEL 1: At root of drawing discipline (no package folder opened & not searching)
              if (selectedDrawingSubFolder === null && selectedWorkflowStage === null && !drawingsSearch) {
                return (
                  <div className="space-y-6">
                    {/* Top Bar for Drawing Discipline */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                      <div>
                        <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                          <Folder className="w-5 h-5 text-amber-500 fill-amber-500/20" />
                          <span>{nonDrawingMeta?.name || drawingDisciplineFilter}</span>
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {nonDrawingMeta?.description || 'Drawing deliverable packages with Work In Progress, Under Review, Shared & Archive stages.'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setNewSubFolderName('')
                            setIsAddSubFolderModalOpen(true)
                          }}
                          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer whitespace-nowrap active:scale-95"
                        >
                          <FolderPlus className="w-4 h-4" /> Add Drawing Folder
                        </button>
                        <button
                          type="button"
                          onClick={openAddDrawingModal}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer whitespace-nowrap active:scale-95"
                        >
                          <Plus className="w-4 h-4" /> Add Drawing
                        </button>
                      </div>
                    </div>

                    {/* Drawing Package Folders Grid */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Drawing Package Folders ({allPackageFolders.length})
                        </p>
                        <span className="text-[11px] text-slate-400">
                          Each folder contains WIP • Under Review • Shared • Archive subfolders
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {/* Quick Create Folder Card */}
                        <div
                          onClick={() => {
                            setNewSubFolderName('')
                            setIsAddSubFolderModalOpen(true)
                          }}
                          className="p-5 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 hover:border-emerald-500 hover:bg-emerald-500/5 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center group min-h-[140px]"
                        >
                          <FolderPlus className="w-10 h-10 text-emerald-500/70 group-hover:scale-110 transition-transform mb-2" />
                          <p className="text-xs font-extrabold text-slate-800 dark:text-white group-hover:text-emerald-600">
                            + Add Drawing Folder
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            e.g. Scheme Drawings, Preliminary Drawings, etc.
                          </p>
                        </div>

                        {allPackageFolders.map((sub) => {
                          const count = projectDrawingsList.filter(d =>
                            (d.discipline === drawingDisciplineFilter || d.disciplineCode === drawingDisciplineFilter) &&
                            (d.subFolder === sub.name || (d.subFolder && (sub.name.toLowerCase().includes(d.subFolder.toLowerCase()) || d.subFolder.toLowerCase().includes(sub.name.toLowerCase())))) &&
                            hasDocOrImage(d)
                          ).length

                          return (
                            <div
                              key={sub.id}
                              onClick={() => {
                                setSelectedDrawingSubFolder(sub.name)
                                setSelectedWorkflowStage(null)
                              }}
                              className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-500 hover:shadow-xl shadow-xs transition-all duration-200 cursor-pointer flex flex-col justify-between group relative"
                            >
                              <div>
                                <div className="flex items-start justify-between gap-3 mb-3">
                                  <Folder className="w-12 h-12 text-amber-500 fill-amber-500/20 transition-transform group-hover:scale-110 shrink-0" />
                                  <div className="flex items-center gap-1.5">
                                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-extrabold border bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                                      {count} {count === 1 ? 'Drawing' : 'Drawings'}
                                    </span>
                                    {!sub.isDefault && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleDeleteSubFolder(sub.id, sub.name)
                                        }}
                                        className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                        title="Delete Folder"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug">
                                  {sub.name}
                                </h4>
                                <p className="text-[10px] text-slate-400 font-medium mt-1">
                                  4 Stages: WIP • Review • Shared • Archive
                                </p>
                              </div>

                              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                                <span className="font-extrabold text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                                  Open Folder →
                                </span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Direct / Uncategorized Deliverables in this Discipline (if any) */}
                    {disciplineDrawings.length > 0 && (
                      <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            All Drawings in {drawingDisciplineFilter} ({disciplineDrawings.length})
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-4">
                          {disciplineDrawings.map((dwg) => {
                            const dwgId = dwg.id || dwg.drawingNumber || dwg.drawingCode
                            return (
                              <div
                                key={dwgId}
                                className="group relative flex flex-col justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500 shadow-xs hover:shadow-lg transition-all duration-200 text-slate-800 dark:text-white"
                              >
                                <div>
                                  <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-brand-primary shrink-0" />
                                    <p className="font-mono font-bold text-xs group-hover:text-brand-primary transition-colors truncate">
                                      {dwg.drawingNumber || dwg.drawingCode}
                                    </p>
                                  </div>
                                  <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mt-1 line-clamp-2">
                                    {dwg.drawingTitle || dwg.title}
                                  </p>
                                  <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2 mt-1.5 flex-wrap">
                                    {dwg.subFolder && <span className="text-amber-600 dark:text-amber-400 font-bold">📁 {dwg.subFolder}</span>}
                                    <span>Rev: <strong>{dwg.revisionNumber || 'R00'}</strong></span>
                                    <span>• Level: <strong>{dwg.level || 'GF'}</strong></span>
                                  </div>
                                </div>

                                <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                                  <button
                                    type="button"
                                    onClick={() => setPreviewDrawing(dwg)}
                                    className="w-full py-1.5 px-2.5 rounded-xl bg-brand-primary hover:bg-primary-600 text-white font-extrabold text-[10px] flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>View & Download</span>
                                  </button>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )
              }

              // LEVEL 2: Inside a Selected Drawing Package Folder (e.g. Scheme Drawings) -> Display 4 Workflow Stage Subfolders
              if (selectedDrawingSubFolder !== null && selectedWorkflowStage === null && !drawingsSearch) {
                const folderDrawings = disciplineDrawings.filter(d =>
                  d.subFolder === selectedDrawingSubFolder ||
                  (d.subFolder && (selectedDrawingSubFolder.toLowerCase().includes(d.subFolder.toLowerCase()) || d.subFolder.toLowerCase().includes(selectedDrawingSubFolder.toLowerCase())))
                )

                const counts = {
                  ALL: folderDrawings.length,
                  WIP: folderDrawings.filter(d => getDrawingWorkflowStage(d.status) === 'WIP').length,
                  REVIEW: folderDrawings.filter(d => getDrawingWorkflowStage(d.status) === 'REVIEW').length,
                  SHARED: folderDrawings.filter(d => getDrawingWorkflowStage(d.status) === 'SHARED').length,
                  ARCHIVE: folderDrawings.filter(d => getDrawingWorkflowStage(d.status) === 'ARCHIVE').length,
                }

                return (
                  <div className="space-y-6">
                    {/* Top Bar inside Drawing Package */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setSelectedDrawingSubFolder(null)}
                          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer text-xs font-bold flex items-center gap-1 shrink-0"
                          title={`Back to ${drawingDisciplineFilter} Folders`}
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>All Folders</span>
                        </button>

                        <div className="flex items-center gap-2.5">
                          <Folder className="w-7 h-7 text-amber-500 fill-amber-500/20 shrink-0" />
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                                {selectedDrawingSubFolder}
                              </h3>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                                {counts.ALL} {counts.ALL === 1 ? 'Drawing' : 'Drawings'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 line-clamp-1">
                              Drawing Package inside {nonDrawingMeta?.name || drawingDisciplineFilter}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={openAddDrawingModal}
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer whitespace-nowrap active:scale-95"
                        >
                          <Plus className="w-4 h-4" /> Upload Drawing to Folder
                        </button>
                      </div>
                    </div>

                    {/* 4 Workflow Folders Grid */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Workflow Stages for <strong className="text-slate-800 dark:text-white">{selectedDrawingSubFolder}</strong>
                        </p>
                        <span className="text-[11px] text-slate-400 font-medium">
                          Click a stage folder to manage deliverables
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {DRAWING_WORKFLOW_FOLDERS.map((folder) => {
                          const count = counts[folder.id]

                          return (
                            <div
                              key={folder.id}
                              onClick={() => setSelectedWorkflowStage(folder.id)}
                              className={`p-5 rounded-3xl border transition-all duration-200 cursor-pointer flex flex-col justify-between relative group bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 ${folder.cardBorder} hover:shadow-xl shadow-xs`}
                            >
                              <div>
                                <div className="flex items-start justify-between gap-3 mb-3">
                                  <Folder className={`w-12 h-12 ${folder.iconBg} transition-transform group-hover:scale-110 shrink-0`} />
                                  <span className={`px-3 py-1 rounded-full text-xs font-mono font-extrabold border ${folder.badgeBg}`}>
                                    {count} {count === 1 ? 'Drawing' : 'Drawings'}
                                  </span>
                                </div>

                                <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                                  {folder.name}
                                </h4>
                                <p className="text-xs text-slate-400 font-medium mt-0.5">
                                  {folder.shortName}
                                </p>

                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                                  {folder.description}
                                </p>
                              </div>

                              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                                <span className="font-extrabold text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                                  Open Folder →
                                </span>
                                {folder.id === 'REVIEW' && counts.REVIEW > 0 && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full">
                                    ● Needs Review ({counts.REVIEW})
                                  </span>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* All Drawings in this Package (Direct View) */}
                    {folderDrawings.length > 0 && (
                      <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            All Drawings in {selectedDrawingSubFolder} ({folderDrawings.length})
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-4">
                          {folderDrawings.map((dwg) => {
                            const stage = getDrawingWorkflowStage(dwg.status)
                            const stageMeta = DRAWING_WORKFLOW_FOLDERS.find(f => f.id === stage) || DRAWING_WORKFLOW_FOLDERS[0]
                            const dwgId = dwg.id || dwg.drawingNumber || dwg.drawingCode
                            return (
                              <div
                                key={dwgId}
                                className="group relative flex flex-col justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500 shadow-xs hover:shadow-lg transition-all duration-200 text-slate-800 dark:text-white"
                              >
                                <div>
                                  <div className="flex items-start justify-between gap-2 mb-2">
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-black border ${stageMeta.badgeBg}`}>
                                      {stageMeta.number}. {stageMeta.shortName}
                                    </span>
                                  </div>

                                  <div onClick={() => setPreviewDrawing(dwg)} className="cursor-pointer">
                                    <div className="flex items-center gap-2">
                                      <FileText className="w-4 h-4 text-brand-primary shrink-0" />
                                      <p className="font-mono font-bold text-xs hover:text-brand-primary transition-colors truncate">
                                        {dwg.drawingNumber || dwg.drawingCode}
                                      </p>
                                    </div>
                                    <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mt-1 line-clamp-2">
                                      {dwg.drawingTitle || dwg.title}
                                    </p>
                                    <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2 mt-1.5 flex-wrap">
                                      <span>Rev: <strong>{dwg.revisionNumber || 'R00'}</strong></span>
                                      <span>• Level: <strong>{dwg.level || 'GF'}</strong></span>
                                    </div>
                                  </div>
                                </div>

                                <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                                  <button
                                    type="button"
                                    onClick={() => setPreviewDrawing(dwg)}
                                    className="w-full py-1.5 px-2.5 rounded-xl bg-brand-primary hover:bg-primary-600 text-white font-extrabold text-[10px] flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>View & Download</span>
                                  </button>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )
              }

              // LEVEL 3: Inside a Specific Workflow Stage OR Search Results Mode
              const isSearchMode = Boolean(drawingsSearch && selectedWorkflowStage === null)
              const activeFolderMeta = DRAWING_WORKFLOW_FOLDERS.find(f => f.id === selectedWorkflowStage) || DRAWING_WORKFLOW_FOLDERS[0]
              
              const stageFilteredDrawings = disciplineDrawings.filter(d => {
                if (selectedDrawingSubFolder) {
                  const matchSub = d.subFolder === selectedDrawingSubFolder ||
                    (d.subFolder && (selectedDrawingSubFolder.toLowerCase().includes(d.subFolder.toLowerCase()) || d.subFolder.toLowerCase().includes(selectedDrawingSubFolder.toLowerCase())))
                  if (!matchSub) return false
                }
                return true
              })

              const counts = {
                ALL: stageFilteredDrawings.length,
                WIP: stageFilteredDrawings.filter(d => getDrawingWorkflowStage(d.status) === 'WIP').length,
                REVIEW: stageFilteredDrawings.filter(d => getDrawingWorkflowStage(d.status) === 'REVIEW').length,
                SHARED: stageFilteredDrawings.filter(d => getDrawingWorkflowStage(d.status) === 'SHARED').length,
                ARCHIVE: stageFilteredDrawings.filter(d => getDrawingWorkflowStage(d.status) === 'ARCHIVE').length,
              }

              const filteredList = stageFilteredDrawings.filter(d => {
                if (isSearchMode) return true
                return getDrawingWorkflowStage(d.status) === selectedWorkflowStage
              })

              return (
                <div className="space-y-6">
                  {/* Inside Folder / Search Header Navigation Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          if (isSearchMode) {
                            setDrawingsSearch('')
                          } else {
                            setSelectedWorkflowStage(null)
                          }
                        }}
                        className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer text-xs font-bold flex items-center gap-1 shrink-0"
                        title={isSearchMode ? 'Clear Search & View All Folders' : `Back to ${selectedDrawingSubFolder || drawingDisciplineFilter} Folders`}
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>{isSearchMode ? 'Exit Search' : selectedDrawingSubFolder ? `Back to ${selectedDrawingSubFolder}` : 'All Folders'}</span>
                      </button>

                      <div className="flex items-center gap-2.5">
                        {isSearchMode ? (
                          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 shrink-0">
                            <Search className="w-4 h-4" />
                          </div>
                        ) : (
                          <Folder className={`w-7 h-7 ${activeFolderMeta.iconBg} shrink-0`} />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                              {isSearchMode ? `Search Results: "${drawingsSearch}"` : activeFolderMeta.name}
                            </h3>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${isSearchMode ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' : activeFolderMeta.badgeBg}`}>
                              {filteredList.length} {filteredList.length === 1 ? 'Drawing' : 'Drawings'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-1">
                            {isSearchMode
                              ? `Matching deliverables across all folders in ${drawingDisciplineFilter === 'ALL' ? 'all disciplines' : drawingDisciplineFilter}`
                              : drawingsSearch
                                ? `Filtered by "${drawingsSearch}" in ${activeFolderMeta.name}`
                                : selectedDrawingSubFolder
                                  ? `Inside ${selectedDrawingSubFolder} • ${activeFolderMeta.description}`
                                  : activeFolderMeta.description
                            }
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Quick Switch Folder / Stage Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 sm:pt-0">
                      {isSearchMode && (
                        <button
                          type="button"
                          onClick={() => setDrawingsSearch('')}
                          className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer flex items-center gap-1 shrink-0"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Clear Search</span>
                        </button>
                      )}
                      {DRAWING_WORKFLOW_FOLDERS.map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setSelectedWorkflowStage(f.id)}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${selectedWorkflowStage === f.id
                            ? f.activeBg
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                            }`}
                        >
                          <span>{f.number}. {f.shortName}</span>
                          <span className="opacity-70 font-mono text-[10px]">({counts[f.id]})</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Drawings Cards Grid */}
                  {filteredList.length === 0 ? (
                    <div className="p-8 sm:p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-xs space-y-3">
                      {drawingsSearch ? (
                        <Search className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
                      ) : (
                        <FileText className="w-12 h-12 text-brand-primary/40 mx-auto" />
                      )}
                      <p className="text-sm font-extrabold text-slate-800 dark:text-white">
                        {drawingsSearch
                          ? `No Drawings Found Matching "${drawingsSearch}"`
                          : selectedWorkflowStage === null
                            ? `No Drawings Uploaded to ${drawingDisciplineFilter} Yet`
                            : `No Drawings in "${activeFolderMeta.name}" Folder`
                        }
                      </p>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        {drawingsSearch
                          ? `We couldn't find any drawings matching "${drawingsSearch}" in ${drawingDisciplineFilter === 'ALL' ? 'this project' : drawingDisciplineFilter}. Try searching with another code or title.`
                          : selectedWorkflowStage === 'WIP'
                            ? 'Drawings added in progress or requiring draft work will appear here.'
                            : selectedWorkflowStage === 'REVIEW'
                              ? 'When a draughtsperson completes a drawing and submits it for internal review, it will appear here.'
                              : selectedWorkflowStage === 'SHARED'
                                ? 'Drawings approved by the Lead / Checker and ready for client release will appear here.'
                                : selectedWorkflowStage === 'ARCHIVE'
                                  ? 'Historical or superseded drawing revisions will be archived here.'
                                  : `Click "+ Add Drawing" below to upload the first deliverable for ${drawingDisciplineFilter}.`
                        }
                      </p>
                      <div className="flex items-center justify-center gap-3 pt-2">
                        {drawingsSearch ? (
                          <button
                            type="button"
                            onClick={() => setDrawingsSearch('')}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-extrabold transition-all cursor-pointer active:scale-95"
                          >
                            <X className="w-4 h-4" /> Clear Search Filter
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={openAddDrawingModal}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-primary-600 text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer active:scale-95"
                          >
                            <Plus className="w-4 h-4" /> Add Drawing
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-4">
                      {filteredList.map((dwg) => {
                        const stage = getDrawingWorkflowStage(dwg.status)
                        const stageMeta = DRAWING_WORKFLOW_FOLDERS.find(f => f.id === stage) || DRAWING_WORKFLOW_FOLDERS[0]
                        const dwgId = dwg.id || dwg.drawingNumber || dwg.drawingCode

                        return (
                          <div
                            key={dwgId}
                            className="group relative flex flex-col justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-primary shadow-xs hover:shadow-lg transition-all duration-200 text-slate-800 dark:text-white"
                          >
                            {/* Card Top: Code & Status */}
                            <div>
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-black border ${stageMeta.badgeBg}`}>
                                  {stageMeta.number}. {stageMeta.shortName}
                                </span>
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold ${dwg.status === 'Approved' || dwg.status === 'Issued for Construction' || dwg.status === 'Shared'
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                    : dwg.status === 'Under Review' || dwg.status === 'Submitted for Review' || dwg.status === 'Submitted'
                                      ? 'bg-brand-primary/10 text-brand-primary dark:text-primary-300 border border-brand-primary/20'
                                      : dwg.status === 'Revision Required' || dwg.status === 'Rejected'
                                        ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                                        : 'bg-brand-primary/10 text-brand-primary dark:text-primary-300 border border-brand-primary/20'
                                    }`}
                                >
                                  {dwg.status || 'Draft'}
                                </span>
                              </div>

                              {/* Drawing Click to Preview */}
                              <div
                                onClick={() => setPreviewDrawing(dwg)}
                                className="cursor-pointer group/title"
                              >
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-brand-primary shrink-0" />
                                  <p className="font-mono font-bold text-xs group-hover/title:text-brand-primary transition-colors truncate">
                                    {dwg.drawingNumber || dwg.drawingCode}
                                  </p>
                                </div>
                                <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mt-1 line-clamp-2">
                                  {dwg.drawingTitle || dwg.title}
                                </p>
                                <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2 mt-1.5 flex-wrap">
                                  <span>Rev: <strong>{dwg.revisionNumber || 'R00'}</strong></span>
                                  <span>• Level: <strong>{dwg.level || 'GF'}</strong></span>
                                </div>
                              </div>

                              {/* Drafter Submission Scope / Review Instructions (If in Under Review) */}
                              {dwg.drafterNotes && stage === 'REVIEW' && (
                                <div className="mt-2.5 p-2 rounded-xl bg-brand-primary/5 dark:bg-brand-primary/10 border border-brand-primary/20 text-[10px] text-brand-primary dark:text-primary-300">
                                  <div className="flex items-center gap-1 font-bold mb-0.5">
                                    <FileText className="w-3 h-3 text-brand-primary shrink-0" />
                                    <span>Review Instructions from Drafter:</span>
                                  </div>
                                  <p className="italic line-clamp-2">{dwg.drafterNotes}</p>
                                </div>
                              )}

                              {/* Review Notes Callout Banner (If Rejected or Reworked) */}
                              {dwg.reviewNotes && (
                                <div className="mt-2.5 p-2 rounded-xl bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 text-[10px] text-red-700 dark:text-red-300">
                                  <div className="flex items-center gap-1 font-bold mb-0.5">
                                    <AlertCircle className="w-3 h-3 text-red-500 shrink-0" />
                                    <span>Correction Notes from Reviewer:</span>
                                  </div>
                                  <p className="italic line-clamp-2">{dwg.reviewNotes}</p>
                                </div>
                              )}

                              {/* Assigned Reviewer Pill (If in Under Review) */}
                              {stage === 'REVIEW' && (
                                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1 text-[10px] text-slate-500 flex-wrap">
                                  <span className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-200">
                                    <UserCheck className="w-3 h-3 text-brand-primary shrink-0" />
                                    <span>{dwg.assignedReviewer?.name || 'Lead Architect'}</span>
                                  </span>
                                  {dwg.reviewPriority && dwg.reviewPriority !== 'Normal' && (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                                      ⚡ {dwg.reviewPriority}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Card Bottom: Lifecycle Action Buttons */}
                            <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                              {/* Action 1: When in Work In Progress -> Submit for Review */}
                              {stage === 'WIP' && (
                                <button
                                  type="button"
                                  onClick={() => openSubmitReviewModal(dwg)}
                                  className="w-full py-1.5 px-2.5 rounded-xl bg-brand-primary hover:bg-primary-600 text-white font-extrabold text-[10px] flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                                >
                                  <span>➔ Submit for Internal Review</span>
                                </button>
                              )}

                              {/* Action 2: When in Under Review -> Approve or Request Rework */}
                              {stage === 'REVIEW' && (
                                <div className="grid grid-cols-2 gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setReviewActionModal({
                                        isOpen: true,
                                        drawing: dwg,
                                        action: 'approve',
                                        note: ''
                                      })
                                    }}
                                    className="py-1.5 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] flex items-center justify-center gap-1 transition-all shadow-xs cursor-pointer active:scale-95"
                                  >
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>Approve</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setReviewActionModal({
                                        isOpen: true,
                                        drawing: dwg,
                                        action: 'rework',
                                        note: ''
                                      })
                                    }}
                                    className="py-1.5 px-2 rounded-xl bg-brand-primary hover:bg-primary-600 text-white font-extrabold text-[10px] flex items-center justify-center gap-1 transition-all shadow-xs cursor-pointer active:scale-95"
                                  >
                                    <RotateCcw className="w-3 h-3" />
                                    <span>Rework</span>
                                  </button>
                                </div>
                              )}

                              {/* Action 3: When in Shared -> View / Share / Archive */}
                              {stage === 'SHARED' && (
                                <div className="grid grid-cols-2 gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setPreviewDrawing(dwg)}
                                    className="py-1.5 px-2 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 font-extrabold text-[10px] flex items-center justify-center gap-1 transition-all cursor-pointer"
                                  >
                                    <Eye className="w-3 h-3" />
                                    <span>View / Share</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateDrawingStatus(dwgId, 'Archived')}
                                    className="py-1.5 px-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-extrabold text-[10px] flex items-center justify-center gap-1 transition-all cursor-pointer"
                                  >
                                    <Archive className="w-3 h-3" />
                                    <span>Archive</span>
                                  </button>
                                </div>
                              )}

                              {/* Action 4: When in Archive -> Restore to WIP */}
                              {stage === 'ARCHIVE' && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateDrawingStatus(dwgId, 'Draft')}
                                  className="w-full py-1.5 px-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-extrabold text-[10px] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  <span>Restore to Work In Progress</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => setPreviewDrawing(dwg)}
                                className="w-full text-center text-[10px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 py-0.5 cursor-pointer"
                              >
                                View Drawing Details & Document →
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })()}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-sm">
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-brand-charcoal dark:text-white flex items-center gap-2">
                  <Folder className="w-5 h-5 text-amber-500 fill-amber-500/20 shrink-0" /> Active Project Drawing Folders
                </h2>
                <p className="text-xs text-brand-gray mt-0.5">Select an active converted project to view its drawing register and deliverables.</p>
              </div>
            </div>

            {projectsList.length === 0 ? (
              <div className="p-8 sm:p-16 flex flex-col items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-xs text-center">
                <Folder className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">No Converted Projects Yet</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  Convert a lead from the "Project Leads" tab into a project to automatically generate its drawing register and folders here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-5">
                {projectsList.map((p) => {
                  const compName = p.projectName || p.companyName || p.clientName || 'Project'
                  const pCode = p.projectCode || p.id
                  const rawDisc = (p.disciplines && Array.isArray(p.disciplines))
                    ? p.disciplines.map((d: any) => typeof d === 'string' ? d : d.code || d.disciplineCode).filter(Boolean)
                    : []

                  return (
                    <div
                      key={p.id || p.projectCode}
                      onClick={() => setSelectedDrawingProject({
                        id: p.id,
                        projectCode: pCode,
                        companyName: compName,
                        repName: p.clientName,
                        disciplines: rawDisc
                      })}
                      className="group relative flex flex-col items-center p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer text-center"
                    >
                      <Folder className="w-10 h-10 sm:w-12 sm:h-12 text-amber-500 fill-amber-500/20 mb-2 group-hover:scale-110 transition-transform shrink-0" />
                      <span className="text-[9px] sm:text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                        {pCode}
                      </span>
                      <p className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white mt-1.5 break-words text-center leading-snug">{compName}</p>
                      <p className="text-[10px] sm:text-[11px] font-medium text-slate-400 mt-0.5 break-words text-center max-w-full">{p.clientName || 'Active Project'}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      )}

      {/* ═════════════════════════════════════════════════════════════════════════
          CREATE SUBFOLDER INSIDE DISCIPLINE MODAL
      ═════════════════════════════════════════════════════════════════════════ */}
      {isAddSubFolderModalOpen && selectedDrawingProject && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 font-extrabold">
                  <FolderPlus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Add Drawing Folder
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Project: <strong className="text-slate-700 dark:text-slate-200">{selectedDrawingProject.companyName}</strong> ({selectedDrawingProject.projectCode})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddSubFolderModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Discipline Selection */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                  Target Discipline Folder <span className="text-amber-500">*</span>
                </label>
                <select
                  value={subFolderTargetDiscipline || (drawingDisciplineFilter !== 'ALL' ? drawingDisciplineFilter : 'AR')}
                  onChange={(e) => setSubFolderTargetDiscipline(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-semibold text-xs outline-none focus:border-amber-500 cursor-pointer"
                >
                  {selectedDrawingProject?.disciplines && selectedDrawingProject.disciplines.length > 0 ? (
                    selectedDrawingProject.disciplines.map((code: string) => (
                      <option key={code} value={code}>
                        {code} — {DISCIPLINE_CATALOG[code as DisciplineCode]?.name || code}
                      </option>
                    ))
                  ) : (
                    Object.entries(DISCIPLINE_CATALOG).map(([code, meta]) => (
                      <option key={code} value={code}>
                        {code} — {meta.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Folder Name Input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                  Drawing Folder / Package Name <span className="text-amber-500">*</span>
                </label>
                <input
                  type="text"
                  autoFocus
                  value={newSubFolderName}
                  onChange={(e) => setNewSubFolderName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleCreateSubFolder()
                    }
                  }}
                  placeholder="e.g. Scheme Drawings, Preliminary Drawings, Working Plan..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-semibold outline-none focus:border-amber-500 text-xs"
                />
              </div>

              {/* Preset Suggestion Chips */}
              <div>
                <p className="text-[10px] text-slate-400 font-bold mb-1.5">Quick Suggestions & Standard Packages:</p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    '1. Scheme Drawings',
                    '2. Preliminary Drawings',
                    '3. Working Plan, Elevation & Section Drawings',
                    '4. Detailed Drawings',
                    '5. Joinery Drawings',
                    '6. Staircase, Lift & Ramp Drawings',
                    '7. Site Development & Landscape Drawings',
                    '8. Compound Wall Drawings',
                    '9. Layout Drawings',
                    '3D Renders & Visualizations',
                    'Municipal & Sanction Plans',
                  ].map(sugg => (
                    <button
                      key={sugg}
                      type="button"
                      onClick={() => setNewSubFolderName(sugg)}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-950/40 dark:hover:text-amber-400 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                    >
                      + {sugg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Visual Workflow Stage Hierarchy Preview Box */}
              <div className="p-3.5 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 space-y-2">
                <div className="flex items-center gap-2 text-[11px] font-extrabold text-amber-700 dark:text-amber-300">
                  <Folder className="w-4 h-4 fill-amber-500/20 text-amber-600" />
                  <span>Folder Structure Preview:</span>
                </div>
                <div className="font-mono text-[10px] text-slate-600 dark:text-slate-300 space-y-1 bg-white/70 dark:bg-slate-900/70 p-2.5 rounded-xl border border-amber-500/15">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    📁 <span>{newSubFolderName.trim() || 'Your Folder Name'}</span>
                  </div>
                  <div className="pl-4 border-l-2 border-amber-500/30 space-y-1 mt-1 text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <span>├── 📂 1. Work in Progress</span>
                      <span className="text-[9px] text-slate-400 font-sans">(Drafting & revisions)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>├── 📂 2. Under Review</span>
                      <span className="text-[9px] text-slate-400 font-sans">(Checker & QA review)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>├── 📂 3. Shared</span>
                      <span className="text-[9px] text-slate-400 font-sans">(Approved for Client / GFC)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>└── 📂 4. Archived Drawings</span>
                      <span className="text-[9px] text-slate-400 font-sans">(Superseded records)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              <button
                type="button"
                onClick={() => setIsAddSubFolderModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleCreateSubFolder()}
                disabled={!newSubFolderName.trim()}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-xs font-extrabold text-white shadow-md transition-all cursor-pointer disabled:opacity-50 active:scale-95"
              >
                <FolderPlus className="w-4 h-4" /> Create Drawing Folder
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ═════════════════════════════════════════════════════════════════════════
          CREATE DISCIPLINE FOLDER MODAL (With Direct DB Master Selection & Add)
      ═════════════════════════════════════════════════════════════════════════ */}
      {isAddDisciplineModalOpen && selectedDrawingProject && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 font-extrabold">
                  <Folder className="w-5 h-5 fill-amber-500/20" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Create Discipline Folder
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Project: <strong className="text-slate-700 dark:text-slate-200">{selectedDrawingProject.companyName}</strong> ({selectedDrawingProject.projectCode})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddDisciplineModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
              {/* Search & Category Filter */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    Select Standard Project Folder / Discipline (17 Categories)
                  </label>
                  {drawingDisciplineFilter !== 'ALL' ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddDisciplineModalOpen(false)
                        setNewSubFolderName('')
                        setIsAddSubFolderModalOpen(true)
                      }}
                      className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
                    >
                      Add Subfolder in {drawingDisciplineFilter} instead
                    </button>
                  ) : (
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">Standard PMC Structure</span>
                  )}
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={folderModalSearch}
                    onChange={(e) => setFolderModalSearch(e.target.value)}
                    placeholder="Search folder by number, code or name (e.g. 03, AR, MEP, Site)..."
                    className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-medium outline-none focus:border-amber-500 text-xs shadow-sm transition-all"
                  />
                  {folderModalSearch && (
                    <button
                      type="button"
                      onClick={() => setFolderModalSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                  {[
                    { id: 'ALL', label: 'All Folders' },
                    { id: 'Design & Engineering', label: 'Design & Eng' },
                    { id: 'Project Control', label: 'Control & Admin' },
                    { id: 'Site Execution', label: 'Site Execution' },
                    { id: 'Commercial & Contracts', label: 'Commercial' },
                    { id: 'Quality & Closeout', label: 'Closeout' },
                    { id: 'CUSTOM', label: '+ Custom' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setFolderModalCategory(cat.id)
                        if (cat.id === 'CUSTOM') {
                          setNewDisciplineCode('CUSTOM')
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${folderModalCategory === cat.id
                        ? 'bg-amber-500 text-white shadow-sm font-extrabold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Card Selection Grid */}
              {folderModalCategory !== 'CUSTOM' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
                  {PROJECT_17_FOLDERS.filter((item) => {
                    const matchesCategory = folderModalCategory === 'ALL' || item.category === folderModalCategory
                    const searchLower = folderModalSearch.toLowerCase()
                    const matchesSearch = !folderModalSearch ||
                      item.code.toLowerCase().includes(searchLower) ||
                      item.name.toLowerCase().includes(searchLower) ||
                      item.description.toLowerCase().includes(searchLower) ||
                      (item.subfolders && item.subfolders.some(s => s.toLowerCase().includes(searchLower)))
                    return matchesCategory && matchesSearch
                  }).map((item) => {
                    const existingCodes = (selectedDrawingProject?.disciplines || []).map((d: any) => typeof d === 'string' ? d : d.code)
                    const isAlreadyCreated = existingCodes.includes(item.code)
                    const isSelected = newDisciplineCode === item.code

                    return (
                      <button
                        key={item.code}
                        type="button"
                        disabled={isAlreadyCreated}
                        onClick={() => setNewDisciplineCode(item.code)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between relative group ${isAlreadyCreated
                          ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60 cursor-not-allowed'
                          : isSelected
                            ? 'bg-amber-500/10 dark:bg-amber-500/20 border-amber-500 shadow-md shadow-amber-500/10 ring-1 ring-amber-500'
                            : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-400 hover:shadow-sm'
                          }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-black border ${item.colorBadge}`}>
                              {item.code}
                            </span>
                            {isAlreadyCreated ? (
                              <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                                ✓ Created
                              </span>
                            ) : (
                              <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500">
                                {item.category}
                              </span>
                            )}
                          </div>
                          <p className={`text-xs font-bold leading-tight ${isSelected ? 'text-amber-700 dark:text-amber-300' : 'text-slate-800 dark:text-white'}`}>
                            {item.name}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-1 leading-relaxed">
                            {item.description}
                          </p>
                        </div>

                        {item.subfolders && item.subfolders.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[10px]">
                            <span className="text-slate-400 dark:text-slate-500 font-medium">
                              {item.subfolders.length} subfolders
                            </span>
                            <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${isSelected ? 'border-amber-500 bg-amber-500 text-white' : 'border-slate-300 dark:border-slate-600'}`}>
                              {isSelected && <CheckCircle2 className="w-3 h-3 fill-current" />}
                            </span>
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Custom / Add New Discipline Option Trigger */}
              {folderModalCategory !== 'CUSTOM' && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setFolderModalCategory('CUSTOM')
                      setNewDisciplineCode('CUSTOM')
                    }}
                    className={`w-full p-2.5 rounded-xl border border-dashed text-center text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${newDisciplineCode === 'CUSTOM'
                      ? 'border-amber-500 bg-amber-500/10 text-amber-600'
                      : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-amber-400 hover:text-amber-600'
                      }`}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Need a Custom / Specialized Discipline Name?</span>
                  </button>
                </div>
              )}

              {/* Custom Discipline Input Form */}
              {newDisciplineCode === 'CUSTOM' && (
                <div className="space-y-3 p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/30 animate-fade-in">
                  <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 font-bold text-xs">
                    <div className="flex items-center gap-1.5">
                      <Plus className="w-4 h-4" />
                      <span>Custom Discipline Definition</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFolderModalCategory('ALL')
                        setNewDisciplineCode('AR')
                      }}
                      className="text-[10px] text-slate-400 hover:text-slate-600 underline cursor-pointer"
                    >
                      Back to 17 standard folders
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                      Discipline Full Name / Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={customDisciplineName}
                      onChange={(e) => {
                        const name = e.target.value
                        setCustomDisciplineName(name)
                        const autoCode = deriveDisciplineCode(name)
                        if (autoCode) {
                          setCustomDisciplineCode(autoCode)
                        }
                      }}
                      placeholder="e.g. Landscape Architecture"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-semibold outline-none focus:border-amber-500 text-xs shadow-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                        Discipline Code (2-4 Letters) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        maxLength={4}
                        value={customDisciplineCode}
                        onChange={(e) => setCustomDisciplineCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                        placeholder="e.g. LA, AC, ME"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-mono font-bold uppercase outline-none focus:border-amber-500 text-xs shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                        Scope / Description
                      </label>
                      <input
                        type="text"
                        value={customDisciplineDesc}
                        onChange={(e) => setCustomDisciplineDesc(e.target.value)}
                        placeholder="e.g. Irrigation and greenery layouts"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-medium outline-none focus:border-amber-500 text-xs shadow-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Folder Code & Path Preview */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Folder Code & Path Preview</span>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold font-sans">
                    {DISCIPLINE_CATALOG[newDisciplineCode as DisciplineCode]?.name || customDisciplineName || newDisciplineCode}
                  </span>
                </div>
                <p className="text-sm font-extrabold text-amber-600 dark:text-amber-400 truncate">
                  {selectedDrawingProject?.projectCode || 'PROJECT'}-{newDisciplineCode === 'CUSTOM' ? (customDisciplineCode || 'CUSTOM') : newDisciplineCode}
                </p>
                <p className="text-[10px] text-slate-500 font-sans mt-0.5">
                  Initializes standard deliverable structure and drawings register for this folder package.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              <button
                type="button"
                onClick={() => setIsAddDisciplineModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddDiscipline}
                disabled={addingDiscipline || (newDisciplineCode === 'CUSTOM' && (!customDisciplineName.trim() || !customDisciplineCode.trim()))}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-xs font-extrabold text-white shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {addingDiscipline ? 'Creating...' : '+ Create Discipline Folder'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ═════════════════════════════════════════════════════════════════════════
          STANDALONE MODAL: ADD NEW DISCIPLINE TO DATABASE
      ═════════════════════════════════════════════════════════════════════════ */}
      {isNewMasterDisciplineModalOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-brand-primary/5 dark:bg-brand-primary/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary font-extrabold">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Add New Discipline to Database
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Saves to the Master DB for use across projects and folders
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsNewMasterDisciplineModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMasterDiscipline} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Discipline Name / Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={masterDisciplineForm.name}
                  onChange={(e) => {
                    const name = e.target.value
                    const autoCode = deriveDisciplineCode(name)
                    setMasterDisciplineForm(prev => ({
                      ...prev,
                      name,
                      code: autoCode || prev.code
                    }))
                  }}
                  placeholder="e.g. Landscape Architecture, Fire Fighting, Interior Design"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-semibold outline-none focus:border-brand-primary text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Discipline Code (Auto-Generated, 2 to 4 Characters) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={4}
                  value={masterDisciplineForm.code}
                  onChange={(e) => setMasterDisciplineForm(prev => ({ ...prev, code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') }))}
                  placeholder="e.g. LA, FF, IN, AR"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-mono font-bold uppercase outline-none focus:border-brand-primary text-xs"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">Short abbreviation used for folder prefix and drawing codes (auto-derived from title).</p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Description / Deliverables Scope (Optional)
                </label>
                <textarea
                  rows={2}
                  value={masterDisciplineForm.description}
                  onChange={(e) => setMasterDisciplineForm({ ...masterDisciplineForm, description: e.target.value })}
                  placeholder="e.g. Hardscape layouts, planting palettes, irrigation and outdoor lighting"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-medium outline-none focus:border-brand-primary resize-none text-xs"
                />
              </div>

              {selectedDrawingProject && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-[11px] flex items-center gap-2">
                  <Folder className="w-4 h-4 shrink-0 text-amber-500" />
                  <span>This discipline will also be automatically added as a folder to <strong>{selectedDrawingProject.companyName}</strong>.</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewMasterDisciplineModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingMasterDiscipline}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-xs font-extrabold text-white shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {savingMasterDiscipline ? 'Saving...' : 'Save to Database'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ═════════════════════════════════════════════════════════════════════════
          CONVERT LEAD TO ACTIVE PROJECT MODAL
      ═════════════════════════════════════════════════════════════════════════ */}
      {convertingLead && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-emerald-500/5 dark:bg-emerald-500/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 font-extrabold">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Convert Lead to Active Project
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Lead: <strong className="text-slate-700 dark:text-slate-200">{convertingLead.leadName}</strong> • Client: {convertingLead.company || convertingLead.contactPerson}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setConvertingLead(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Agreed Contract Value */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Agreed Contract / Project Value (₹) <span className="text-emerald-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    value={contractValue}
                    onChange={(e) => setContractValue(e.target.value)}
                    placeholder="e.g. 18000000"
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-mono font-bold outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Assigned Project Architect */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Assigned Project Architect / Lead
                </label>
                <select
                  value={convertAssignedEmployee}
                  onChange={(e) => setConvertAssignedEmployee(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-semibold outline-none focus:border-emerald-500"
                >
                  <option value="">-- Select Project Owner --</option>
                  {employeesList.map((emp) => (
                    <option key={emp.id} value={emp.name || emp.fullName}>
                      {emp.name || emp.fullName} {emp.designation ? `(${emp.designation})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Project Code Prefix */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Project Code Prefix (3 Letters)
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={convertProjectPrefix}
                  onChange={(e) => setConvertProjectPrefix(e.target.value.toUpperCase())}
                  placeholder="e.g. GVR, ARC, SKY"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-mono font-bold uppercase outline-none focus:border-emerald-500"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Resulting Project Code will be formatted as: <strong className="font-mono text-emerald-600">{convertProjectPrefix || 'PRJ'}-2026-XXX</strong>
                </p>
              </div>

              {/* Floor Levels Configuration */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                  Configure Floor Levels for Drawings
                </label>
                <div className="flex flex-wrap gap-2">
                  {['B2', 'B1', 'GF', '01', '02', '03', '04', '05', 'TR'].map((floor) => {
                    const isSelected = selectedFloors.includes(floor)
                    return (
                      <button
                        type="button"
                        key={floor}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedFloors(selectedFloors.filter(f => f !== floor))
                          } else {
                            setSelectedFloors([...selectedFloors, floor])
                          }
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${isSelected
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                          }`}
                      >
                        {floor}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Disciplines to Initialize */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    Discipline Folders to Auto-Initialize (Optional)
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedDisciplines(masterDisciplines.map(m => m.code))}
                      className="text-[10px] font-bold text-emerald-600 hover:underline cursor-pointer"
                    >
                      Select All
                    </button>
                    <span className="text-slate-300 dark:text-slate-600">|</span>
                    <button
                      type="button"
                      onClick={() => setSelectedDisciplines([])}
                      className="text-[10px] font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      Clear All
                    </button>
                    <span className="text-slate-300 dark:text-slate-600">|</span>
                    <button
                      type="button"
                      onClick={() => {
                        setMasterDisciplineForm({ code: '', name: '', description: '' })
                        setIsNewMasterDisciplineModalOpen(true)
                      }}
                      className="text-[10px] font-bold text-brand-primary hover:underline cursor-pointer"
                    >
                      + Add New Name
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 mb-2">
                  Only the checked disciplines will be created automatically. If none are selected, only the project folder will be created and you can add discipline folders manually inside it.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {masterDisciplines.map((disc) => {
                    const isSelected = selectedDisciplines.includes(disc.code)
                    return (
                      <div
                        key={disc.code}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedDisciplines(selectedDisciplines.filter(d => d !== disc.code))
                          } else {
                            setSelectedDisciplines([...selectedDisciplines, disc.code])
                          }
                        }}
                        className={`p-2 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${isSelected
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-bold shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 opacity-80'
                          }`}
                      >
                        <span className={`font-mono text-xs font-black ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`}>{disc.code}</span>
                        <span className="text-[11px] truncate">{disc.name}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              <button
                type="button"
                onClick={() => setConvertingLead(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConvertConfirm}
                disabled={convertLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-extrabold text-white shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {convertLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating Project...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Confirm & Convert to Project</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ═════════════════════════════════════════════════════════════════════════
          CREATE / EDIT CLIENT MODAL
      ═════════════════════════════════════════════════════════════════════════ */}
      {isClientModalOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {editingClient ? 'Edit Client Profile' : 'Register New Client'}
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {editingClient ? `Update details for client ${editingClient.clientCode || editingClient.clientName}` : 'Create a primary client entity to attach project requirements'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsClientModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitClient(onSubmitClient)} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Client Name */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Client Name / Representative <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...registerClient('clientName', {
                      required: 'Client name is required',
                      minLength: { value: 2, message: 'Client name must be at least 2 characters' },
                      maxLength: { value: 100, message: 'Client name cannot exceed 100 characters' },
                      pattern: { value: /^[a-zA-Z\s.'-]+$/, message: 'Client name should contain only letters, dots, and hyphens' }
                    })}
                    maxLength={100}
                    placeholder="e.g. Gokul Ramakrishnan"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-semibold outline-none focus:border-brand-primary"
                  />
                  {clientErrors.clientName && <p className="text-[10px] text-red-500 mt-0.5">{clientErrors.clientName.message}</p>}
                </div>

                {/* Company / Entity */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Company / Organization Name
                  </label>
                  <input
                    {...registerClient('company', {
                      minLength: { value: 2, message: 'Company name must be at least 2 characters' },
                      maxLength: { value: 150, message: 'Company name cannot exceed 150 characters' }
                    })}
                    maxLength={150}
                    placeholder="e.g. GR Prestige Projects Ltd"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-semibold outline-none focus:border-brand-primary"
                  />
                  {clientErrors.company && <p className="text-[10px] text-red-500 mt-0.5">{clientErrors.company.message}</p>}
                </div>

                {/* Contact Person */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Contact Person
                  </label>
                  <input
                    {...registerClient('contactPerson', {
                      minLength: { value: 2, message: 'Contact person name must be at least 2 characters' },
                      maxLength: { value: 100, message: 'Contact person name cannot exceed 100 characters' }
                    })}
                    maxLength={100}
                    placeholder="Primary contact name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-semibold outline-none focus:border-brand-primary"
                  />
                  {clientErrors.contactPerson && <p className="text-[10px] text-red-500 mt-0.5">{clientErrors.contactPerson.message}</p>}
                </div>

                {/* Client Type */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Client Type
                  </label>
                  <select
                    {...registerClient('clientType')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-semibold outline-none focus:border-brand-primary"
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
                    {...registerClient('mobile', {
                      required: 'Mobile number is required',
                      minLength: { value: 10, message: 'Mobile number must be 10 digits' },
                      maxLength: { value: 10, message: 'Mobile number must be 10 digits' },
                      pattern: { value: /^[6-9]\d{9}$/, message: 'Enter a valid 10-digit mobile number (e.g. 9840012345)' }
                    })}
                    placeholder="98XXXXXXXX"
                    maxLength={10}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-semibold outline-none focus:border-brand-primary"
                  />
                  {clientErrors.mobile && <p className="text-[10px] text-red-500 mt-0.5">{clientErrors.mobile.message}</p>}
                  {duplicateClientWarning && (
                    <div className="mt-1.5 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 flex items-start gap-2 text-amber-800 dark:text-amber-300 text-xs animate-fade-in">
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
                      <div>
                        <p className="font-bold">Duplicate Mobile Number Alert</p>
                        <p className="text-[11px] leading-tight text-amber-700 dark:text-amber-400/90 mt-0.5">
                          This mobile number is already registered to <span className="font-bold underline">{duplicateClientWarning.clientName}</span> ({duplicateClientWarning.clientCode || 'Existing Client'}).
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    {...registerClient('email', {
                      required: 'Email address is required',
                      minLength: { value: 5, message: 'Email address must be at least 5 characters' },
                      maxLength: { value: 100, message: 'Email address cannot exceed 100 characters' },
                      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address (e.g. client@organization.com)' }
                    })}
                    placeholder="client@organization.com"
                    maxLength={100}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-semibold outline-none focus:border-brand-primary"
                  />
                  {clientErrors.email && <p className="text-[10px] text-red-500 mt-0.5">{clientErrors.email.message}</p>}
                </div>

                {/* Address */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Office / Correspondence Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    {...registerClient('address', {
                      required: 'Office / Correspondence address is required',
                      minLength: { value: 5, message: 'Address must be at least 5 characters' },
                      maxLength: { value: 250, message: 'Address cannot exceed 250 characters' }
                    })}
                    maxLength={250}
                    placeholder="Street address, building, locality..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-semibold outline-none focus:border-brand-primary resize-none"
                  />
                  {clientErrors.address && <p className="text-[10px] text-red-500 mt-0.5">{clientErrors.address.message}</p>}
                </div>

                {/* City & State */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...registerClient('city', {
                      required: 'City is required',
                      minLength: { value: 2, message: 'City must be at least 2 characters' },
                      maxLength: { value: 60, message: 'City cannot exceed 60 characters' }
                    })}
                    maxLength={60}
                    placeholder="e.g. Chennai"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-semibold outline-none focus:border-brand-primary"
                  />
                  {clientErrors.city && <p className="text-[10px] text-red-500 mt-0.5">{clientErrors.city.message}</p>}
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...registerClient('state', {
                      required: 'State is required',
                      minLength: { value: 2, message: 'State must be at least 2 characters' },
                      maxLength: { value: 60, message: 'State cannot exceed 60 characters' }
                    })}
                    maxLength={60}
                    placeholder="e.g. Tamil Nadu"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-semibold outline-none focus:border-brand-primary"
                  />
                  {clientErrors.state && <p className="text-[10px] text-red-500 mt-0.5">{clientErrors.state.message}</p>}
                </div>

                {/* GST, PAN & Aadhar */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">GST Number</label>
                  <input
                    {...registerClient('gstNo', {
                      minLength: { value: 15, message: 'GSTIN must be exactly 15 characters' },
                      maxLength: { value: 15, message: 'GSTIN must be exactly 15 characters' },
                      pattern: { value: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, message: 'Enter a valid 15-character GSTIN' }
                    })}
                    maxLength={15}
                    placeholder="e.g. 33AABCG1234F1Z5"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-semibold outline-none focus:border-brand-primary uppercase font-mono"
                  />
                  {clientErrors.gstNo && <p className="text-[10px] text-red-500 mt-0.5">{clientErrors.gstNo.message}</p>}
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">PAN Number</label>
                  <input
                    {...registerClient('panNo', {
                      minLength: { value: 10, message: 'PAN must be exactly 10 characters' },
                      maxLength: { value: 10, message: 'PAN must be exactly 10 characters' },
                      pattern: { value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, message: 'Enter a valid 10-digit PAN (e.g. ABCDE1234F)' }
                    })}
                    maxLength={10}
                    placeholder="e.g. AABCG1234F"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-semibold outline-none focus:border-brand-primary uppercase font-mono"
                  />
                  {clientErrors.panNo && <p className="text-[10px] text-red-500 mt-0.5">{clientErrors.panNo.message}</p>}
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Aadhar Number</label>
                  <input
                    {...registerClient('aadharNo', {
                      minLength: { value: 12, message: 'Aadhar number must be at least 12 characters' },
                      maxLength: { value: 14, message: 'Aadhar number cannot exceed 14 characters' },
                      pattern: { value: /^[2-9]\d{3}\s?\d{4}\s?\d{4}$/, message: 'Enter a valid 12-digit Aadhar number' }
                    })}
                    placeholder="e.g. 1234 5678 9012"
                    maxLength={14}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-semibold outline-none focus:border-brand-primary font-mono"
                  />
                  {clientErrors.aadharNo && <p className="text-[10px] text-red-500 mt-0.5">{clientErrors.aadharNo.message}</p>}
                </div>

                {/* Status */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Account Status</label>
                  <select
                    {...registerClient('status')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-semibold outline-none focus:border-brand-primary"
                  >
                    <option value="Active">Active Client</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Notes / Partnership Remarks</label>
                <textarea
                  rows={2}
                  {...registerClient('remarks', {
                    maxLength: { value: 250, message: 'Remarks cannot exceed 250 characters' }
                  })}
                  maxLength={250}
                  placeholder="Key relationship notes or client preferences..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-semibold outline-none focus:border-brand-primary resize-none"
                />
                {clientErrors.remarks && <p className="text-[10px] text-red-500 mt-0.5">{clientErrors.remarks.message}</p>}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsClientModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={clientSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-xs font-extrabold text-white shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {clientSubmitting ? 'Saving...' : editingClient ? 'Update Client' : 'Save Client'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ═════════════════════════════════════════════════════════════════════════
          CLIENT 360 MODAL (Profile + Associated Leads + Converted Projects)
      ═════════════════════════════════════════════════════════════════════════ */}
      {client360 && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary font-black">
                  <Building className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-brand-primary/10 text-brand-primary font-mono text-xs font-black">
                      {client360.clientCode || client360.id}
                    </span>
                    <h2 className="text-base font-black text-slate-900 dark:text-white">
                      {client360.clientName}
                    </h2>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {client360.company || 'Private Client'} • {client360.clientType || 'Corporate'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setClient360(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-Navigation Switcher */}
            <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
              <button
                onClick={() => setClient360Tab('leads')}
                className={`pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${client360Tab === 'leads' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
              >
                <Layers className="w-3.5 h-3.5" /> Project Enquiries / Leads ({client360.leads?.length || client360.leadsCount || 0})
              </button>
              <button
                onClick={() => setClient360Tab('projects')}
                className={`pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${client360Tab === 'projects' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
              >
                <Folder className="w-3.5 h-3.5" /> Converted Projects ({client360.projects?.length || client360.projectsCount || 0})
              </button>
              <button
                onClick={() => setClient360Tab('profile')}
                className={`pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${client360Tab === 'profile' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
              >
                <User className="w-3.5 h-3.5" /> Client Profile & Tax Info
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4">
              {/* TAB 1: Associated Leads */}
              {client360Tab === 'leads' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Requirements & Leads for this Client
                    </p>
                    <button
                      onClick={() => {
                        setClient360(null)
                        navigate(`/crm/leads/create?clientId=${client360.id}`)
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-bold shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> + New Lead for {client360.clientName}
                    </button>
                  </div>

                  {(!client360.leads || client360.leads.length === 0) ? (
                    <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                      <Layers className="w-8 h-8 mx-auto text-slate-400 mb-1" />
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-300">No Leads Captured Yet</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Click the button above to create the first project requirement for this client.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                      {client360.leads.map((l: any) => (
                        <div key={l.id} className="p-4 bg-white dark:bg-slate-900 flex items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-xs text-brand-primary">{l.leadId || `LD-${l.id}`}</span>
                              <p className="font-extrabold text-xs text-slate-900 dark:text-white">{l.leadTitle || l.projectName}</p>
                            </div>
                            <p className="text-[11px] text-slate-500">
                              Type: <strong className="text-slate-700 dark:text-slate-300">{l.projectType || 'Architecture'}</strong> {l.estimatedBudget && `• Budget: ₹${l.estimatedBudget}`}
                            </p>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${(l.status || '').toLowerCase() === 'won' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                            }`}>
                            {l.status || 'Active Lead'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: Converted Projects */}
              {client360Tab === 'projects' && (
                <div className="space-y-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Converted Projects & Drawings for this Client
                  </p>

                  {(!client360.projects || client360.projects.length === 0) ? (
                    <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                      <Folder className="w-8 h-8 mx-auto text-slate-400 mb-1" />
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-300">No Converted Projects Yet</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">When a Lead for this client is marked "Won" / Converted, the Project appears here.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                      {client360.projects.map((p: any) => (
                        <div key={p.id} className="p-4 bg-white dark:bg-slate-900 flex items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-xs text-emerald-600">{p.projectCode}</span>
                              <p className="font-extrabold text-xs text-slate-900 dark:text-white">{p.projectName}</p>
                            </div>
                            <p className="text-[11px] text-slate-500">
                              Status: <strong className="text-slate-700 dark:text-slate-300">{p.status || 'Active'}</strong>
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setClient360(null)
                              navigate(`/documents/drawings?project=${p.projectCode}`)
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                          >
                            <Zap className="w-3.5 h-3.5" /> Open Drawings / MDL
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: Client Profile */}
              {client360Tab === 'profile' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                    <p className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs border-b pb-1.5 border-slate-200 dark:border-slate-700">
                      <Phone className="w-4 h-4 text-brand-primary" /> Contact Particulars
                    </p>
                    <p className="text-slate-600 dark:text-slate-300"><strong>Contact Person:</strong> {client360.contactPerson || 'N/A'}</p>
                    <p className="text-slate-600 dark:text-slate-300"><strong>Mobile:</strong> {client360.mobile || 'N/A'}</p>
                    <p className="text-slate-600 dark:text-slate-300"><strong>Email:</strong> {client360.email || 'N/A'}</p>
                    <p className="text-slate-600 dark:text-slate-300"><strong>Address:</strong> {client360.address || client360.siteAddress || 'N/A'}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                    <p className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs border-b pb-1.5 border-slate-200 dark:border-slate-700">
                      <ShieldCheck className="w-4 h-4 text-brand-primary" /> Regulatory & Identification
                    </p>
                    <p className="text-slate-600 dark:text-slate-300"><strong>GST Number:</strong> <span className="font-mono font-bold">{client360.gstNo || 'N/A'}</span></p>
                    <p className="text-slate-600 dark:text-slate-300"><strong>PAN Number:</strong> <span className="font-mono font-bold">{client360.panNo || 'N/A'}</span></p>
                    <p className="text-slate-600 dark:text-slate-300"><strong>Aadhar Number:</strong> <span className="font-mono font-bold">{client360.aadharNo || 'N/A'}</span></p>
                    <p className="text-slate-600 dark:text-slate-300"><strong>City / State:</strong> {[client360.city, client360.state, client360.country].filter(Boolean).join(', ') || 'N/A'}</p>
                    {client360.remarks && <p className="text-slate-600 dark:text-slate-300"><strong>Remarks:</strong> {client360.remarks}</p>}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              <button
                onClick={() => setClient360(null)}
                className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ═════════════════════════════════════════════════════════════════════════
          LEAD DETAILS MODAL & DRAWING PREVIEW MODALS
      ═════════════════════════════════════════════════════════════════════════ */}
      {selectedLeadDetails && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-brand-primary/5 dark:bg-brand-primary/10">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary font-black">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-brand-primary bg-brand-primary/10 px-2.5 py-0.5 rounded-md">
                      {selectedLeadDetails.leadId || selectedLeadDetails.id || 'LEAD'}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
                      {selectedLeadDetails.status || 'New Lead'}
                    </span>
                  </div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                    {selectedLeadDetails.leadTitle || selectedLeadDetails.leadName || selectedLeadDetails.projectName || 'Project Requirement'}
                  </h2>
                </div>
              </div>
              <button
                onClick={() => setSelectedLeadDetails(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 dark:text-slate-200">

              {/* Top Overview Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Category</p>
                  <p className="font-extrabold text-slate-900 dark:text-white mt-0.5 text-xs">
                    {selectedLeadDetails.projectType || selectedLeadDetails.category || selectedLeadDetails.leadCategory || 'N/A'}
                  </p>
                  {selectedLeadDetails.projectSubType && (
                    <p className="text-[10px] text-brand-primary font-semibold">{selectedLeadDetails.projectSubType}</p>
                  )}
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Estimated Budget</p>
                  <p className="font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 text-xs font-mono">
                    {selectedLeadDetails.estimatedBudget ? `₹${selectedLeadDetails.estimatedBudget}` : 'N/A'}
                  </p>
                  {selectedLeadDetails.fundingSource && (
                    <p className="text-[10px] text-slate-400">Funding: {selectedLeadDetails.fundingSource}</p>
                  )}
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Lead Source</p>
                  <p className="font-extrabold text-slate-900 dark:text-white mt-0.5 text-xs">
                    {selectedLeadDetails.leadSource || selectedLeadDetails.source || 'Direct / Referral'}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Assigned Lead Owner</p>
                  <p className="font-extrabold text-slate-900 dark:text-white mt-0.5 text-xs">
                    {selectedLeadDetails.assignedEmployee || selectedLeadDetails.assignedTo || 'Unassigned'}
                  </p>
                  {selectedLeadDetails.branch && (
                    <p className="text-[10px] text-slate-400">Branch: {selectedLeadDetails.branch}</p>
                  )}
                </div>
              </div>

              {/* 1. Client & Contact Particulars */}
              <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-3">
                <h3 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2 text-xs uppercase tracking-wider">
                  <Users className="w-4 h-4 text-brand-primary" /> Client & Contact Particulars
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Client / Company Name</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">{selectedLeadDetails.clientName || selectedLeadDetails.company || selectedLeadDetails.organisation || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Contact Person</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">{selectedLeadDetails.contactPerson || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Phone / Mobile</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-100">{selectedLeadDetails.mobile || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Email Address</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">{selectedLeadDetails.email || 'N/A'}</span>
                  </div>
                  {selectedLeadDetails.decisionMakers && (
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Key Decision Makers</span>
                      <span className="font-medium text-slate-800 dark:text-slate-100">{selectedLeadDetails.decisionMakers}</span>
                    </div>
                  )}
                  {selectedLeadDetails.priorProjectsWithSSA && (
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Prior Projects with SSA</span>
                      <span className="font-medium text-slate-800 dark:text-slate-100">{selectedLeadDetails.priorProjectsWithSSA}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Site & Location Details */}
              <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-3">
                <h3 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2 text-xs uppercase tracking-wider">
                  <MapPin className="w-4 h-4 text-brand-primary" /> Site & Physical Location
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Site Address</span>
                    <span className="font-medium text-slate-800 dark:text-slate-100">{selectedLeadDetails.siteAddress || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">City / State / Country</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">
                      {[selectedLeadDetails.city, selectedLeadDetails.state, selectedLeadDetails.country].filter(Boolean).join(', ') || 'N/A'}
                    </span>
                  </div>
                  {selectedLeadDetails.surveyNumber && (
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Survey / Plot Number</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-100">{selectedLeadDetails.surveyNumber}</span>
                    </div>
                  )}
                  {selectedLeadDetails.siteArea && (
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Site Area</span>
                      <span className="font-bold text-slate-800 dark:text-slate-100">{selectedLeadDetails.siteArea} {selectedLeadDetails.unit || 'Sq.Ft'}</span>
                    </div>
                  )}
                  {selectedLeadDetails.accessRoadWidth && (
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Access Road Width</span>
                      <span className="font-medium text-slate-800 dark:text-slate-100">{selectedLeadDetails.accessRoadWidth}</span>
                    </div>
                  )}
                  {selectedLeadDetails.orientation && (
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Site Facing / Orientation</span>
                      <span className="font-medium text-slate-800 dark:text-slate-100">{selectedLeadDetails.orientation}</span>
                    </div>
                  )}
                  {selectedLeadDetails.topographyLevels && (
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Topography / Ground Levels</span>
                      <span className="font-medium text-slate-800 dark:text-slate-100">{selectedLeadDetails.topographyLevels}</span>
                    </div>
                  )}
                  {selectedLeadDetails.soilReportAvailable && (
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Soil Test Report</span>
                      <span className="font-medium text-slate-800 dark:text-slate-100">{selectedLeadDetails.soilReportAvailable}</span>
                    </div>
                  )}
                  {selectedLeadDetails.existingStructures && (
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Existing Structures / Demolition</span>
                      <span className="font-medium text-slate-800 dark:text-slate-100">{selectedLeadDetails.existingStructures}</span>
                    </div>
                  )}
                  {selectedLeadDetails.adjacentDevelopments && (
                    <div className="sm:col-span-2">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Adjacent Developments</span>
                      <span className="font-medium text-slate-800 dark:text-slate-100">{selectedLeadDetails.adjacentDevelopments}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Project Scope, Schedule & Statutory Requirements */}
              <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-3">
                <h3 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2 text-xs uppercase tracking-wider">
                  <Briefcase className="w-4 h-4 text-brand-primary" /> Scope, Timeline & Regulatory
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {selectedLeadDetails.expectedFloors && (
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Expected Floors / Height</span>
                      <span className="font-medium text-slate-800 dark:text-slate-100">{selectedLeadDetails.expectedFloors}</span>
                    </div>
                  )}
                  {selectedLeadDetails.expectedStartDate && (
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Target Start Date</span>
                      <span className="font-medium text-slate-800 dark:text-slate-100">{selectedLeadDetails.expectedStartDate}</span>
                    </div>
                  )}
                  {selectedLeadDetails.expectedCompletionDate && (
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Target Completion Date</span>
                      <span className="font-medium text-slate-800 dark:text-slate-100">{selectedLeadDetails.expectedCompletionDate}</span>
                    </div>
                  )}
                  {selectedLeadDetails.approvingAuthority && (
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Approving Authority / Jurisdiction</span>
                      <span className="font-medium text-slate-800 dark:text-slate-100">{selectedLeadDetails.approvingAuthority}</span>
                    </div>
                  )}
                  {selectedLeadDetails.landUseZoning && (
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Zoning / Master Plan</span>
                      <span className="font-medium text-slate-800 dark:text-slate-100">{selectedLeadDetails.landUseZoning}</span>
                    </div>
                  )}
                  {selectedLeadDetails.fsiCoverageKnown && (
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">FSI / Permissible Coverage</span>
                      <span className="font-medium text-slate-800 dark:text-slate-100">{selectedLeadDetails.fsiCoverageKnown}</span>
                    </div>
                  )}
                  {selectedLeadDetails.phasingNeeds && (
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Phasing / Staged Delivery</span>
                      <span className="font-medium text-slate-800 dark:text-slate-100">{selectedLeadDetails.phasingNeeds}</span>
                    </div>
                  )}
                  {selectedLeadDetails.contractorStatus && (
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Contractor Status</span>
                      <span className="font-medium text-slate-800 dark:text-slate-100">{selectedLeadDetails.contractorStatus}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 4. Utilities & Infrastructure */}
              {(selectedLeadDetails.ebSupplySanctionedLoad || selectedLeadDetails.waterSource || selectedLeadDetails.sewerSeptic || selectedLeadDetails.stormDrainage) && (
                <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-3">
                  <h3 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2 text-xs uppercase tracking-wider">
                    <Zap className="w-4 h-4 text-amber-500" /> Utilities & Services Infrastructure
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {selectedLeadDetails.ebSupplySanctionedLoad && (
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Electricity / Power Sanction</span>
                        <span className="font-medium text-slate-800 dark:text-slate-100">{selectedLeadDetails.ebSupplySanctionedLoad}</span>
                      </div>
                    )}
                    {selectedLeadDetails.waterSource && (
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Water Supply Source</span>
                        <span className="font-medium text-slate-800 dark:text-slate-100">{selectedLeadDetails.waterSource}</span>
                      </div>
                    )}
                    {selectedLeadDetails.sewerSeptic && (
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Sewerage / Septic System</span>
                        <span className="font-medium text-slate-800 dark:text-slate-100">{selectedLeadDetails.sewerSeptic}</span>
                      </div>
                    )}
                    {selectedLeadDetails.stormDrainage && (
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Stormwater Drainage</span>
                        <span className="font-medium text-slate-800 dark:text-slate-100">{selectedLeadDetails.stormDrainage}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 5. Architectural & Design Intent */}
              {(selectedLeadDetails.styleReferencesInspiration || selectedLeadDetails.sustainabilityGoals || selectedLeadDetails.vaastuOrientationRequirements || selectedLeadDetails.materialPreferences || selectedLeadDetails.remarks) && (
                <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-3">
                  <h3 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2 text-xs uppercase tracking-wider">
                    <Tag className="w-4 h-4 text-brand-primary" /> Architectural Intent & Notes
                  </h3>
                  <div className="space-y-2">
                    {selectedLeadDetails.styleReferencesInspiration && (
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Style References & Inspiration</span>
                        <p className="font-medium text-slate-800 dark:text-slate-100">{selectedLeadDetails.styleReferencesInspiration}</p>
                      </div>
                    )}
                    {selectedLeadDetails.vaastuOrientationRequirements && (
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Vaastu & Directional Guidelines</span>
                        <p className="font-medium text-slate-800 dark:text-slate-100">{selectedLeadDetails.vaastuOrientationRequirements}</p>
                      </div>
                    )}
                    {selectedLeadDetails.sustainabilityGoals && (
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Sustainability & Green Goals</span>
                        <p className="font-medium text-slate-800 dark:text-slate-100">{selectedLeadDetails.sustainabilityGoals}</p>
                      </div>
                    )}
                    {selectedLeadDetails.materialPreferences && (
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Material Preferences</span>
                        <p className="font-medium text-slate-800 dark:text-slate-100">{selectedLeadDetails.materialPreferences}</p>
                      </div>
                    )}
                    {selectedLeadDetails.remarks && (
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">General Remarks / Notes</span>
                        <p className="font-medium text-slate-800 dark:text-slate-100">{selectedLeadDetails.remarks}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 6. Dynamic Category Questionnaire Responses */}
              {selectedLeadDetails.categoryValues && typeof selectedLeadDetails.categoryValues === 'object' && Object.keys(selectedLeadDetails.categoryValues).length > 0 && (
                <div className="p-4 rounded-2xl bg-brand-primary/5 dark:bg-brand-primary/10 border border-brand-primary/20 space-y-3">
                  <h3 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2 text-xs uppercase tracking-wider text-brand-primary">
                    <Layers className="w-4 h-4" /> Category Questionnaire Responses
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(selectedLeadDetails.categoryValues).map(([key, val]) => {
                      const displayVal = typeof val === 'object' ? JSON.stringify(val) : String(val || '')
                      if (!displayVal.trim()) return null
                      const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
                      return (
                        <div key={key} className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">{label}</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-100">{displayVal}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              <div className="text-[11px] text-slate-400">
                {(selectedLeadDetails.status || '').toLowerCase() === 'draft' ? (
                  <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" /> Draft lead: Complete and submit this lead before it can be converted.
                  </span>
                ) : (
                  <span>Full requirement brief captured during lead discovery.</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {(selectedLeadDetails.status || '').toLowerCase() === 'draft' ? (
                  <button
                    onClick={() => {
                      const idToEdit = selectedLeadDetails.dbId || selectedLeadDetails.id
                      setSelectedLeadDetails(null)
                      navigate(`/crm/leads/edit/${idToEdit}`)
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit & Complete Lead
                  </button>
                ) : !['won', 'converted'].includes((selectedLeadDetails.status || '').toLowerCase()) && (
                  <button
                    onClick={() => {
                      const leadToConvert = selectedLeadDetails
                      setSelectedLeadDetails(null)
                      initiateConvertWorkflow(leadToConvert)
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5" /> Convert to Project
                  </button>
                )}
                <button
                  onClick={() => setSelectedLeadDetails(null)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white text-xs font-bold cursor-pointer transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Categories & Questions Modal */}
      <CategoryQuestionManagerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />

      {/* ADD DRAWING MODAL */}
      {isAddDrawingModalOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-brand-primary/5 dark:bg-brand-primary/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary font-extrabold">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Add Drawing Deliverable
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Discipline: <strong className="font-mono text-brand-primary">{drawingDisciplineFilter}</strong> • {selectedDrawingProject?.companyName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddDrawingModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDrawing} className="p-6 overflow-y-auto space-y-4 text-xs">
              {drawingFolderSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{drawingFolderSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Discipline <span className="text-red-500">*</span>
                </label>
                <select
                  value={drawingForm.discipline}
                  onChange={(e) => {
                    const newDisc = e.target.value
                    const pId = selectedDrawingProject?.id || selectedDrawingProject?.projectCode || ''
                    const pCode = selectedDrawingProject?.projectCode || deriveProjectCodeFromName(selectedDrawingProject?.companyName || selectedDrawingProject?.company || 'Project', pId)
                    const nextNum = String(projectDrawingsList.filter(d => (d.discipline === newDisc || d.disciplineCode === newDisc)).length + 1).padStart(3, '0')
                    setDrawingForm({
                      ...drawingForm,
                      discipline: newDisc,
                      drawingNumber: `${pCode}-${newDisc}-${drawingForm.level}-${nextNum}`,
                      drawingTitle: `${drawingForm.level === 'GF' ? 'Ground Floor' : drawingForm.level} ${DISCIPLINE_CATALOG[newDisc as DisciplineCode]?.name || newDisc} Plan`
                    })
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-semibold text-xs outline-none focus:border-brand-primary cursor-pointer"
                >
                  {selectedDrawingProject?.disciplines && selectedDrawingProject.disciplines.length > 0 ? (
                    selectedDrawingProject.disciplines.map((code: string) => (
                      <option key={code} value={code}>
                        {code} — {DISCIPLINE_CATALOG[code as DisciplineCode]?.name || code}
                      </option>
                    ))
                  ) : (
                    Object.entries(DISCIPLINE_CATALOG).map(([code, meta]) => (
                      <option key={code} value={code}>
                        {code} — {meta.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Drawing Package / Subfolder Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Drawing Folder / Package
                </label>
                <select
                  value={drawingForm.subFolder}
                  onChange={(e) => setDrawingForm({ ...drawingForm, subFolder: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-semibold text-xs outline-none focus:border-brand-primary cursor-pointer"
                >
                  <option value="">General / Root Deliverable</option>
                  {/* Created drawing folders */}
                  {subFoldersList.filter(s => s.discipline === (drawingForm.discipline || drawingDisciplineFilter)).map(sub => (
                    <option key={sub.id} value={sub.name}>
                      📁 {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Drawing Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={drawingForm.drawingTitle}
                  onChange={(e) => setDrawingForm({ ...drawingForm, drawingTitle: e.target.value })}
                  placeholder="e.g. Ground Floor Architectural Plan"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-semibold outline-none focus:border-brand-primary text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Drawing Number / Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={drawingForm.drawingNumber}
                    onChange={(e) => setDrawingForm({ ...drawingForm, drawingNumber: e.target.value })}
                    placeholder="e.g. GVR-2026-001-AR-GF-001"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-mono font-bold text-xs outline-none focus:border-brand-primary"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Floor / Level
                  </label>
                  <select
                    value={drawingForm.level}
                    onChange={(e) => {
                      const newLvl = e.target.value
                      const pId = selectedDrawingProject?.id || selectedDrawingProject?.projectCode || ''
                      const pCode = selectedDrawingProject?.projectCode || deriveProjectCodeFromName(selectedDrawingProject?.companyName || selectedDrawingProject?.company || 'Project', pId)
                      const disc = drawingForm.discipline || (drawingDisciplineFilter !== 'ALL' ? drawingDisciplineFilter : 'AR')
                      setDrawingForm({
                        ...drawingForm,
                        level: newLvl,
                        drawingNumber: `${pCode}-${disc}-${newLvl}-001`,
                        drawingTitle: `${newLvl === 'GF' ? 'Ground Floor' : newLvl} ${DISCIPLINE_CATALOG[disc as DisciplineCode]?.name || disc} Plan`
                      })
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-semibold text-xs outline-none focus:border-brand-primary"
                  >
                    <option value="GF">Ground Floor (GF)</option>
                    <option value="01">1st Floor (01)</option>
                    <option value="02">2nd Floor (02)</option>
                    <option value="03">3rd Floor (03)</option>
                    <option value="B1">Basement 1 (B1)</option>
                    <option value="B2">Basement 2 (B2)</option>
                    <option value="RF">Roof / Terrace (RF)</option>
                    <option value="ALL">All Levels / Typical (ALL)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Revision Number
                  </label>
                  <input
                    type="text"
                    value={drawingForm.revisionNumber}
                    onChange={(e) => setDrawingForm({ ...drawingForm, revisionNumber: e.target.value })}
                    placeholder="e.g. R00"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-mono font-bold text-xs outline-none focus:border-brand-primary"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Prepared By
                  </label>
                  <input
                    type="text"
                    value={drawingForm.preparedBy}
                    onChange={(e) => setDrawingForm({ ...drawingForm, preparedBy: e.target.value })}
                    placeholder="e.g. Architect / Engineer"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-medium text-xs outline-none focus:border-brand-primary"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Initial Status
                  </label>
                  <select
                    value={drawingForm.status}
                    onChange={(e) => setDrawingForm({ ...drawingForm, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-semibold text-xs outline-none focus:border-brand-primary"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Approved">Approved</option>
                    <option value="Issued for Construction">Issued for Construction</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Upload Drawing / Deliverable File (PDF, DWG, Image)
                </label>
                <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-brand-primary rounded-2xl p-4 text-center cursor-pointer transition-colors">
                  <input
                    type="file"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedDrawingFile(e.target.files[0])
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <Upload className="w-6 h-6 text-brand-primary" />
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      {selectedDrawingFile ? selectedDrawingFile.name : 'Click to select or drag drawing file'}
                    </p>
                    <p className="text-[10px] text-slate-400">PDF, DWG, PNG, JPG supported</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Purpose / Scope Remarks (Optional)
                </label>
                <textarea
                  rows={2}
                  value={drawingForm.purpose}
                  onChange={(e) => setDrawingForm({ ...drawingForm, purpose: e.target.value })}
                  placeholder="e.g. Master layout floor plan for review and approvals"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-medium outline-none focus:border-brand-primary resize-none text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddDrawingModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingDrawing}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-xs font-extrabold text-white shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingDrawing ? 'Adding...' : 'Add Drawing'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* DRAWING PREVIEW MODAL */}
      {previewDrawing && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-7xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[96vh]">
            {(() => {
              const rawUrl = getDrawingFileUrl(previewDrawing) || previewDrawing.fileUrl || previewDrawing.url || previewDrawing.file || previewDrawing.filePath || ''
              const hasValidUrl = rawUrl && !rawUrl.endsWith('placeholder') && (rawUrl.startsWith('http') || rawUrl.startsWith('blob:') || rawUrl.startsWith('data:'))
              const currentStage = getDrawingWorkflowStage(previewDrawing.status)
              const dwgId = previewDrawing.id || previewDrawing.drawingNumber || previewDrawing.drawingCode
              const isDrawing = isDrawingDiscipline(previewDrawing.discipline || drawingDisciplineFilter)

              return (
                <>
                  {/* Sleek, Unified Modern Top Bar */}
                  <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
                    {/* Left: Code, Title & Specs */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {(previewDrawing.drawingNumber || previewDrawing.drawingCode) && (
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-black text-[11px] border border-slate-200 dark:border-slate-700 shrink-0">
                              {previewDrawing.drawingNumber || previewDrawing.drawingCode}
                            </span>
                          )}
                          <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">
                            {previewDrawing.drawingTitle || previewDrawing.title || previewDrawing.originalFileName || 'Document Preview'}
                          </h3>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2 mt-0.5 truncate">
                          {previewDrawing.level && <span>Level: <strong className="text-slate-600 dark:text-slate-300">{previewDrawing.level}</strong></span>}
                          {previewDrawing.revisionNumber && <span>• Rev: <strong className="text-slate-600 dark:text-slate-300">{previewDrawing.revisionNumber}</strong></span>}
                          {previewDrawing.discipline && <span>• Disc: <strong className="text-slate-600 dark:text-slate-300">{previewDrawing.discipline}</strong></span>}
                          {previewDrawing.preparedBy && <span>• Drafter: <strong className="text-slate-600 dark:text-slate-300">{previewDrawing.preparedBy}</strong></span>}
                        </div>
                      </div>
                    </div>

                    {/* Center: Slim Minimalist Workflow Stepper (For Drawing Deliverables) */}
                    {isDrawing && (
                      <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shrink-0">
                        {DRAWING_WORKFLOW_FOLDERS.map((f, idx) => {
                          const isActive = currentStage === f.id
                          const isPast = (
                            (currentStage === 'REVIEW' && idx === 0) ||
                            (currentStage === 'SHARED' && idx <= 1) ||
                            (currentStage === 'ARCHIVE' && idx <= 2)
                          )

                          return (
                            <React.Fragment key={f.id}>
                              {idx > 0 && <span className="text-[10px] text-slate-300 dark:text-slate-600">→</span>}
                              <div
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold flex items-center gap-1 transition-all ${isActive
                                  ? f.activeBg
                                  : isPast
                                    ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                                    : 'text-slate-400 opacity-60'
                                  }`}
                              >
                                {isPast && <span>✓</span>}
                                <span>{f.shortName}</span>
                              </div>
                            </React.Fragment>
                          )
                        })}
                      </div>
                    )}

                    {/* Right: Quick Action Controls */}
                    <div className="flex items-center gap-2 shrink-0">
                      {isDrawing && currentStage === 'WIP' && (
                        <button
                          type="button"
                          onClick={() => openSubmitReviewModal(previewDrawing)}
                          className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs inline-flex items-center gap-1.5 shadow-sm transition-all cursor-pointer whitespace-nowrap active:scale-95"
                        >
                          <span>➔ Submit for Review</span>
                        </button>
                      )}

                      {isDrawing && currentStage === 'REVIEW' && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setReviewActionModal({
                                isOpen: true,
                                drawing: previewDrawing,
                                action: 'approve',
                                note: ''
                              })
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs inline-flex items-center gap-1.5 shadow-sm transition-all cursor-pointer whitespace-nowrap active:scale-95"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve & Share</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setReviewActionModal({
                                isOpen: true,
                                drawing: previewDrawing,
                                action: 'rework',
                                note: ''
                              })
                            }}
                            className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 font-extrabold text-xs inline-flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap active:scale-95"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Request Rework</span>
                          </button>
                        </>
                      )}

                      {isDrawing && currentStage === 'SHARED' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateDrawingStatus(dwgId, 'Archived')}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-extrabold text-xs inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                        >
                          <Archive className="w-3.5 h-3.5" />
                          <span>Archive</span>
                        </button>
                      )}

                      {isDrawing && currentStage === 'ARCHIVE' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateDrawingStatus(dwgId, 'Draft')}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-extrabold text-xs inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Restore</span>
                        </button>
                      )}

                      {hasValidUrl && (
                        <a
                          href={rawUrl}
                          download={previewDrawing.originalFileName || `${previewDrawing.drawingTitle || 'document'}.pdf`}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-extrabold text-xs inline-flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
                          title="Download Document"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Download</span>
                        </a>
                      )}

                      <button
                        onClick={() => setPreviewDrawing(null)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Close Viewer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Slim Notification Banner (If Notes or Instructions Present) */}
                  {(previewDrawing.reviewNotes || previewDrawing.drafterNotes) && (
                    <div className="px-4 py-2 border-b border-amber-500/20 bg-amber-500/5 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between gap-3 shrink-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                        <p className="truncate">
                          <strong className="font-bold">
                            {previewDrawing.reviewNotes ? 'Correction Notes: ' : 'Drafter Scope: '}
                          </strong>
                          <span>{previewDrawing.reviewNotes || previewDrawing.drafterNotes}</span>
                          {previewDrawing.reviewedBy && <span className="opacity-75 font-medium ml-1.5">— by {previewDrawing.reviewedBy}</span>}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Full-Height Edge-to-Edge Document Canvas */}
                  <div className="flex-1 bg-slate-900 overflow-hidden flex items-center justify-center relative w-full h-full">
                    {hasValidUrl ? (() => {
                      const isImage = /\.(png|jpg|jpeg|webp|gif|svg)(\?.*)?$/i.test(rawUrl) || (previewDrawing.originalFileName && /\.(png|jpg|jpeg|webp|gif|svg)$/i.test(previewDrawing.originalFileName))

                      if (isImage) {
                        return (
                          <div className="w-full h-full flex items-center justify-center p-3 overflow-auto">
                            <img
                              src={rawUrl}
                              alt={previewDrawing.drawingTitle || 'Drawing Preview'}
                              className="max-h-full max-w-full object-contain rounded-lg shadow-xl"
                            />
                          </div>
                        )
                      }

                      if (pdfLoading || !blobPdfUrl) {
                        return (
                          <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                            <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
                            <p className="text-xs font-bold text-slate-300">Loading document...</p>
                          </div>
                        )
                      }

                      return (
                        <iframe
                          src={blobPdfUrl}
                          className="w-full h-full border-none bg-white"
                          title={previewDrawing.drawingTitle || previewDrawing.originalFileName || 'Document Preview'}
                          allow="fullscreen"
                        />
                      )
                    })() : (
                      <div className="text-center space-y-3 p-8 bg-slate-800/80 border border-slate-700 rounded-2xl max-w-md mx-4">
                        <FileText className="w-12 h-12 text-amber-500 mx-auto opacity-80" />
                        <h4 className="text-sm sm:text-base font-extrabold text-white">{previewDrawing.drawingTitle || 'Drawing Details'}</h4>
                        <p className="text-xs text-slate-400 font-mono">
                          {previewDrawing.drawingNumber} • Level: {previewDrawing.level || 'GF'} • Rev: {previewDrawing.revisionNumber || 'R00'}
                        </p>
                        <p className="text-xs text-amber-400 font-semibold pt-1">No file document attached to this drawing record.</p>
                      </div>
                    )}
                  </div>
                </>
              )
            })()}
          </div>
        </div>,
        document.body
      )}

      {/* ═════════════════════════════════════════════════════════════════════════
          SUBMIT DRAWING FOR INTERNAL REVIEW MODAL
      ═════════════════════════════════════════════════════════════════════════ */}
      {submitReviewModal.isOpen && submitReviewModal.drawing && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-scale-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-purple-500/20 bg-purple-500/10 text-purple-900 dark:text-purple-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-extrabold shadow-md shadow-purple-600/20">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Submit for Internal Review
                  </h3>
                  <p className="text-xs text-purple-600 dark:text-purple-400 font-mono font-bold">
                    {submitReviewModal.drawing.drawingNumber || submitReviewModal.drawing.drawingCode}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSubmitReviewModal({ ...submitReviewModal, isOpen: false, drawing: null })}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              {/* Drawing Info summary card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <p className="text-slate-800 dark:text-white font-bold text-xs">
                  {submitReviewModal.drawing.drawingTitle || submitReviewModal.drawing.title}
                </p>
                <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2 mt-1 flex-wrap">
                  <span>Level: <strong className="text-slate-700 dark:text-slate-200">{submitReviewModal.drawing.level || 'GF'}</strong></span>
                  <span>• Rev: <strong className="text-slate-700 dark:text-slate-200">{submitReviewModal.drawing.revisionNumber || 'R00'}</strong></span>
                  <span>• Discipline: <strong className="text-slate-700 dark:text-slate-200">{submitReviewModal.drawing.discipline}</strong></span>
                </div>
              </div>

              {/* Reviewer / Checker Assignment (Interactive Card Grid) */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    Send Review To (Select Checker / Lead in Company) <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold">
                    {availableReviewers.length} Reviewers Available
                  </span>
                </div>

                {/* Search Bar */}
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={reviewerSearchTerm}
                    onChange={(e) => setReviewerSearchTerm(e.target.value)}
                    placeholder="Search by reviewer name, designation or department..."
                    className="w-full pl-8 pr-3 py-1.5 text-[11px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 outline-none focus:border-purple-500"
                  />
                </div>

                {/* Reviewers List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 border border-slate-200 dark:border-slate-700/80 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50">
                  {(() => {
                    const filtered = availableReviewers.filter(r =>
                      r.name.toLowerCase().includes(reviewerSearchTerm.toLowerCase()) ||
                      r.role.toLowerCase().includes(reviewerSearchTerm.toLowerCase()) ||
                      r.department.toLowerCase().includes(reviewerSearchTerm.toLowerCase())
                    )

                    if (filtered.length === 0) {
                      return (
                        <div className="col-span-2 p-4 text-center text-slate-400 text-xs">
                          No team members match "{reviewerSearchTerm}"
                        </div>
                      )
                    }

                    return filtered.map((r) => {
                      const isSelected = String(submitReviewModal.reviewerId) === String(r.id)
                      const initials = (r.name || 'MD').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()

                      return (
                        <div
                          key={r.id}
                          onClick={() => {
                            setSubmitReviewModal({
                              ...submitReviewModal,
                              reviewerId: r.id,
                              reviewerName: r.name,
                              reviewerRole: r.role,
                              reviewerEmail: r.email
                            })
                          }}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${isSelected
                            ? 'bg-purple-600/10 dark:bg-purple-600/20 border-purple-500 ring-2 ring-purple-500/30 text-purple-950 dark:text-purple-100 shadow-sm'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700 text-slate-700 dark:text-slate-200'
                            }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-[11px] shrink-0 ${isSelected
                              ? 'bg-purple-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                              }`}>
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <p className="font-extrabold text-xs truncate leading-tight">
                                {r.name}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
                                  {r.role}
                                </span>
                                {r.department && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-700/80 text-slate-500 dark:text-slate-400 font-mono">
                                    {r.department}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-all ${isSelected
                            ? 'bg-purple-600 border-purple-600 text-white'
                            : 'border-slate-300 dark:border-slate-600 bg-transparent'
                            }`}>
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </div>
                        </div>
                      )
                    })
                  })()}
                </div>

                {/* Selected Reviewer summary banner */}
                <div className="mt-2 flex items-center justify-between text-[11px] text-purple-700 dark:text-purple-300 bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 rounded-xl font-medium">
                  <span>Selected Checker:</span>
                  <span className="font-bold flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    {submitReviewModal.reviewerName} ({submitReviewModal.reviewerRole})
                  </span>
                </div>
              </div>

              {/* Priority & Due Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Review Priority
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['Normal', 'High', 'Urgent'] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setSubmitReviewModal({ ...submitReviewModal, priority: p })}
                        className={`py-2 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${submitReviewModal.priority === p
                          ? p === 'Urgent'
                            ? 'bg-red-500 text-white border-red-500 shadow-xs'
                            : p === 'High'
                              ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                              : 'bg-purple-600 text-white border-purple-600 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                          }`}
                      >
                        {p === 'Urgent' ? '⚡ Urgent' : p === 'High' ? '★ High' : 'Normal'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Target Due Date
                  </label>
                  <input
                    type="date"
                    value={submitReviewModal.dueDate}
                    onChange={(e) => setSubmitReviewModal({ ...submitReviewModal, dueDate: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-medium outline-none focus:border-purple-500 text-xs"
                  />
                </div>
              </div>

              {/* Drafter Notes / Instructions */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Drafter Notes & Items to Verify
                </label>
                <textarea
                  rows={3}
                  value={submitReviewModal.drafterNotes}
                  onChange={(e) => setSubmitReviewModal({ ...submitReviewModal, drafterNotes: e.target.value })}
                  placeholder="e.g. Please check beam clearances on grid 3, staircase headroom height, and wall thickness for fire compliance."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-medium outline-none focus:border-purple-500 resize-none text-xs"
                />
              </div>

              {/* Notification Dispatch Banner */}
              <div className="p-3 rounded-2xl bg-purple-500/5 dark:bg-purple-500/10 border border-purple-500/20 text-purple-800 dark:text-purple-300 text-[11px] flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0 text-purple-600 dark:text-purple-400" />
                <span>
                  Notification will be sent to <strong>{submitReviewModal.reviewerName || 'Checker'}</strong> ({submitReviewModal.reviewerEmail || 'company team'}).
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              <button
                type="button"
                onClick={() => setSubmitReviewModal({ ...submitReviewModal, isOpen: false, drawing: null })}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitForReview}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-xs font-extrabold text-white shadow-md shadow-purple-600/20 transition-all cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
                <span>Send to {submitReviewModal.reviewerName || 'Reviewer'}</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ═════════════════════════════════════════════════════════════════════════
          DRAWING REVIEW & REWORK ACTION MODAL (With Review Notes)
      ═════════════════════════════════════════════════════════════════════════ */}
      {reviewActionModal.isOpen && reviewActionModal.drawing && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-scale-up">
            {/* Modal Header */}
            <div className={`flex items-center justify-between px-6 py-5 border-b ${reviewActionModal.action === 'approve'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300'
              : 'bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-300'
              }`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-extrabold ${reviewActionModal.action === 'approve'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-amber-500 text-white'
                  }`}>
                  {reviewActionModal.action === 'approve' ? <CheckCircle2 className="w-5 h-5" /> : <RotateCcw className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {reviewActionModal.action === 'approve' ? 'Approve & Share Drawing' : 'Request Drawing Rework'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    {reviewActionModal.drawing.drawingNumber || reviewActionModal.drawing.drawingCode}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReviewActionModal({ isOpen: false, drawing: null, action: 'submit_review', note: '' })}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <p className="text-slate-800 dark:text-white font-bold">
                  {reviewActionModal.drawing.drawingTitle || reviewActionModal.drawing.title}
                </p>
                <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2 mt-1">
                  <span>Level: <strong>{reviewActionModal.drawing.level || 'GF'}</strong></span>
                  <span>• Rev: <strong>{reviewActionModal.drawing.revisionNumber || 'R00'}</strong></span>
                  <span>• Discipline: <strong>{reviewActionModal.drawing.discipline}</strong></span>
                </div>
              </div>

              {reviewActionModal.action === 'approve' ? (
                <div className="space-y-2">
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs">
                    <p className="font-bold">✓ Approval Stage Movement</p>
                    <p className="text-[11px] mt-0.5 leading-relaxed text-emerald-700 dark:text-emerald-400">
                      Approving this drawing will immediately move it from <strong>2. Under Review</strong> to <strong>3. Shared</strong> and make it available for Client release, PMC checks, and GFC distribution.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                      Approval Remarks / Verification Note (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={reviewActionModal.note}
                      onChange={(e) => setReviewActionModal({ ...reviewActionModal, note: e.target.value })}
                      placeholder="e.g. Dimensions verified against structural grid. Approved for GFC release."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-medium outline-none focus:border-emerald-500 resize-none text-xs"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-300 text-xs">
                    <p className="font-bold">↻ Rework Stage Movement</p>
                    <p className="text-[11px] mt-0.5 leading-relaxed text-amber-800 dark:text-amber-400">
                      Sending this drawing for rework will move it back from <strong>2. Under Review</strong> to <strong>1. Work In Progress</strong>. Your review notes will be attached to the drawing so the draughtsperson can make the necessary changes.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                      Review Notes & Corrections Required <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={reviewActionModal.note}
                      onChange={(e) => setReviewActionModal({ ...reviewActionModal, note: e.target.value })}
                      placeholder="e.g. Please revise staircase riser height, check beam cutout dimensions on grid 4, and re-verify bathroom door swing."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-medium outline-none focus:border-amber-500 resize-none text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              <button
                type="button"
                onClick={() => setReviewActionModal({ isOpen: false, drawing: null, action: 'submit_review', note: '' })}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              {reviewActionModal.action === 'approve' ? (
                <button
                  type="button"
                  onClick={() => {
                    const dwgId = reviewActionModal.drawing.id || reviewActionModal.drawing.drawingNumber || reviewActionModal.drawing.drawingCode
                    handleUpdateDrawingStatus(dwgId, 'Approved', reviewActionModal.note || 'Approved by Checker')
                    setReviewActionModal({ isOpen: false, drawing: null, action: 'submit_review', note: '' })
                  }}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-extrabold text-white shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Approval & Share</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!reviewActionModal.note.trim()}
                  onClick={() => {
                    const dwgId = reviewActionModal.drawing.id || reviewActionModal.drawing.drawingNumber || reviewActionModal.drawing.drawingCode
                    handleUpdateDrawingStatus(dwgId, 'Revision Required', reviewActionModal.note)
                    setReviewActionModal({ isOpen: false, drawing: null, action: 'submit_review', note: '' })
                  }}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-xs font-extrabold text-white shadow-md shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Send Back to Work In Progress</span>
                </button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}


      {/* DELETE CONFIRMATION POPUP MODAL */}
      {deleteConfirm && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 text-center animate-scale-up">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4 text-red-600 dark:text-red-400">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Delete {deleteConfirm.type === 'client' ? 'Client' : 'Lead'}?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Are you sure you want to delete <strong className="text-slate-800 dark:text-slate-200">"{deleteConfirm.name}"</strong>? This action cannot be undone.
            </p>

            <div className="flex items-center justify-center gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                disabled={deleteLoading}
                onClick={() => setDeleteConfirm(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white shadow-md shadow-red-600/20 transition-all cursor-pointer inline-flex items-center gap-2 disabled:opacity-50"
              >
                {deleteLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* TOAST NOTIFICATION POPUP */}
      {toast && createPortal(
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold ${toast.type === 'success'
            ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/40 backdrop-blur-md'
            : 'bg-red-950/90 text-red-200 border-red-500/40 backdrop-blur-md'
            }`}>
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span className="flex-1">{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
