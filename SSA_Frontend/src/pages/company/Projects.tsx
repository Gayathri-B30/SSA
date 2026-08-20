import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useLocation } from 'react-router-dom'
import { Plus, Calendar, DollarSign, MapPin, Scale, Layers } from 'lucide-react'
import api from '../../services/api'
import { ProjectDrawingWorkspace } from './projects/ProjectDrawingWorkspace'
import type { Project } from '../../data/mockData'

interface ProjectsProps {
  defaultTab?: 'projects' | 'milestones'
}

interface ProjectFormInputs {
  projectCode: string
  projectName: string
  client: string
  location: string
  projectType: 'Commercial' | 'Residential' | 'Healthcare' | 'Industrial' | 'Institutional' | 'Hospitality'
  siteArea: string
  builtUpArea: string
  budget: number
  timeline: string
  status: 'Pre Design' | 'Concept' | 'Schematic' | 'Design Development' | 'Tender' | 'Construction' | 'As Built'
  progress: number
}

export const Projects: React.FC<ProjectsProps> = ({ defaultTab = 'projects' }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState<'projects' | 'milestones'>(defaultTab)

  useEffect(() => {
    setActiveTab(defaultTab)
    setSelectedWorkspaceProjectId(null)
    fetchProjects()
  }, [defaultTab, location.pathname, location.key, (location.state as any)?.refreshKey])

  const [projects, setProjects] = useState<Project[]>([])
  const [selectedWorkspaceProjectId, setSelectedWorkspaceProjectId] = useState<string | null>(null)
  const [isAddOpen, setIsAddOpen] = useState(false)

  const fetchProjects = async () => {
    const stored = JSON.parse(localStorage.getItem('ssa_projects') || '[]')
    let dbProjects: Project[] = []
    let dbLeads: any[] = []

    try {
      const res = await api.get('/projects')
      if (res.data?.success && Array.isArray(res.data.data)) {
        dbProjects = res.data.data.map((p: any) => ({
          id: p.id || p.projectCode,
          projectCode: p.projectCode || p.id,
          projectName: p.projectName || p.name || p.title,
          client: p.clientName || p.client || p.company || p.organisation || p.contactPerson || p.projectName || 'Unassigned',
          location: p.location || 'Main Site / Campus',
          projectType: p.projectType || 'Commercial',
          siteArea: p.siteArea || '12,500 sqft',
          builtUpArea: p.builtUpArea || '45,000 sqft',
          budget: p.budget || 18000000,
          timeline: p.timeline || '2026 - 2027',
          status: p.status || 'Schematic',
          progress: p.progress || 45
        }))
      }
    } catch (err) {
      console.warn('Error fetching projects from API:', err)
    }

    try {
      const resLeads = await api.get('/leads')
      if (resLeads.data?.success && Array.isArray(resLeads.data.data)) {
        dbLeads = resLeads.data.data
      }
    } catch (err) {
      console.warn('Error fetching leads from API:', err)
    }

    const mergedMap = new Map()

    // 1. Add DB Projects
    dbProjects.forEach(p => {
      if (p && (p.id || p.projectCode)) mergedMap.set(p.id || p.projectCode, p)
    })

    // 2. Add DB Leads from Lead Generation
    dbLeads.forEach(l => {
      const pCode = l.projectCode || l.leadId || (l.id ? `LD-${l.id}` : null)
      const pName = l.projectName || l.leadTitle || l.leadName || (l.company ? `${l.company} Project` : null)
      if (pCode && pName) {
        const key = l.id ? `LEAD-${l.id}` : pCode
        if (!mergedMap.has(key) && !mergedMap.has(pCode)) {
          mergedMap.set(key, {
            id: key,
            projectCode: pCode,
            projectName: pName,
            client: l.clientName || l.company || l.organisation || l.contactPerson || l.leadTitle || pName || 'Unassigned',
            location: [l.city, l.state].filter(Boolean).join(', ') || 'Main Site / Campus',
            projectType: l.projectType || l.leadCategory || 'Commercial',
            siteArea: l.siteArea ? `${l.siteArea} ${l.unit || 'sqft'}` : '12,500 sqft',
            builtUpArea: l.expectedBuiltUpArea || '45,000 sqft',
            budget: Number(l.estimatedBudget) || 18000000,
            timeline: l.expectedStartDate ? `${l.expectedStartDate} to ${l.expectedCompletionDate || 'TBD'}` : '2026 - 2027',
            status: l.status === 'Qualified' ? 'Design Development' : 'Pre Design',
            progress: l.status === 'Qualified' ? 30 : 15
          })
        }
      }
    })

    // 3. Add LocalStorage projects
    stored.forEach((p: any) => {
      if (p && (p.id || p.projectCode)) {
        const key = p.id || p.projectCode
        if (!mergedMap.has(key)) mergedMap.set(key, p)
      }
    })

    setProjects(Array.from(mergedMap.values()))
  }

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProjectFormInputs>()

  // Form Submit
  const onSubmit = (data: ProjectFormInputs) => {
    const newP: Project = {
      id: `PRJ-${Math.floor(100 + Math.random() * 900)}`,
      ...data,
      budget: Number(data.budget),
      progress: Number(data.progress),
    }
    const updated = [...projects, newP]
    setProjects(updated)
    const stored = JSON.parse(localStorage.getItem('ssa_projects') || '[]')
    localStorage.setItem('ssa_projects', JSON.stringify([...stored, newP]))
    setIsAddOpen(false)
    reset()
  }

  // Delete project
  const deleteProject = (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      setProjects(projects.filter(p => p.id !== id))
    }
  }

  // Stage indicator badge styling
  const getStageColor = (status: string) => {
    switch (status) {
      case 'Pre Design': return 'bg-slate-800 text-brand-gray border-slate-700'
      case 'Concept': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'Schematic': return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
      case 'Design Development': return 'bg-pink-500/10 text-pink-400 border-pink-500/20'
      case 'Tender': return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      case 'Construction': return 'bg-brand-primary/10 text-brand-gold border-brand-primary/20'
      case 'As Built': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      default: return 'bg-slate-800 text-brand-gray'
    }
  }

  if (selectedWorkspaceProjectId) {
    return <ProjectDrawingWorkspace projectId={selectedWorkspaceProjectId} onBack={() => setSelectedWorkspaceProjectId(null)} />
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-charcoal tracking-tight sm:text-3xl font-extrabold">Projects Directory</h1>
          <p className="text-sm text-brand-gray mt-1">
            Oversee active designs, budget allocations, schematic drawings progression, and milestones.
          </p>
        </div>
        {activeTab === 'projects' && (
          <button
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/95 text-xs font-bold text-white shadow-md shadow-brand-primary/10 transition-all duration-200 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Project
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => navigate('/projects/list')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'projects'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-brand-gray hover:text-brand-charcoal'
          }`}
        >
          Projects
        </button>
        <button
          onClick={() => navigate('/projects/milestones')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'milestones'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-brand-gray hover:text-brand-charcoal'
          }`}
        >
          Milestones
        </button>
      </div>

      {/* Projects view */}
      {activeTab === 'projects' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((prj) => (
            <div
              key={prj.id}
              className="glass-card p-6 rounded-3xl border border-slate-200/80 hover:border-brand-primary/30 transition-all duration-300 relative overflow-hidden group"
            >
              {/* Glowing vertical bar */}
              <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-brand-primary to-brand-gold" />

              <div className="space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="font-mono text-[10px] font-bold text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-md">
                      {prj.projectCode}
                    </span>
                    <h3 className="text-lg font-extrabold text-brand-charcoal mt-1.5 group-hover:text-brand-primary transition-colors">
                      {prj.projectName}
                    </h3>
                    <p className="text-xs text-brand-gray mt-1">Client: <span className="text-brand-charcoal font-medium">{prj.client}</span></p>
                  </div>
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${getStageColor(prj.status)}`}>
                    {prj.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-[11px] text-brand-gray border-t border-slate-200/60 pt-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-brand-primary" />
                    <span className="truncate">{prj.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Scale className="w-3.5 h-3.5 text-brand-primary" />
                    <span>Builtup: <strong className="text-brand-charcoal">{prj.builtUpArea}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-3.5 h-3.5 text-brand-primary" />
                    <span>Budget: <strong className="text-brand-charcoal">₹{(prj.budget / 100000).toFixed(0)}L</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-brand-primary" />
                    <span className="truncate">{prj.timeline}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1 pt-2">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-gray-500">Milestone Progress</span>
                    <span className="text-brand-primary font-bold">{prj.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-brand-primary h-full rounded-full transition-all duration-500" style={{ width: `${prj.progress}%` }} />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center pt-2">
                  <button
                    onClick={() => setSelectedWorkspaceProjectId(prj.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-extrabold transition-all cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5" /> View Drawing Workspace & MDL
                  </button>
                  <button
                    onClick={() => deleteProject(prj.id)}
                    className="text-[10px] text-red-400 hover:text-red-300 font-semibold"
                  >
                    Delete Project
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Milestones view */}
      {activeTab === 'milestones' && (
        <div className="glass-card rounded-2xl border border-slate-200/80 p-5 space-y-6">
          <h3 className="text-sm font-extrabold text-brand-charcoal uppercase tracking-wider">Project Milestones Pipeline</h3>
          <div className="relative border-l border-slate-200 ml-4 pl-6 space-y-6">
            {[
              { title: 'Pre Design Brief Verification', due: 'July 10, 2026', desc: 'Verify land zoning constraints and draft RFI for Signature Commercial Hub.', status: 'Completed' },
              { title: 'Concept Presentation & Enscape Render Walkthrough', due: 'July 28, 2026', desc: 'Secure conceptual plan consent for Fortis Oncology Wing.', status: 'In Progress' },
              { title: 'Good For Construction Drawings (GFC) Issue', due: 'August 15, 2026', desc: 'Release structural column layout revisions for GR Tech Park foundation.', status: 'Pending' },
            ].map((mil, idx) => (
              <div key={idx} className="relative">
                {/* Node icon */}
                <span className={`absolute -left-9.5 top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  mil.status === 'Completed'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : mil.status === 'In Progress'
                    ? 'bg-brand-primary/10 text-brand-gold border border-brand-primary/30'
                    : 'bg-white text-gray-500 border border-slate-200'
                }`}>
                  {idx + 1}
                </span>
                <div>
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold text-xs text-brand-charcoal">{mil.title}</h4>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      mil.status === 'Completed'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : mil.status === 'In Progress'
                        ? 'bg-brand-primary/10 text-brand-gold'
                        : 'bg-slate-800 text-gray-500'
                    }`}>{mil.status}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1">Due: {mil.due}</p>
                  <p className="text-xs text-brand-gray mt-1.5 leading-relaxed">{mil.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Project Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-2xl p-6">
            <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-4">
              <h2 className="text-lg font-extrabold text-brand-charcoal">Register Architectural Project</h2>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1 rounded-lg text-brand-gray hover:text-brand-charcoal hover:bg-slate-100"
              >
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Project Code */}
                <div>
                  <label className="block text-xs font-semibold text-brand-gray uppercase tracking-wider mb-2">Project Code</label>
                  <input
                    type="text"
                    {...register('projectCode', { required: 'Project code is required' })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary/60 outline-none rounded-xl px-4 py-2.5 text-xs text-brand-charcoal"
                    placeholder="e.g. SSA-MUM-ZS03"
                  />
                  {errors.projectCode && <p className="text-red-500 text-[10px] mt-1">{errors.projectCode.message}</p>}
                </div>

                {/* Project Name */}
                <div>
                  <label className="block text-xs font-semibold text-brand-gray uppercase tracking-wider mb-2">Project Name</label>
                  <input
                    type="text"
                    {...register('projectName', { required: 'Project name is required' })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary/60 outline-none rounded-xl px-4 py-2.5 text-xs text-brand-charcoal"
                    placeholder="Zoya Commercial Hub"
                  />
                  {errors.projectName && <p className="text-red-500 text-[10px] mt-1">{errors.projectName.message}</p>}
                </div>

                {/* Client Name */}
                <div>
                  <label className="block text-xs font-semibold text-brand-gray uppercase tracking-wider mb-2">Client Account</label>
                  <input
                    type="text"
                    {...register('client', { required: 'Client name is required' })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary/60 outline-none rounded-xl px-4 py-2.5 text-xs text-brand-charcoal"
                    placeholder="Fortis Health City"
                  />
                  {errors.client && <p className="text-red-500 text-[10px] mt-1">{errors.client.message}</p>}
                </div>

                {/* Location */}
                <div>
                  <label className="block text-xs font-semibold text-brand-gray uppercase tracking-wider mb-2">Location</label>
                  <input
                    type="text"
                    {...register('location', { required: 'Location is required' })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary/60 outline-none rounded-xl px-4 py-2.5 text-xs text-brand-charcoal"
                    placeholder="OMR Road, Chennai"
                  />
                  {errors.location && <p className="text-red-500 text-[10px] mt-1">{errors.location.message}</p>}
                </div>

                {/* Site Area */}
                <div>
                  <label className="block text-xs font-semibold text-brand-gray uppercase tracking-wider mb-2">Site Area</label>
                  <input
                    type="text"
                    {...register('siteArea', { required: 'Site area is required' })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary/60 outline-none rounded-xl px-4 py-2.5 text-xs text-brand-charcoal"
                    placeholder="e.g. 4.5 Acres"
                  />
                  {errors.siteArea && <p className="text-red-500 text-[10px] mt-1">{errors.siteArea.message}</p>}
                </div>

                {/* Built Up Area */}
                <div>
                  <label className="block text-xs font-semibold text-brand-gray uppercase tracking-wider mb-2">Built-Up Area</label>
                  <input
                    type="text"
                    {...register('builtUpArea', { required: 'Built-up area is required' })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary/60 outline-none rounded-xl px-4 py-2.5 text-xs text-brand-charcoal"
                    placeholder="e.g. 85,000 Sq.Ft"
                  />
                  {errors.builtUpArea && <p className="text-red-500 text-[10px] mt-1">{errors.builtUpArea.message}</p>}
                </div>

                {/* Budget */}
                <div>
                  <label className="block text-xs font-semibold text-brand-gray uppercase tracking-wider mb-2">Budget (INR ₹)</label>
                  <input
                    type="number"
                    {...register('budget', { required: 'Budget is required', min: 1000 })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary/60 outline-none rounded-xl px-4 py-2.5 text-xs text-brand-charcoal"
                    placeholder="25000000"
                  />
                  {errors.budget && <p className="text-red-500 text-[10px] mt-1">{errors.budget.message}</p>}
                </div>

                {/* Timeline */}
                <div>
                  <label className="block text-xs font-semibold text-brand-gray uppercase tracking-wider mb-2">Timeline Range</label>
                  <input
                    type="text"
                    {...register('timeline', { required: 'Timeline is required' })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary/60 outline-none rounded-xl px-4 py-2.5 text-xs text-brand-charcoal"
                    placeholder="Jan 2026 - Dec 2027"
                  />
                  {errors.timeline && <p className="text-red-500 text-[10px] mt-1">{errors.timeline.message}</p>}
                </div>

                {/* Project Type */}
                <div>
                  <label className="block text-xs font-semibold text-brand-gray uppercase tracking-wider mb-2">Project Classification</label>
                  <select
                    {...register('projectType', { required: true })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary/60 outline-none rounded-xl px-4 py-2.5 text-xs text-brand-charcoal"
                  >
                    <option value="Commercial">Commercial</option>
                    <option value="Residential">Residential</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Industrial">Industrial</option>
                    <option value="Institutional">Institutional</option>
                    <option value="Hospitality">Hospitality</option>
                  </select>
                </div>

                {/* Status Stage */}
                <div>
                  <label className="block text-xs font-semibold text-brand-gray uppercase tracking-wider mb-2">Initial Stage</label>
                  <select
                    {...register('status', { required: true })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary/60 outline-none rounded-xl px-4 py-2.5 text-xs text-brand-charcoal"
                  >
                    <option value="Pre Design">Pre Design</option>
                    <option value="Concept">Concept</option>
                    <option value="Schematic">Schematic</option>
                    <option value="Design Development">Design Development</option>
                    <option value="Tender">Tender</option>
                    <option value="Construction">Construction</option>
                    <option value="As Built">As Built</option>
                  </select>
                </div>

                {/* Initial Progress percentage */}
                <div>
                  <label className="block text-xs font-semibold text-brand-gray uppercase tracking-wider mb-2">Initial Progress (%)</label>
                  <input
                    type="number"
                    {...register('progress', { required: true, min: 0, max: 100 })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary/60 outline-none rounded-xl px-4 py-2.5 text-xs text-brand-charcoal"
                    defaultValue={10}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-brand-gray hover:text-brand-charcoal"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/95 text-xs font-bold text-white shadow-md shadow-brand-primary/10 cursor-pointer transition-colors"
                >
                  Register Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
