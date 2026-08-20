import React, { useState, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { initialDrawings, type Drawing } from '../../data/mockData'
import {
  DISCIPLINE_CATALOG,
  STANDARD_FLOORS,
  generateMasterDrawingList,
  deriveProjectCodeFromName,
} from '../../data/masterDrawingListData'
import type { DisciplineCode } from '../../data/masterDrawingListData'
import {
  HOSPITAL_ANNEXURE_CATALOG,
  calculateHospitalAreaStatement,
} from '../../data/hospitalAnnexureData'
import {
  Plus,
  Sparkles,
  Search,
  Zap,
  AlertTriangle,
  Download,
  Filter,
  CheckCircle2,
  Building2,
  Layers,
  FileCheck,
  Check,
  Lock,
  Upload,
} from 'lucide-react'

import api from '../../services/api'
import { ProjectDrawingWorkspace } from './projects/ProjectDrawingWorkspace'

interface DocumentsProps {
  defaultTab?: 'drawings' | 'brief' | 'area' | 'mom' | 'site' | 'rfi' | 'qaqc' | 'material'
}

interface DrawingFormInputs {
  drawingNumber: string
  drawingTitle: string
  revisionNumber: string
  revisionDate: string
  preparedBy: string
  approvedBy: string
  status: Drawing['status']
  projectCode: string
  discipline?: DisciplineCode
  level?: string
  drawingType?: string
  purpose?: string
}

export const Documents: React.FC<DocumentsProps> = ({ defaultTab = 'drawings' }) => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const urlProjectId = searchParams.get('project') || undefined
  const [activeTab, setActiveTab] = useState<'drawings' | 'brief' | 'area' | 'mom' | 'site' | 'rfi' | 'qaqc' | 'material'>(defaultTab)

  useEffect(() => {
    setActiveTab(defaultTab)
  }, [defaultTab])

  const [drawings, setDrawings] = useState<Drawing[]>(initialDrawings)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isSubmittingDrawing, setIsSubmittingDrawing] = useState(false)
  const [search, setSearch] = useState('')

  // ── Master Drawing List (MDL) Filters ──────────────────────────────────────
  const [selectedDiscipline, setSelectedDiscipline] = useState<'ALL' | DisciplineCode>('ALL')
  const [selectedLevel, setSelectedLevel] = useState<'ALL' | string>('ALL')

  // ── Auto-Generation Modal State ──────────────────────────────────────────
  const [isAutoGenModalOpen, setIsAutoGenModalOpen] = useState(false)
  const [genProjectCode, setGenProjectCode] = useState('GVR-2026-001')
  const [genFloors, setGenFloors] = useState<string[]>(['B1', 'GF', '01', '02', '03', '04', 'TR'])
  const [genDisciplines, setGenDisciplines] = useState<DisciplineCode[]>([
    'AR', 'IN', 'ST', 'EL', 'PL', 'FF', 'HV', 'MG', 'LV', 'VT', 'SP'
  ])

  // ── Annexure A Hospital Room Selector State ──────────────────────────────
  const [selectedAnnexureModules, setSelectedAnnexureModules] = useState<string[]>(
    HOSPITAL_ANNEXURE_CATALOG.filter((m) => m.defaultSelected).map((m) => m.id)
  )
  const [isAnnexureModalOpen, setIsAnnexureModalOpen] = useState(false)
  const [df1FreezeStatus, setDf1FreezeStatus] = useState<'Draft' | 'Approved (Gate G2 Frozen)'>('Draft')

  // Dynamically derive created discipline folders for the project
  const availableDisciplines: DisciplineCode[] = useMemo(() => {
    try {
      const activePCode = urlProjectId || genProjectCode
      const keys = Array.from(new Set([
        activePCode ? `ssa_disciplines_${activePCode}` : null,
      ])).filter(Boolean) as string[]

      let createdCodes: DisciplineCode[] = []

      for (const key of keys) {
        const raw = localStorage.getItem(key)
        if (raw) {
          const parsed = JSON.parse(raw)
          if (Array.isArray(parsed) && parsed.length > 0) {
            const codes = parsed.map((d: any) => d.code as DisciplineCode).filter(Boolean)
            createdCodes = Array.from(new Set([...createdCodes, ...codes]))
          }
        }
      }

      if (createdCodes.length > 0) {
        return createdCodes
      }
    } catch (e) {
      console.error(e)
    }

    // Default to 'AR' if no folders created yet
    return ['AR']
  }, [genProjectCode, urlProjectId, isAddOpen])

  // Form hooks with auto-calculation
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<DrawingFormInputs>({
    defaultValues: {
      projectCode: genProjectCode || 'GVR-2026-001',
      revisionNumber: 'R00',
      discipline: availableDisciplines[0] || 'AR',
      level: 'GF',
      drawingType: 'PLN',
      preparedBy: 'Siddharth Sen',
      approvedBy: 'Ananya Deshmukh',
      status: 'Draft',
    }
  })

  useEffect(() => {
    if (urlProjectId) {
      const cleanPrj = deriveProjectCodeFromName(urlProjectId, 'GVR')
      setGenProjectCode(cleanPrj)
      setValue('projectCode', cleanPrj)
    }
  }, [urlProjectId, setValue])

  useEffect(() => {
    if (isAddOpen) {
      const raw = urlProjectId || genProjectCode || 'GVR'
      const activeCode = deriveProjectCodeFromName(raw, 'GVR')
      setValue('projectCode', activeCode)
    }
  }, [isAddOpen, urlProjectId, genProjectCode, setValue])

  const watchDiscipline = watch('discipline')
  const watchLevel = watch('level')
  const watchDrawingType = watch('drawingType')
  const watchProjectCode = watch('projectCode')

  // Auto-generate Drawing Number & Title whenever Discipline, Level, Type, or Project Code changes
  useEffect(() => {
    const rawPrj = (watchProjectCode || urlProjectId || genProjectCode || 'GVR').trim()
    const prj = deriveProjectCodeFromName(rawPrj, 'GVR')
    const disc = (watchDiscipline || 'AR').trim().toUpperCase()
    const lvl = (watchLevel || 'GF').trim().toUpperCase()
    const type = (watchDrawingType || 'PLN').trim().toUpperCase()

    // Calculate sequence number based on existing drawings
    const matchingCount = drawings.filter(d =>
      d.discipline === disc && (d.level?.toUpperCase() === lvl || d.level === 'All')
    ).length

    const seqNum = String(matchingCount + 1).padStart(3, '0')
    const autoNumber = `${prj}-${disc}-${lvl}-${type}-${seqNum}`

    setValue('drawingNumber', autoNumber)

    // Auto-suggest deliverable title
    const discObj = DISCIPLINE_CATALOG[disc as DisciplineCode]
    const discTitle = discObj ? discObj.name : disc
    const levelTitle = lvl === 'GF' ? 'Ground Floor' : lvl === 'B1' ? 'Basement' : lvl === 'TR' ? 'Terrace' : lvl === 'ALL' || lvl === 'ALL' ? 'Overall Campus' : `Floor ${lvl}`

    const typeTitles: Record<string, string> = {
      PLN: 'Base Layout Plan',
      PWR: 'Electrical Power Layout',
      LTG: 'Lighting & Switching Plan',
      SLD: 'Single Line Diagram (SLD)',
      WTR: 'Water Supply Piping Plan',
      DRN: 'Drainage & Sewage Routing Plan',
      DUCT: 'HVAC Air Ducting Layout',
      SEC: 'Building Cross Section',
      ELE: 'Exterior Facade Elevation',
      DET: 'Connection Detail Sheet',
      SCH: 'Equipment & Panel Schedule',
      RCP: 'Reflected Ceiling Plan (RCP)'
    }
    const typeText = typeTitles[type] || 'Deliverable Plan'
    setValue('drawingTitle', `${levelTitle} ${discTitle} ${typeText}`)
  }, [watchDiscipline, watchLevel, watchDrawingType, watchProjectCode, genProjectCode, drawings.length, setValue])

  // Handle submit single drawing
  const onSubmit = async (data: DrawingFormInputs) => {
    setIsSubmittingDrawing(true)
    try {
      const pCode = data.projectCode || genProjectCode || 'GVR-2026-001'
      const newD: Drawing = {
        id: `DWG-${Math.floor(1000 + Math.random() * 9000)}`,
        ...data,
        drawingNumber: data.drawingNumber || `${pCode}-${data.discipline || 'AR'}-${data.level || 'GF'}-001`,
        drawingTitle: data.drawingTitle || 'Drawing Deliverable',
        discipline: data.discipline || 'AR',
        level: data.level || 'GF',
        revisionNumber: data.revisionNumber || 'R00',
        revisionDate: new Date().toISOString().split('T')[0],
        preparedBy: data.preparedBy || 'Engineer',
        approvedBy: data.approvedBy || 'Principal Architect',
        purpose: data.purpose || 'Standard drawing deliverable record.',
        status: 'Draft',
        projectCode: pCode
      }

      // Upload drawing file to Cloudinary folder if attached
      if (selectedFile) {
        // Instant viewable Blob URL fallback
        const localBlobUrl = URL.createObjectURL(selectedFile)
          ; (newD as any).fileUrl = localBlobUrl
          ; (newD as any).originalFileName = selectedFile.name

        try {
          const folderPath = `project_drawings/${pCode}/${data.discipline || 'AR'}`
          const formData = new FormData()
          formData.append('file', selectedFile)
          formData.append('folder', folderPath)
          const uploadRes = await api.post('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
          if (uploadRes.data?.url || uploadRes.data?.secure_url) {
            (newD as any).fileUrl = uploadRes.data.url || uploadRes.data.secure_url
          }
        } catch (uploadErr) {
          console.warn('Cloudinary upload warning/fallback:', uploadErr)
        }
      }

      // Try API submit
      try {
        await api.post(`/projects/${pCode}/drawings`, newD)
      } catch (err) {
        console.warn('API drawing creation fallback to local state:', err)
      }

      // Update local state
      const updatedDrawings = [newD, ...drawings]
      setDrawings(updatedDrawings)

      // Sync to localStorage under all relevant project keys and dispatch workspace update event
      try {
        const targetKeys = Array.from(new Set([
          `ssa_drawings_${pCode}`,
          urlProjectId ? `ssa_drawings_${urlProjectId}` : null
        ])).filter(Boolean) as string[];

        for (const key of targetKeys) {
          const existingStored = JSON.parse(localStorage.getItem(key) || '[]')
          localStorage.setItem(key, JSON.stringify([newD, ...existingStored]))
        }
        window.dispatchEvent(new Event('ssa_drawing_registered'))
      } catch (e) {
        console.error(e)
      }

      alert(`Drawing Deliverable ${newD.drawingNumber} successfully registered!`)
      setIsAddOpen(false)
      setSelectedFile(null)
      reset()
    } catch (err: any) {
      console.error('Error submitting drawing:', err)
      alert(err.message || 'Failed to register document.')
    } finally {
      setIsSubmittingDrawing(false)
    }
  }

  // Handle Auto-Generate Master Drawing List
  const handleAutoGenerateMDL = () => {
    if (!genProjectCode.trim()) {
      alert('Please enter a valid Project Code.')
      return
    }
    if (genFloors.length === 0) {
      alert('Please select at least 1 floor level.')
      return
    }
    if (genDisciplines.length === 0) {
      alert('Please select at least 1 discipline.')
      return
    }

    const generated = generateMasterDrawingList(genProjectCode, genFloors, genDisciplines)
    setDrawings((prev) => {
      const existingOthers = prev.filter((d) => d.projectCode !== genProjectCode)
      return [...generated, ...existingOthers]
    })
    setIsAutoGenModalOpen(false)
  }

  // Quick Status Update for Drawings
  const updateDrawingStatus = (id: string, newStatus: Drawing['status']) => {
    setDrawings((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: newStatus, cascadingReviewFlag: false } : d))
    )
  }

  // Delete drawing
  const deleteDrawing = (id: string) => {
    if (confirm('Delete this drawing record?')) {
      setDrawings(drawings.filter(d => d.id !== id))
    }
  }

  // Export Transmittal Schedule to CSV
  const exportTransmittalCSV = () => {
    const headers = ['Drawing Number', 'Title', 'Discipline', 'Level', 'Revision', 'Revision Date', 'Status', 'Prepared By', 'Approved By', 'Purpose']
    const rows = filteredDrawings.map((d) => [
      `"${d.drawingNumber}"`,
      `"${d.drawingTitle}"`,
      `"${d.discipline || ''}"`,
      `"${d.level || ''}"`,
      `"${d.revisionNumber}"`,
      `"${d.revisionDate}"`,
      `"${d.status}"`,
      `"${d.preparedBy}"`,
      `"${d.approvedBy}"`,
      `"${(d.purpose || '').replace(/"/g, '""')}"`,
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `Master_Drawing_List_${genProjectCode}_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Filtered Drawings based on Search, Discipline, and Level
  const filteredDrawings = drawings.filter(d => {
    const matchesSearch =
      d.drawingTitle.toLowerCase().includes(search.toLowerCase()) ||
      d.drawingNumber.toLowerCase().includes(search.toLowerCase()) ||
      d.projectCode.toLowerCase().includes(search.toLowerCase()) ||
      (d.purpose && d.purpose.toLowerCase().includes(search.toLowerCase()))

    const matchesDiscipline = selectedDiscipline === 'ALL' || d.discipline === selectedDiscipline
    const matchesLevel = selectedLevel === 'ALL' || d.level === selectedLevel

    return matchesSearch && matchesDiscipline && matchesLevel
  })

  // Cascading Revision Alert check (if AR has approved/revised sheets)
  const hasCascadingFlags = drawings.some((d) => d.cascadingReviewFlag)

  const getStatusColor = (status: Drawing['status']) => {
    switch (status) {
      case 'Approved': return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
      case 'For Review': return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
      case 'Revision Required': return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
      case 'Draft': return 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
    }
  }

  // Count drawings by discipline
  const getDisciplineCount = (code: DisciplineCode) => {
    return drawings.filter((d) => d.discipline === code).length
  }

  // Calculate Area Summary from Annexure A
  const areaSummary = calculateHospitalAreaStatement(selectedAnnexureModules)

  // Mock Document Records
  const clientBriefs = [
    { id: 'CB-01', title: 'Kongunad Hospital Master Brief (DF-1)', project: 'KNG', author: 'Sundar Sundram', date: '2026-01-15', status: df1FreezeStatus },
    { id: 'CB-02', title: 'Fortis Oncology Wing Brief', project: 'SSA-BLR-FH02', author: 'Rajeev Mehta', date: '2026-03-10', status: 'Approved (Gate G2 Frozen)' },
    { id: 'CB-03', title: 'Zoya Office Complex Client Brief', project: 'SSA-MUM-ZS03', author: 'Vikram Malhotra', date: '2026-06-01', status: 'Draft' },
  ]

  const areaStatements = [
    { id: 'AS-101', title: 'FSI calculation & Plot Coverage Analysis', project: 'KNG', permissibleFsi: areaSummary.permissibleFsi, proposedFsi: areaSummary.proposedFsi, date: '2026-02-05', status: areaSummary.fsiStatus },
    { id: 'AS-102', title: 'Oncology Wing Proposed Carpet Area Log', project: 'SSA-BLR-FH02', permissibleFsi: 1.75, proposedFsi: 1.72, date: '2026-03-20', status: 'Compliant' },
    { id: 'AS-103', title: 'Zoya Office Carpet & Core Ratio calculation', project: 'SSA-MUM-ZS03', permissibleFsi: 2.50, proposedFsi: 2.48, date: '2026-06-11', status: 'Compliant' },
  ]

  const momRecords = [
    { id: 'MOM-901', title: 'Weekly Coordination MOM #12', project: 'KNG', host: 'Ananya Deshmukh', date: '2026-06-12', attendees: 'Client reps, MEP consultants' },
    { id: 'MOM-902', title: 'Kickoff meeting notes - Oncology Expansion', project: 'SSA-BLR-FH02', host: 'Rajeev Mehta', date: '2026-06-14', attendees: 'Fortis project board, structural leads' },
    { id: 'MOM-903', title: 'Twinmotion Model Review MOM', project: 'SSA-MUM-ZS03', host: 'Siddharth Sen', date: '2026-06-18', attendees: 'Zoya design panel' },
  ]

  const siteReports = [
    { id: 'SR-301', title: 'Foundation Tie-Beam Pour Site Inspection', project: 'KNG', inspector: 'Kunal Kapoor', date: '2026-06-12', compliance: '100% Compliant' },
    { id: 'SR-302', title: 'MEP Lift Core Slab Reinforcement Check', project: 'SSA-BLR-FH02', inspector: 'Kunal Kapoor', date: '2026-06-17', compliance: 'Minor Deviation (Fixed)' },
  ]

  const rfiRecords = [
    { id: 'RFI-501', title: 'HVAC Duct routing conflict at elevator core', project: 'SSA-BLR-FH02', raisedBy: 'Apex BIM Solutions', assignee: 'Rahul Sharma', status: 'Resolved' },
    { id: 'RFI-502', title: 'Plinth level municipal contour alignment query', project: 'KNG', raisedBy: 'Buildcon Contractors', assignee: 'Kunal Kapoor', status: 'Pending Review' },
  ]

  const qaqcChecklists = [
    { id: 'QA-701', title: 'GFC CAD Layering & Line-weight validation', drawing: 'KNG-AR-GF-PLN-101', auditor: 'Ananya Deshmukh', date: '2026-06-10', result: 'Pass' },
    { id: 'QA-702', title: 'HVAC Duct Routing Structural clearance check', drawing: 'KNG-HV-GF-PLN-702', auditor: 'Priya Ranganathan', date: '2026-06-17', result: 'Reviewing' },
  ]

  const materialApprovals = [
    { id: 'MAS-801', title: 'Cladding Granite Slab - Italian Pearl', project: 'KNG', specifier: 'Ananya Deshmukh', vendor: 'Granite Craft Ltd', status: 'Approved' },
    { id: 'MAS-802', title: 'Oncology Wing Resilient Vinyl Flooring sample', project: 'SSA-BLR-FH02', specifier: 'Rajeev Mehta', vendor: 'MedSafe Flooring', status: 'Approved' },
    { id: 'MAS-803', title: 'Double Glazed Curtain Wall Profile Glass', project: 'SSA-MUM-ZS03', specifier: 'Siddharth Sen', vendor: 'Windor Facades', status: 'Pending Review' },
  ]

  return (
    <div className="space-y-6 animate-fade-in text-brand-charcoal">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-charcoal tracking-tight sm:text-3xl font-sans flex items-center gap-2.5">
            <Building2 className="w-7 h-7 text-brand-primary" /> Master Drawing Register & Document Control
          </h1>
          <p className="text-xs sm:text-sm text-brand-gray mt-1 font-medium font-sans">
            Manage end-to-end Master Drawing Lists across all 11 engineering disciplines with floor-level conventions and plain-words site purposes.
          </p>
        </div>

        {activeTab === 'drawings' && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={exportTransmittalCSV}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all duration-200 cursor-pointer"
              title="Export Transmittal CSV"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <button
              onClick={() => setIsAddOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/95 text-xs font-bold text-white shadow-md shadow-brand-primary/10 transition-all duration-200 cursor-pointer animate-fade-in"
            >
              <Plus className="w-4 h-4" /> Add Drawing
            </button>
          </div>
        )}

        {activeTab === 'brief' && (
          <button
            onClick={() => setIsAnnexureModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-xs font-extrabold text-white shadow-md shadow-purple-600/20 transition-all duration-200 cursor-pointer animate-fade-in"
          >
            <Sparkles className="w-4 h-4" /> Hospital Department & Room Selector (Annexure A)
          </button>
        )}
      </div>

      {/* Document Management Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar scroll-smooth">
        {[
          { id: 'drawings', label: 'Master Drawing List (MDL)' },
          { id: 'brief', label: 'Client Brief (DF-1)' },
          { id: 'area', label: 'Area Statement' },
          { id: 'mom', label: 'MOM Log' },
          { id: 'site', label: 'Site Reports' },
          { id: 'rfi', label: 'RFI Tracker' },
          { id: 'qaqc', label: 'QA/QC Checklist' },
          { id: 'material', label: 'Material Approvals' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any)
              navigate(`/documents/${tab.id === 'drawings' ? 'drawings' : tab.id === 'brief' ? 'brief' : tab.id}`)
            }}
            className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap cursor-pointer ${activeTab === tab.id
                ? 'border-brand-primary text-brand-primary font-extrabold'
                : 'border-transparent text-brand-gray hover:text-brand-charcoal'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. MASTER DRAWING REGISTER TAB */}
      {activeTab === 'drawings' && (
        <ProjectDrawingWorkspace projectId={urlProjectId} />
      )}

      {/* 2. CLIENT BRIEF (DF-1 Milestone) */}
      {activeTab === 'brief' && (
        <div className="space-y-6">
          {/* Live Area & Room Count Summary Cards from Annexure A */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hospital Modules Selected</span>
              <p className="text-2xl font-black text-purple-600 mt-1">{areaSummary.totalModulesSelected} Modules</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Annexure A Department Scope</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rooms Captured</span>
              <p className="text-2xl font-black text-brand-primary mt-1">{areaSummary.totalRoomsCaptured} Rooms</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Auto-populated room checklist</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Proposed Built-up Area</span>
              <p className="text-2xl font-black text-brand-charcoal dark:text-white mt-1">{areaSummary.totalEstBuiltUpAreaSqFt.toLocaleString()} sq.ft</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Carpet area + 35% circulation</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">FSI Compliance</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-black text-emerald-600">{areaSummary.proposedFsi} FSI</span>
                <span className="text-xs text-slate-400">/ max {areaSummary.permissibleFsi}</span>
              </div>
              <p className="text-[11px] text-emerald-600 font-bold mt-0.5">✓ {areaSummary.fsiStatus}</p>
            </div>
          </div>

          {/* DF-1 Client Brief Document Freeze Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-brand-charcoal text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-primary text-white">
                  Gate G2 Milestone
                </span>
                <span className="text-xs font-bold text-slate-300">DF-1 Functional Brief Freeze</span>
              </div>
              <h3 className="text-xl font-extrabold text-white">Kongunad Hospital Master Requirement Brief</h3>
              <p className="text-xs text-slate-300 max-w-2xl">
                Compiles the full Annexure A room checklist, specialty bed counts, OT specs, and area statement for client sign-off before detailed design start.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {df1FreezeStatus === 'Draft' ? (
                <button
                  onClick={() => {
                    setDf1FreezeStatus('Approved (Gate G2 Frozen)')
                    alert('Client Brief (DF-1) is now Frozen (Gate G2 Approved)!')
                  }}
                  className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/30 transition-all cursor-pointer flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" /> Approve & Freeze Client Brief (Gate G2)
                </button>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-extrabold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Gate G2 Brief Frozen & Approved
                </div>
              )}
            </div>
          </div>

          {/* Client Brief List Table */}
          <div className="glass-card rounded-2xl border border-slate-200/80 overflow-hidden bg-white shadow-sm">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-sm font-bold text-brand-charcoal uppercase tracking-wider">Client Requirement Briefs (DF-1 Log)</h3>
              <button
                onClick={() => setIsAnnexureModalOpen(true)}
                className="text-xs font-bold text-brand-primary hover:underline cursor-pointer flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" /> Edit Hospital Room Scope
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-brand-charcoal">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200/60 font-bold">
                  <tr>
                    <th className="p-4">ID</th>
                    <th className="p-4">Brief Title</th>
                    <th className="p-4">Project Code</th>
                    <th className="p-4">Author</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Gate Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {clientBriefs.map((cb) => (
                    <tr key={cb.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="p-4 font-mono font-bold text-brand-primary">{cb.id}</td>
                      <td className="p-4 font-semibold text-brand-charcoal">{cb.title}</td>
                      <td className="p-4 font-mono text-slate-600">{cb.project}</td>
                      <td className="p-4 font-semibold text-slate-700">{cb.author}</td>
                      <td className="p-4 text-slate-500">{cb.date}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${cb.status.includes('Frozen') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                          {cb.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. AREA STATEMENT */}
      {activeTab === 'area' && (
        <div className="glass-card rounded-2xl border border-slate-200/80 overflow-hidden bg-white shadow-sm">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-sm font-bold text-brand-charcoal uppercase tracking-wider">Area Statement Spreadsheets</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-brand-charcoal">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200/60 font-bold">
                <tr>
                  <th className="p-4">Doc ID</th>
                  <th className="p-4">Title</th>
                  <th className="p-4">Project</th>
                  <th className="p-4">Permissible FSI</th>
                  <th className="p-4">Proposed FSI</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {areaStatements.map((as) => (
                  <tr key={as.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-brand-primary">{as.id}</td>
                    <td className="p-4 font-semibold text-brand-charcoal">{as.title}</td>
                    <td className="p-4 text-slate-600">{as.project}</td>
                    <td className="p-4 font-bold text-slate-700">{as.permissibleFsi}</td>
                    <td className="p-4 font-bold text-emerald-600">{as.proposedFsi}</td>
                    <td className="p-4 text-slate-500">{as.date}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {as.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. MOM LOG */}
      {activeTab === 'mom' && (
        <div className="glass-card rounded-2xl border border-slate-200/80 overflow-hidden bg-white shadow-sm">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-sm font-bold text-brand-charcoal uppercase tracking-wider">Minutes of Meeting (MOM)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-brand-charcoal">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200/60 font-bold">
                <tr>
                  <th className="p-4">MOM ID</th>
                  <th className="p-4">Meeting Title</th>
                  <th className="p-4">Project</th>
                  <th className="p-4">Host / Lead</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Key Attendees</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {momRecords.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-brand-primary">{m.id}</td>
                    <td className="p-4 font-semibold text-brand-charcoal">{m.title}</td>
                    <td className="p-4 text-slate-600">{m.project}</td>
                    <td className="p-4 font-semibold text-slate-700">{m.host}</td>
                    <td className="p-4 text-slate-500">{m.date}</td>
                    <td className="p-4 text-slate-600">{m.attendees}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. SITE REPORTS */}
      {activeTab === 'site' && (
        <div className="glass-card rounded-2xl border border-slate-200/80 overflow-hidden bg-white shadow-sm">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-sm font-bold text-brand-charcoal uppercase tracking-wider">Site Inspection Reports</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-brand-charcoal">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200/60 font-bold">
                <tr>
                  <th className="p-4">Report ID</th>
                  <th className="p-4">Inspection Title</th>
                  <th className="p-4">Project</th>
                  <th className="p-4">Field Inspector</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Design Compliance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {siteReports.map((sr) => (
                  <tr key={sr.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-brand-primary">{sr.id}</td>
                    <td className="p-4 font-semibold text-brand-charcoal">{sr.title}</td>
                    <td className="p-4 text-slate-600">{sr.project}</td>
                    <td className="p-4 font-semibold text-slate-700">{sr.inspector}</td>
                    <td className="p-4 text-slate-500">{sr.date}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {sr.compliance}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. RFI TRACKER */}
      {activeTab === 'rfi' && (
        <div className="glass-card rounded-2xl border border-slate-200/80 overflow-hidden bg-white shadow-sm">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-sm font-bold text-brand-charcoal uppercase tracking-wider">Request For Information (RFI) Log</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-brand-charcoal">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200/60 font-bold">
                <tr>
                  <th className="p-4">RFI ID</th>
                  <th className="p-4">Technical Subject</th>
                  <th className="p-4">Project</th>
                  <th className="p-4">Raised By</th>
                  <th className="p-4">Assigned Engineer</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rfiRecords.map((rfi) => (
                  <tr key={rfi.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-brand-primary">{rfi.id}</td>
                    <td className="p-4 font-semibold text-brand-charcoal">{rfi.title}</td>
                    <td className="p-4 text-slate-600">{rfi.project}</td>
                    <td className="p-4 text-slate-600">{rfi.raisedBy}</td>
                    <td className="p-4 font-semibold text-slate-700">{rfi.assignee}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${rfi.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                        {rfi.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. QA/QC CHECKLIST */}
      {activeTab === 'qaqc' && (
        <div className="glass-card rounded-2xl border border-slate-200/80 overflow-hidden bg-white shadow-sm">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-sm font-bold text-brand-charcoal uppercase tracking-wider">Drawing QA/QC Audits Checklist</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-brand-charcoal">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200/60 font-bold">
                <tr>
                  <th className="p-4">Audit ID</th>
                  <th className="p-4">Audit Description</th>
                  <th className="p-4">Drawing Reference</th>
                  <th className="p-4">Auditor</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {qaqcChecklists.map((chk) => (
                  <tr key={chk.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-brand-primary">{chk.id}</td>
                    <td className="p-4 font-semibold text-brand-charcoal">{chk.title}</td>
                    <td className="p-4 text-brand-primary font-mono">{chk.drawing}</td>
                    <td className="p-4 font-semibold text-slate-700">{chk.auditor}</td>
                    <td className="p-4 text-slate-500">{chk.date}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${chk.result === 'Pass' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                        {chk.result}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 8. MATERIAL APPROVALS */}
      {activeTab === 'material' && (
        <div className="glass-card rounded-2xl border border-slate-200/80 overflow-hidden bg-white shadow-sm">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-sm font-bold text-brand-charcoal uppercase tracking-wider">Material Approval Sheets (MAS)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-brand-charcoal">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200/60 font-bold">
                <tr>
                  <th className="p-4">MAS ID</th>
                  <th className="p-4">Material Submittal</th>
                  <th className="p-4">Project</th>
                  <th className="p-4">Specifier Architect</th>
                  <th className="p-4">Manufacturer/Vendor</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {materialApprovals.map((mas) => (
                  <tr key={mas.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-brand-primary">{mas.id}</td>
                    <td className="p-4 font-semibold text-brand-charcoal">{mas.title}</td>
                    <td className="p-4 text-slate-600">{mas.project}</td>
                    <td className="p-4 font-semibold text-slate-700">{mas.specifier}</td>
                    <td className="p-4 text-slate-600">{mas.vendor}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${mas.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-primary-50 text-brand-primary border border-primary-100'
                        }`}>
                        {mas.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── ANNEXURE A HOSPITAL ROOM SELECTOR MODAL ────────────────────────────────────── */}
      {isAnnexureModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 text-brand-charcoal dark:text-white max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
              <div>
                <h2 className="text-lg font-black text-brand-charcoal dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" /> Hospital Requirement Capture: Department & Room Selector (Annexure A)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select active hospital modules to auto-calculate room counts, carpet area, and generate the DF-1 Client Brief.
                </p>
              </div>
              <button
                onClick={() => setIsAnnexureModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {HOSPITAL_ANNEXURE_CATALOG.map((mod) => {
                const isSelected = selectedAnnexureModules.includes(mod.id)
                return (
                  <div
                    key={mod.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedAnnexureModules(selectedAnnexureModules.filter((id) => id !== mod.id))
                      } else {
                        setSelectedAnnexureModules([...selectedAnnexureModules, mod.id])
                      }
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${isSelected
                        ? 'bg-purple-500/10 border-purple-500/40 text-brand-charcoal dark:text-white shadow-sm'
                        : 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-65 hover:opacity-100'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-purple-500/20 text-purple-700 dark:text-purple-300">
                          {mod.section}
                        </span>
                        <h4 className="text-xs font-black">{mod.name}</h4>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-purple-600 bg-purple-600 text-white' : 'border-slate-300'}`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-2">
                      Estimated Area: <span className="font-bold">{mod.estAreaSqFt.toLocaleString()} sq.ft</span>
                    </p>

                    <div className="flex flex-wrap gap-1">
                      {mod.rooms.map((rm, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-200/60 dark:bg-slate-800 text-[9px] text-slate-700 dark:text-slate-300 font-medium">
                          {rm}
                        </span>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsAnnexureModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-xs font-extrabold text-white shadow-lg shadow-purple-600/20 transition-all cursor-pointer flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Apply Room Scope to DF-1 Brief
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── AUTO-GENERATE MASTER DRAWING LIST MODAL ────────────────────────────────────── */}
      {isAutoGenModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 text-brand-charcoal dark:text-white max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
              <div>
                <h2 className="text-lg font-black text-brand-charcoal dark:text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-emerald-500 fill-current" /> Auto-Generate Master Drawing List (MDL)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select building floor levels and active engineering disciplines to auto-create standard project sheets.
                </p>
              </div>
              <button
                onClick={() => setIsAutoGenModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Project Code Input */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">ERP Project Code / Token Prefix</label>
                <input
                  type="text"
                  value={genProjectCode}
                  onChange={(e) => setGenProjectCode(e.target.value.toUpperCase())}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 outline-none rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white font-mono font-bold"
                  placeholder="e.g. KNG or SSA-CH-GR01"
                />
              </div>

              {/* Floors Multi-select Grid */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Select Building Floor Levels ("Per floor" Sheets)
                  </label>
                  <button
                    type="button"
                    onClick={() => setGenFloors(STANDARD_FLOORS.map(f => f.code))}
                    className="text-[10px] font-bold text-emerald-600 hover:underline cursor-pointer"
                  >
                    Select All Floors
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {STANDARD_FLOORS.map((fl) => {
                    const isSelected = genFloors.includes(fl.code)
                    return (
                      <button
                        type="button"
                        key={fl.code}
                        onClick={() => {
                          if (isSelected) {
                            setGenFloors(genFloors.filter(f => f !== fl.code))
                          } else {
                            setGenFloors([...genFloors, fl.code])
                          }
                        }}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left flex items-center justify-between cursor-pointer ${isSelected
                            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-extrabold'
                            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                          }`}
                      >
                        <span>{fl.label}</span>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300'}`}>
                          {isSelected && <CheckCircle2 className="w-3 h-3 fill-current" />}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Disciplines Multi-select List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Select Active Engineering Packages (11 Disciplines)
                  </label>
                  <div className="flex gap-2 text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setGenDisciplines((Object.keys(DISCIPLINE_CATALOG) as DisciplineCode[]))}
                      className="text-emerald-600 hover:underline cursor-pointer"
                    >
                      Select All
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                  {(Object.keys(DISCIPLINE_CATALOG) as DisciplineCode[]).map((code) => {
                    const meta = DISCIPLINE_CATALOG[code]
                    const isSelected = genDisciplines.includes(code)
                    return (
                      <button
                        type="button"
                        key={code}
                        onClick={() => {
                          if (isSelected) {
                            setGenDisciplines(genDisciplines.filter(c => c !== code))
                          } else {
                            setGenDisciplines([...genDisciplines, code])
                          }
                        }}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-start justify-between gap-2 ${isSelected
                            ? 'bg-slate-50 dark:bg-slate-800/80 border-brand-primary/50 shadow-sm'
                            : 'bg-slate-50/40 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-60'
                          }`}
                      >
                        <div className="space-y-0.5">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.2 rounded-md text-[10px] font-extrabold border ${meta.colorBadge}`}>
                            {meta.code} - {meta.name}
                          </span>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">{meta.description}</p>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center mt-1 ${isSelected ? 'border-brand-primary bg-brand-primary text-white' : 'border-slate-300'}`}>
                          {isSelected && <CheckCircle2 className="w-3 h-3 fill-current" />}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-5 mt-6 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsAutoGenModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAutoGenerateMDL}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-extrabold text-white shadow-lg shadow-emerald-600/20 transition-all cursor-pointer flex items-center gap-2"
              >
                <Zap className="w-4 h-4 fill-current" /> Generate Master Drawing Register
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD SINGLE DRAWING REVISION MODAL ────────────────────────────────────── */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-brand-charcoal dark:text-white">

            {/* Fixed Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80">
              <h2 className="text-base font-extrabold text-brand-charcoal dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-primary" /> Register Drawing Revision
              </h2>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-4 text-xs overflow-y-auto flex-1 max-h-[calc(90vh-130px)]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Discipline Package */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Discipline Package <span className="text-brand-primary">*</span>
                    </label>
                    <select
                      {...register('discipline')}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-white cursor-pointer font-bold"
                    >
                      {availableDisciplines.map((code) => (
                        <option key={code} value={code}>
                          {code} — {DISCIPLINE_CATALOG[code as DisciplineCode]?.name || code}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Floor Level */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Floor Level <span className="text-brand-primary">*</span>
                    </label>
                    <select
                      {...register('level')}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-white cursor-pointer font-bold"
                    >
                      <option value="GF">Ground Floor (GF)</option>
                      <option value="B1">Basement (B1)</option>
                      <option value="01">First Floor (01)</option>
                      <option value="02">Second Floor (02)</option>
                      <option value="03">Third Floor (03)</option>
                      <option value="04">Fourth Floor (04)</option>
                      <option value="TR">Terrace (TR)</option>
                      <option value="ALL">Whole Building (ALL)</option>
                      <option value="SITE">Site / Plot (SITE)</option>
                    </select>
                  </div>

                  {/* Drawing Deliverable Type */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Drawing Type / Sheet Category <span className="text-brand-primary">*</span>
                    </label>
                    <select
                      {...register('drawingType')}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-white cursor-pointer font-bold"
                    >
                      <option value="PLN">PLN — Base Layout Plan</option>
                      <option value="PWR">PWR — Electrical Power Layout</option>
                      <option value="LTG">LTG — Lighting & Switching</option>
                      <option value="SLD">SLD — Single Line Diagram</option>
                      <option value="WTR">WTR — Water Supply Piping</option>
                      <option value="DRN">DRN — Drainage & Sewerage</option>
                      <option value="DUCT">DUCT — HVAC Ducting Plan</option>
                      <option value="SEC">SEC — Building Cross Section</option>
                      <option value="ELE">ELE — Facade Elevation</option>
                      <option value="DET">DET — Detail & Connection Sheet</option>
                      <option value="SCH">SCH — Equipment & Panel Schedule</option>
                      <option value="RCP">RCP — Reflected Ceiling Plan</option>
                    </select>
                  </div>

                  {/* Project Code (Auto-populated) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Project Code (Auto)
                    </label>
                    <input
                      type="text"
                      {...register('projectCode', { required: true })}
                      className="w-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 outline-none rounded-xl px-3.5 py-2.5 text-xs text-brand-primary dark:text-brand-primary font-mono font-extrabold"
                    />
                  </div>

                  {/* Revision Index (Auto-populated) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Revision Index (Auto)
                    </label>
                    <input
                      type="text"
                      {...register('revisionNumber', { required: true })}
                      readOnly
                      className="w-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 outline-none rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-white font-mono font-bold"
                    />
                  </div>

                  {/* Drawing Number (Auto-Populated) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Drawing Number</label>
                    <input
                      type="text"
                      {...register('drawingNumber', { required: 'Drawing number is required' })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-white font-mono font-extrabold"
                      placeholder="e.g. KNG-EL-GF-PLN-403"
                    />
                    {errors.drawingNumber && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.drawingNumber.message}</p>}
                  </div>

                  {/* Drawing Deliverable Title */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Drawing Deliverable Title (Auto-Suggested)
                    </label>
                    <input
                      type="text"
                      {...register('drawingTitle', { required: 'Drawing title is required' })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-white font-bold"
                      placeholder="e.g. Ground Floor Electrical Power Layout"
                    />
                    {errors.drawingTitle && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.drawingTitle.message}</p>}
                  </div>

                  {/* Prepared By */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Prepared By</label>
                    <input
                      type="text"
                      {...register('preparedBy', { required: true })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-white font-medium"
                      placeholder="Siddharth Sen"
                    />
                  </div>

                  {/* Approved By */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Approved By</label>
                    <input
                      type="text"
                      {...register('approvedBy', { required: true })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-white font-medium"
                      placeholder="Ananya Deshmukh"
                    />
                  </div>
                </div>

                {/* File Upload Field */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Upload Drawing File (PDF / DWG / DXF / Image)
                  </label>
                  <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-center hover:border-brand-primary transition-colors bg-slate-50/50 dark:bg-slate-800/40 cursor-pointer relative">
                    <input
                      type="file"
                      accept=".pdf,.dwg,.dxf,.png,.jpg,.jpeg,.zip"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setSelectedFile(file)
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <div className="flex flex-col items-center justify-center gap-1.5 pointer-events-none">
                      <Upload className="w-6 h-6 text-brand-primary" />
                      {selectedFile ? (
                        <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                          <FileCheck className="w-4 h-4" />
                          <span>{selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                        </div>
                      ) : (
                        <>
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                            Click or drag & drop drawing sheet file to attach
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            Supports PDF, DWG, DXF, PNG, JPG, ZIP (Max 50MB)
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Purpose */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Purpose (Plain Words for Site)</label>
                  <textarea
                    {...register('purpose')}
                    rows={2}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-white"
                    placeholder="Explain in plain words why this drawing exists and who uses it on site..."
                  />
                </div>
              </div>

              {/* Fixed Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingDrawing}
                  className="px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/95 text-xs font-extrabold text-white shadow-md shadow-brand-primary/10 transition-colors cursor-pointer flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  {isSubmittingDrawing ? 'Registering Document...' : 'Register Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
