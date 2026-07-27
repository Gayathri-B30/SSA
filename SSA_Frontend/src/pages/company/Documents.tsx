import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { initialDrawings, type Drawing } from '../../data/mockData'
import { Plus, Sparkles, Search } from 'lucide-react'

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
}

export const Documents: React.FC<DocumentsProps> = ({ defaultTab = 'drawings' }) => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'drawings' | 'brief' | 'area' | 'mom' | 'site' | 'rfi' | 'qaqc' | 'material'>(defaultTab)

  useEffect(() => {
    setActiveTab(defaultTab)
  }, [defaultTab])

  const [drawings, setDrawings] = useState<Drawing[]>(initialDrawings)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [search, setSearch] = useState('')

  // Form hooks
  const { register, handleSubmit, reset, formState: { errors } } = useForm<DrawingFormInputs>()

  // Handle submit drawing
  const onSubmit = (data: DrawingFormInputs) => {
    const newD: Drawing = {
      id: `DWG-${Math.floor(900 + Math.random() * 100)}`,
      ...data
    }
    setDrawings([newD, ...drawings])
    setIsAddOpen(false)
    reset()
  }

  // Delete drawing
  const deleteDrawing = (id: string) => {
    if (confirm('Delete this drawing record?')) {
      setDrawings(drawings.filter(d => d.id !== id))
    }
  }

  // Search filtered drawings
  const filteredDrawings = drawings.filter(d =>
    d.drawingTitle.toLowerCase().includes(search.toLowerCase()) ||
    d.drawingNumber.toLowerCase().includes(search.toLowerCase()) ||
    d.projectCode.toLowerCase().includes(search.toLowerCase())
  )

  const getStatusColor = (status: Drawing['status']) => {
    switch (status) {
      case 'Approved': return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'For Review': return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'Revision Required': return 'bg-primary-50 text-brand-primary border-primary-100'
      case 'Draft': return 'bg-slate-50 text-slate-600 border-slate-200'
    }
  }

  // Mock Document Records
  const clientBriefs = [
    { id: 'CB-01', title: 'GR Heights IT Tech Park Brief', project: 'GR Heights IT Tech Park', author: 'Sundar Sundram', date: '2026-01-15', status: 'Approved' },
    { id: 'CB-02', title: 'Fortis Oncology Wing Brief', project: 'Fortis Oncology Wing expansion', author: 'Rajeev Mehta', date: '2026-03-10', status: 'Approved' },
    { id: 'CB-03', title: 'Zoya Office Complex Client Brief', project: 'Zoya Office Complex', author: 'Vikram Malhotra', date: '2026-06-01', status: 'In Review' },
  ]

  const areaStatements = [
    { id: 'AS-101', title: 'FSI calculation & Plot Coverage Analysis', project: 'GR Heights IT Tech Park', permissibleFsi: '3.25', proposedFsi: '3.18', date: '2026-02-05', status: 'Verified' },
    { id: 'AS-102', title: 'Oncology Wing Proposed Carpet Area Log', project: 'Fortis Oncology Wing expansion', permissibleFsi: '1.75', proposedFsi: '1.72', date: '2026-03-20', status: 'Verified' },
    { id: 'AS-103', title: 'Zoya Office Carpet & Core Ratio calculation', project: 'Zoya Office Complex', permissibleFsi: '2.50', proposedFsi: '2.48', date: '2026-06-11', status: 'Draft' },
  ]

  const momRecords = [
    { id: 'MOM-901', title: 'Weekly Coordination MOM #12', project: 'GR Heights IT Tech Park', host: 'Ananya Deshmukh', date: '2026-06-12', attendees: 'Client reps, MEP consultants' },
    { id: 'MOM-902', title: 'Kickoff meeting notes - Oncology Expansion', project: 'Fortis Oncology Wing expansion', host: 'Rajeev Mehta', date: '2026-06-14', attendees: 'Fortis project board, structural leads' },
    { id: 'MOM-903', title: 'Twinmotion Model Review MOM', project: 'Zoya Office Complex', host: 'Siddharth Sen', date: '2026-06-18', attendees: 'Zoya design panel' },
  ]

  const siteReports = [
    { id: 'SR-301', title: 'Foundation Tie-Beam Pour Site Inspection', project: 'GR Heights IT Tech Park', inspector: 'Kunal Kapoor', date: '2026-06-12', compliance: '100% Compliant' },
    { id: 'SR-302', title: 'MEP Lift Core Slab Reinforcement Check', project: 'Fortis Oncology Wing expansion', inspector: 'Kunal Kapoor', date: '2026-06-17', compliance: 'Minor Deviation (Fixed)' },
  ]

  const rfiRecords = [
    { id: 'RFI-501', title: 'HVAC Duct routing conflict at elevator core', project: 'Fortis Oncology Wing expansion', raisedBy: 'Apex BIM Solutions', assignee: 'Rahul Sharma', status: 'Resolved' },
    { id: 'RFI-502', title: 'Plinth level municipal contour alignment query', project: 'GR Heights IT Tech Park', raisedBy: 'Buildcon Contractors', assignee: 'Kunal Kapoor', status: 'Pending Review' },
  ]

  const qaqcChecklists = [
    { id: 'QA-701', title: 'GFC CAD Layering & Line-weight validation', drawing: 'SSA-CH-GR01-ARC-PL-001', auditor: 'Ananya Deshmukh', date: '2026-06-10', result: 'Pass' },
    { id: 'QA-702', title: 'HVAC Duct Routing Structural clearance check', drawing: 'SSA-BLR-FH02-MEP-HVAC-010', auditor: 'Priya Ranganathan', date: '2026-06-17', result: 'Reviewing' },
  ]

  const materialApprovals = [
    { id: 'MAS-801', title: 'Cladding Granite Slab - Italian Pearl', project: 'GR Heights IT Tech Park', specifier: 'Ananya Deshmukh', vendor: 'Granite Craft Ltd', status: 'Approved' },
    { id: 'MAS-802', title: 'Oncology Wing Resilient Vinyl Flooring sample', project: 'Fortis Oncology Wing expansion', specifier: 'Rajeev Mehta', vendor: 'MedSafe Flooring', status: 'Approved' },
    { id: 'MAS-803', title: 'Double Glazed Curtain Wall Profile Glass', project: 'Zoya Office Complex', specifier: 'Siddharth Sen', vendor: 'Windor Facades', status: 'Pending Review' },
  ]

  return (
    <div className="space-y-6 animate-fade-in text-brand-charcoal">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-charcoal tracking-tight sm:text-3xl font-sans">Document Control</h1>
          <p className="text-xs sm:text-sm text-brand-gray mt-1 font-medium font-sans">Track drawings register, client briefs, transmittals, and approvals sheets.</p>
        </div>
        {activeTab === 'drawings' && (
          <button
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/95 text-xs font-bold text-white shadow-md shadow-brand-primary/10 transition-all duration-200 cursor-pointer animate-fade-in"
          >
            <Plus className="w-4 h-4" /> Add Drawing
          </button>
        )}
      </div>

      {/* Document Management Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar scroll-smooth">
        {[
          { id: 'drawings', label: 'Drawing Register' },
          { id: 'brief', label: 'Client Brief' },
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
            className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'border-brand-primary text-brand-primary'
                : 'border-transparent text-brand-gray hover:text-brand-charcoal'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. DRAWING REGISTER */}
      {activeTab === 'drawings' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 bg-white border border-slate-200/80 px-3.5 py-2 rounded-xl text-brand-gray text-xs w-full sm:w-80 shadow-sm">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search drawings by title or code..."
              className="bg-transparent border-none text-brand-charcoal outline-none w-full placeholder-slate-400"
            />
          </div>

          <div className="glass-card rounded-2xl border border-slate-200/80 overflow-hidden bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-brand-charcoal">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200/60 font-bold">
                  <tr>
                    <th className="p-4">Drawing Code</th>
                    <th className="p-4">Drawing Description</th>
                    <th className="p-4">Proj Code</th>
                    <th className="p-4 text-center">Rev</th>
                    <th className="p-4">Rev Date</th>
                    <th className="p-4">Prepared By</th>
                    <th className="p-4">Approver</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDrawings.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400 font-medium">
                        No drawings found matching the query.
                      </td>
                    </tr>
                  ) : (
                    filteredDrawings.map((dwg) => (
                      <tr key={dwg.id} className="hover:bg-slate-50/40 transition-colors">
                        <td className="p-4 font-mono font-bold text-brand-charcoal whitespace-nowrap">{dwg.drawingNumber}</td>
                        <td className="p-4 font-semibold text-brand-charcoal">{dwg.drawingTitle}</td>
                        <td className="p-4 text-brand-primary font-mono font-bold">{dwg.projectCode}</td>
                        <td className="p-4 text-center font-bold text-brand-charcoal">{dwg.revisionNumber}</td>
                        <td className="p-4 text-slate-500 whitespace-nowrap">{dwg.revisionDate}</td>
                        <td className="p-4 text-slate-600">{dwg.preparedBy}</td>
                        <td className="p-4 text-slate-600">{dwg.approvedBy}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border ${getStatusColor(dwg.status)}`}>
                            {dwg.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => deleteDrawing(dwg.id)}
                            className="text-[10px] text-red-600 hover:text-red-700 font-bold cursor-pointer"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. CLIENT BRIEF */}
      {activeTab === 'brief' && (
        <div className="glass-card rounded-2xl border border-slate-200/80 overflow-hidden bg-white shadow-sm">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-sm font-bold text-brand-charcoal uppercase tracking-wider">Client Requirement Briefs</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-brand-charcoal">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200/60 font-bold">
                <tr>
                  <th className="p-4">ID</th>
                  <th className="p-4">Brief Title</th>
                  <th className="p-4">Project</th>
                  <th className="p-4">Author</th>
                  <th className="p-4">Date Uploaded</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clientBriefs.map((brief) => (
                  <tr key={brief.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-brand-primary">{brief.id}</td>
                    <td className="p-4 font-semibold text-brand-charcoal">{brief.title}</td>
                    <td className="p-4 font-semibold text-slate-600">{brief.project}</td>
                    <td className="p-4 text-slate-600">{brief.author}</td>
                    <td className="p-4 text-slate-500">{brief.date}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        brief.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {brief.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. AREA STATEMENT */}
      {activeTab === 'area' && (
        <div className="glass-card rounded-2xl border border-slate-200/80 overflow-hidden bg-white shadow-sm">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-sm font-bold text-brand-charcoal uppercase tracking-wider">Floor Space Index (FSI) & Area Statements</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-brand-charcoal">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200/60 font-bold">
                <tr>
                  <th className="p-4">ID</th>
                  <th className="p-4">Sheet Title</th>
                  <th className="p-4">Project</th>
                  <th className="p-4 text-center">Permissible FSI</th>
                  <th className="p-4 text-center">Proposed FSI</th>
                  <th className="p-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {areaStatements.map((as) => (
                  <tr key={as.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-brand-primary">{as.id}</td>
                    <td className="p-4 font-semibold text-brand-charcoal">{as.title}</td>
                    <td className="p-4 text-slate-600">{as.project}</td>
                    <td className="p-4 text-center font-bold text-brand-charcoal">{as.permissibleFsi}</td>
                    <td className="p-4 text-center font-bold text-brand-gold">{as.proposedFsi}</td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        as.status === 'Verified' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-50 text-slate-600 border border-slate-200'
                      }`}>
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
            <h3 className="text-sm font-bold text-brand-charcoal uppercase tracking-wider">Minutes of Meetings (MOM) Register</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-brand-charcoal">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200/60 font-bold">
                <tr>
                  <th className="p-4">MOM Code</th>
                  <th className="p-4">Meeting Description</th>
                  <th className="p-4">Project</th>
                  <th className="p-4">Meeting Host</th>
                  <th className="p-4">Attendees</th>
                  <th className="p-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {momRecords.map((mom) => (
                  <tr key={mom.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-brand-primary">{mom.id}</td>
                    <td className="p-4 font-semibold text-brand-charcoal">{mom.title}</td>
                    <td className="p-4 text-slate-600">{mom.project}</td>
                    <td className="p-4 font-semibold text-slate-700">{mom.host}</td>
                    <td className="p-4 text-slate-500 truncate max-w-xs">{mom.attendees}</td>
                    <td className="p-4 text-slate-500">{mom.date}</td>
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
            <h3 className="text-sm font-bold text-brand-charcoal uppercase tracking-wider">Site Inspection & Pour Reports</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-brand-charcoal">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200/60 font-bold">
                <tr>
                  <th className="p-4">Report Code</th>
                  <th className="p-4">Inspection Subject</th>
                  <th className="p-4">Project</th>
                  <th className="p-4">Site Auditor</th>
                  <th className="p-4">Audit Date</th>
                  <th className="p-4">Design Compliance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {siteReports.map((rep) => (
                  <tr key={rep.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-brand-primary">{rep.id}</td>
                    <td className="p-4 font-semibold text-brand-charcoal">{rep.title}</td>
                    <td className="p-4 text-slate-600">{rep.project}</td>
                    <td className="p-4 font-semibold text-slate-700">{rep.inspector}</td>
                    <td className="p-4 text-slate-500">{rep.date}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        rep.compliance.includes('100%') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {rep.compliance}
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
            <h3 className="text-sm font-bold text-brand-charcoal uppercase tracking-wider">Request for Information (RFI) Queries</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-brand-charcoal">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200/60 font-bold">
                <tr>
                  <th className="p-4">RFI Code</th>
                  <th className="p-4">Query Subject</th>
                  <th className="p-4">Project</th>
                  <th className="p-4">Raised By</th>
                  <th className="p-4">Assigned To</th>
                  <th className="p-4">RFI Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rfiRecords.map((rfi) => (
                  <tr key={rfi.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-brand-primary">{rfi.id}</td>
                    <td className="p-4 font-semibold text-brand-charcoal">{rfi.title}</td>
                    <td className="p-4 text-slate-600">{rfi.project}</td>
                    <td className="p-4 font-semibold text-slate-700">{rfi.raisedBy}</td>
                    <td className="p-4 text-slate-600">{rfi.assignee}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        rfi.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-primary-50 text-brand-primary border border-primary-100'
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
                  <th className="p-4">Checklist ID</th>
                  <th className="p-4">Audit Item</th>
                  <th className="p-4">Drawing Reference</th>
                  <th className="p-4">Auditor</th>
                  <th className="p-4">Audit Date</th>
                  <th className="p-4">Audit Result</th>
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
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        chk.result === 'Pass' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
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
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        mas.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-primary-50 text-brand-primary border border-primary-100'
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

      {/* Add Drawing Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 text-brand-charcoal">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
              <h2 className="text-base font-extrabold text-brand-charcoal flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-primary" /> Document Revision Registration
              </h2>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Drawing Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Drawing Number</label>
                  <input
                    type="text"
                    {...register('drawingNumber', { required: 'Drawing number is required' })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary/60 focus:ring-1 focus:ring-brand-primary/20 outline-none rounded-xl px-4 py-2.5 text-xs text-slate-800"
                    placeholder="e.g. SSA-CH-ARC-PL-001"
                  />
                  {errors.drawingNumber && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.drawingNumber.message}</p>}
                </div>

                {/* Drawing Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Drawing Title</label>
                  <input
                    type="text"
                    {...register('drawingTitle', { required: 'Drawing title is required' })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary/60 focus:ring-1 focus:ring-brand-primary/20 outline-none rounded-xl px-4 py-2.5 text-xs text-slate-800"
                    placeholder="Ground Floor Plan"
                  />
                  {errors.drawingTitle && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.drawingTitle.message}</p>}
                </div>

                {/* Project Code */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Associated Project</label>
                  <select
                    {...register('projectCode', { required: true })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary/60 outline-none rounded-xl px-4 py-2.5 text-xs text-slate-800 cursor-pointer"
                  >
                    <option value="SSA-CH-GR01">GR Heights IT Tech Park</option>
                    <option value="SSA-BLR-FH02">Fortis Oncology Wing expansion</option>
                    <option value="SSA-MUM-ZS03">Zoya Office Complex</option>
                  </select>
                </div>

                {/* Revision Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Revision Index</label>
                  <input
                    type="text"
                    {...register('revisionNumber', { required: 'Rev is required' })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary/60 focus:ring-1 focus:ring-brand-primary/20 outline-none rounded-xl px-4 py-2.5 text-xs text-slate-800"
                    placeholder="R1"
                  />
                </div>

                {/* Prepared By */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Prepared By (Designer)</label>
                  <input
                    type="text"
                    {...register('preparedBy', { required: true })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary/60 focus:ring-1 focus:ring-brand-primary/20 outline-none rounded-xl px-4 py-2.5 text-xs text-slate-800"
                    placeholder="Siddharth Sen"
                  />
                </div>

                {/* Approved By */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Approved By (Lead)</label>
                  <input
                    type="text"
                    {...register('approvedBy', { required: true })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary/60 focus:ring-1 focus:ring-brand-primary/20 outline-none rounded-xl px-4 py-2.5 text-xs text-slate-800"
                    placeholder="Ananya Deshmukh"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Revision Date</label>
                  <input
                    type="date"
                    {...register('revisionDate', { required: 'Date is required' })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary/60 outline-none rounded-xl px-4 py-2.5 text-xs text-slate-800"
                    defaultValue={new Date().toISOString().split('T')[0]}
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Revision Status</label>
                  <select
                    {...register('status', { required: true })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary/60 outline-none rounded-xl px-4 py-2.5 text-xs text-slate-800 cursor-pointer"
                  >
                    <option value="Draft">Draft</option>
                    <option value="For Review">For Review</option>
                    <option value="Approved">Approved (Released to Site)</option>
                    <option value="Revision Required">Revision Required</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/95 text-xs font-bold text-white shadow-md shadow-brand-primary/10 transition-colors cursor-pointer"
                >
                  Register Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
