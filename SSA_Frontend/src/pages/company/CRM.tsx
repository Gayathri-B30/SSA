import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import {
  type Lead,
  type Opportunity,
  type Client
} from '../../data/mockData'
import { Plus, UserCheck, Sparkles, Phone, Mail, Calendar, RefreshCcw, Trash2, Eye, User, MapPin, Layers, Globe, FileText, Activity, Briefcase, Edit2 } from 'lucide-react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { CategoryQuestionManagerModal } from './leads/CategoryQuestionManagerModal'

interface CRMProps {
  defaultTab?: 'leads' | 'opportunities' | 'clients'
}

interface LeadFormInputs {
  leadName: string
  company: string
  contactPerson: string
  mobile: string
  email: string
  source: 'Website' | 'Reference' | 'Cold Call' | 'Social Media' | 'Partner'
  assignedTo: string
  status: 'New' | 'Contacted' | 'Meeting' | 'Proposal' | 'Negotiation' | 'Qualified'
}

export const CRM: React.FC<CRMProps> = ({ defaultTab = 'leads' }) => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'leads' | 'opportunities' | 'clients'>(defaultTab)

  useEffect(() => {
    setActiveTab(defaultTab)
  }, [defaultTab])

  const [leads, setLeads] = useState<Lead[]>([])
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loadingLeads, setLoadingLeads] = useState(false)
  const [isManageModalOpen, setIsManageModalOpen] = useState(false)


  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false)
  const [convertingLead, setConvertingLead] = useState<Lead | null>(null)
  const [selectedLeadDetails, setSelectedLeadDetails] = useState<any | null>(null)
  const [_, setIsLoadingDetails] = useState(false)

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<LeadFormInputs>({ mode: 'onChange' })

  const fetchData = async () => {
    setLoadingLeads(true)
    try {
      const response = await api.get('/leads')
      if (response.data?.success) {
        const raw = response.data.data || []

        // 1. Map Leads
        const activeLeads = raw.filter((l: any) => l.status !== 'Won' && l.status !== 'Lost')
        const mappedLeads: Lead[] = activeLeads.map((l: any) => ({
          id: l.leadId || `LD-${l.id}`,
          dbId: l.id,
          leadName: l.leadTitle || l.projectName || 'Unnamed Project',
          company: l.company || l.organisation || 'No Company',
          contactPerson: l.contactPerson || l.clientName || 'No Contact',
          mobile: l.mobile || '',
          email: l.email || '',
          source: l.leadSource || 'Other',
          assignedTo: l.assignedEmployee || 'Unassigned',
          status: l.status || 'New Lead'
        }))
        setLeads(mappedLeads)

        // 2. Map Opportunities
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

        // 3. Map Clients
        const wonLeads = raw.filter((l: any) => (l.status || '').toLowerCase() === 'won')
        const mappedClients: Client[] = wonLeads.map((c: any) => {
          const budgetNum = parseFloat((c.estimatedBudget || '').replace(/[^0-9.]/g, '')) || 0
          return {
            id: `CL-${c.id}`,
            clientName: c.contactPerson || c.clientName || 'No Contact',
            company: c.company || c.organisation || 'No Company',
            mobile: c.mobile || '',
            email: c.email || '',
            contractValue: budgetNum,
            contractStatus: 'Active',
            projectsCount: 1
          }
        })
        setClients(mappedClients)
      }
    } catch (err) {
      console.error('Failed to fetch CRM data:', err)
    } finally {
      setLoadingLeads(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // 1. Submit Add Lead Form
  const onSubmitLead = (data: LeadFormInputs) => {
    const newL: Lead = {
      id: `LD-${Math.floor(900 + Math.random() * 100)}`,
      ...data
    }
    setLeads([newL, ...leads])
    setIsAddLeadOpen(false)
    reset()
  }

  // Delete Lead
  const deleteLead = async (id: string) => {
    const lead = leads.find(l => l.id === id)
    if (!lead) return

    if (confirm(`Are you sure you want to delete lead ${lead.id}?`)) {
      try {
        if (lead.dbId) {
          const response = await api.delete(`/leads/${lead.dbId}`)
          if (response.data?.success) {
            setLeads(leads.filter(l => l.id !== id))
          } else {
            alert(response.data?.message || 'Failed to delete lead from server.')
          }
        } else {
          // Fallback if dbId is missing
          setLeads(leads.filter(l => l.id !== id))
        }
      } catch (err: any) {
        console.error('Error deleting lead:', err)
        alert(err.response?.data?.message || err.message || 'Error deleting lead.')
      }
    }
  }

  // 2. Conversion Workflow: Qualified Lead -> Client
  const initiateConvertWorkflow = (lead: Lead) => {
    setConvertingLead(lead)
  }

  const handleConvertConfirm = (value: number) => {
    if (!convertingLead) return

    // Create Client
    const newClient: Client = {
      id: `CL-${Math.floor(100 + Math.random() * 900)}`,
      clientName: convertingLead.contactPerson,
      company: convertingLead.company,
      mobile: convertingLead.mobile,
      email: convertingLead.email,
      contractValue: value,
      contractStatus: 'Active',
      projectsCount: 1
    }

    // Move to Client state
    setClients([newClient, ...clients])

    // Remove from Leads
    setLeads(leads.filter(l => l.id !== convertingLead.id))

    // Also remove associated Opportunity if any
    setOpportunities(opportunities.filter(o => o.leadId !== convertingLead.id))

    alert(`Successfully converted lead "${convertingLead.leadName}" into Client and generated a project record!`)
    setConvertingLead(null)
    setActiveTab('clients')
  }

  const viewLeadDetails = async (lead: Lead) => {
    if (lead.dbId) {
      setIsLoadingDetails(true)
      setSelectedLeadDetails({ ...lead, loading: true })
      try {
        const response = await api.get(`/leads/${lead.dbId}`)
        if (response.data?.success) {
          setSelectedLeadDetails(response.data.data)
        } else {
          setSelectedLeadDetails(lead)
        }
      } catch (err) {
        console.error('Failed to fetch lead details:', err)
        setSelectedLeadDetails(lead)
      } finally {
        setIsLoadingDetails(false)
      }
    } else {
      setSelectedLeadDetails(lead)
    }
  }

  const renderSafeValue = (val: any) => {
    if (!val) return 'N/A'
    if (typeof val === 'object') {
      return val.name || val.title || val.code || JSON.stringify(val)
    }
    return String(val)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-charcoal tracking-tight sm:text-3xl font-extrabold">CRM Workspace</h1>
          <p className="text-sm text-brand-gray mt-1">Acquire prospective leads, track opportunities, and view active client agreements.</p>
        </div>
        {activeTab === 'leads' && (
          <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
            {(user?.role === 'Company' || user?.role === 'Super Admin') && (
              <button
                type="button"
                onClick={() => navigate('/crm/leads/categories-questions')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 transition-all duration-200 cursor-pointer shadow-xs"
              >
                <Layers className="w-4 h-4 text-brand-primary" /> Manage Categories & Questions
              </button>
            )}
            <button
              onClick={() => navigate('/crm/leads/create')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary text-xs font-extrabold text-white shadow-md shadow-brand-primary/20 transition-all duration-200 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Create Lead
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      {/* <div className="flex border-b border-slate-200">
        <button
          onClick={() => navigate('/crm/leads')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'leads'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-brand-gray hover:text-brand-charcoal'
          }`}
        >
          Leads
        </button>
        <button
          onClick={() => navigate('/crm/opportunities')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'opportunities'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-brand-gray hover:text-brand-charcoal'
          }`}
        >
          Opportunities
        </button>
        <button
          onClick={() => navigate('/crm/clients')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'clients'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-brand-gray hover:text-brand-charcoal'
          }`}
        >
          Clients
        </button>
      </div> */}

      {/* 1. LEADS VIEW */}
      {activeTab === 'leads' && (
        loadingLeads ? (
          <div className="py-12 flex flex-col justify-center items-center gap-2 bg-white rounded-2xl border border-slate-200">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Loading Leads...</span>
          </div>
        ) : (
          <div className="glass-card rounded-2xl border border-slate-200/80 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-brand-charcoal">
                <thead className="bg-slate-50 text-brand-gray uppercase tracking-wider">
                  <tr className="border-b border-slate-200">
                    <th className="p-4 font-semibold">Lead ID</th>
                    <th className="p-4 font-semibold">Project Prospect / Lead</th>
                    <th className="p-4 font-semibold">Contact Details</th>
                    <th className="p-4 font-semibold">Source</th>
                    <th className="p-4 font-semibold">Assigned Owner</th>
                    <th className="p-4 font-semibold">Pipeline Status</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leads.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400 font-semibold uppercase tracking-wider">
                        No data available
                      </td>
                    </tr>
                  ) : (
                    leads.map((l) => (
                      <tr key={l.id} className="hover:bg-white/10 transition-colors">
                        <td className="p-4 font-mono font-bold text-brand-primary">{l.id}</td>
                        <td className="p-4">
                          <div className="space-y-0.5">
                            <span className="font-bold text-brand-charcoal">{l.leadName}</span>
                            <p className="text-[10px] text-gray-500 uppercase">{l.company}</p>
                          </div>
                        </td>
                        <td className="p-4 space-y-0.5 text-brand-gray">
                          <p className="text-brand-charcoal font-semibold">{l.contactPerson}</p>
                          <p className="flex items-center gap-1"><Phone className="w-3 h-3 text-brand-primary" /> {l.mobile}</p>
                        </td>
                        <td className="p-4">{l.source}</td>
                        <td className="p-4 font-medium text-brand-charcoal">{l.assignedTo}</td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${['won', 'qualified'].includes((l.status || '').toLowerCase())
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : ['negotiation', 'proposal sent', 'requirement collection'].includes((l.status || '').toLowerCase())
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                  : (l.status || '').toLowerCase() === 'draft'
                                    ? 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                                    : 'bg-slate-800 text-brand-gray border border-slate-700'
                              }`}
                          >
                            {l.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {l.status === 'Qualified' && (
                              <button
                                onClick={() => initiateConvertWorkflow(l)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-primary hover:bg-brand-primary text-[10px] font-extrabold text-brand-charcoal transition-colors cursor-pointer"
                                title="Convert to Client"
                              >
                                <UserCheck className="w-3 h-3" /> Convert
                              </button>
                            )}
                            <button
                              onClick={() => viewLeadDetails(l)}
                              className="p-1.5 rounded-lg text-brand-gray hover:text-brand-charcoal hover:bg-slate-100 dark:hover:bg-slate-800 bg-transparent transition-colors cursor-pointer"
                              title="View Lead Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => navigate(`/crm/leads/edit/${l.dbId}`)}
                              className="p-1.5 rounded-lg text-brand-gray hover:text-brand-charcoal hover:bg-slate-100 dark:hover:bg-slate-800 bg-transparent transition-colors cursor-pointer"
                              title="Edit Lead Details"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteLead(l.id)}
                              className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-500/10 bg-transparent transition-colors cursor-pointer"
                              title="Delete Lead"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
        )
      )}

      {/* 2. OPPORTUNITIES VIEW */}
      {activeTab === 'opportunities' && (
        loadingLeads ? (
          <div className="py-12 flex flex-col justify-center items-center gap-2 bg-white rounded-2xl border border-slate-200">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Loading Opportunities...</span>
          </div>
        ) : (
          <div className="glass-card rounded-2xl border border-slate-200/80 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-brand-charcoal">
                <thead className="bg-slate-50 text-brand-gray uppercase tracking-wider">
                  <tr className="border-b border-slate-200">
                    <th className="p-4 font-semibold">Deal ID</th>
                    <th className="p-4 font-semibold">Opportunity Name</th>
                    <th className="p-4 font-semibold">Prospective Company</th>
                    <th className="p-4 font-semibold">Est. Deal Value</th>
                    <th className="p-4 font-semibold">Probability</th>
                    <th className="p-4 font-semibold">Expected Closure</th>
                    <th className="p-4 font-semibold">Deal Stage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {opportunities.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400 font-semibold uppercase tracking-wider">
                        No data available
                      </td>
                    </tr>
                  ) : (
                    opportunities.map((opp) => (
                      <tr key={opp.id} className="hover:bg-white/10 transition-colors">
                        <td className="p-4 font-mono font-bold text-brand-primary">{opp.id}</td>
                        <td className="p-4 font-bold text-brand-charcoal">{opp.leadName}</td>
                        <td className="p-4 text-brand-gray">{opp.company}</td>
                        <td className="p-4 font-extrabold text-brand-charcoal">
                          ₹{(opp.opportunityValue / 100000).toFixed(1)} Lakhs
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-brand-primary h-full rounded-full" style={{ width: `${opp.probability}%` }} />
                            </div>
                            <span className="font-extrabold text-brand-charcoal">{opp.probability}%</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1 text-brand-gray">
                            <Calendar className="w-3.5 h-3.5 text-brand-primary" />
                            <span>{opp.expectedClosureDate}</span>
                          </div>
                        </td>
                        <td className="p-4">
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
        )
      )}

      {/* 3. CLIENTS VIEW */}
      {activeTab === 'clients' && (
        loadingLeads ? (
          <div className="py-12 flex flex-col justify-center items-center gap-2 bg-white rounded-2xl border border-slate-200">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Loading Clients...</span>
          </div>
        ) : (
          <div className="glass-card rounded-2xl border border-slate-200/80 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-brand-charcoal">
                <thead className="bg-slate-50 text-brand-gray uppercase tracking-wider">
                  <tr className="border-b border-slate-200">
                    <th className="p-4 font-semibold">Client ID</th>
                    <th className="p-4 font-semibold">Developer Representative</th>
                    <th className="p-4 font-semibold">Company Account</th>
                    <th className="p-4 font-semibold">Active Contacts</th>
                    <th className="p-4 font-semibold">Contract Portfolio Value</th>
                    <th className="p-4 font-semibold">Agreement Status</th>
                    <th className="p-4 font-semibold text-center">Projects</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {clients.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400 font-semibold uppercase tracking-wider">
                        No data available
                      </td>
                    </tr>
                  ) : (
                    clients.map((c) => (
                      <tr key={c.id} className="hover:bg-white/10 transition-colors">
                        <td className="p-4 font-mono font-bold text-brand-primary">{c.id}</td>
                        <td className="p-4 font-bold text-brand-charcoal">{c.clientName}</td>
                        <td className="p-4 font-medium text-brand-charcoal">{c.company}</td>
                        <td className="p-4 space-y-0.5 text-brand-gray">
                          <p className="flex items-center gap-1"><Mail className="w-3 h-3 text-brand-primary" /> {c.email}</p>
                          <p className="flex items-center gap-1"><Phone className="w-3 h-3 text-brand-primary" /> {c.mobile}</p>
                        </td>
                        <td className="p-4 font-extrabold text-brand-charcoal">
                          ₹{(c.contractValue / 10000000).toFixed(2)} Cr
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${c.contractStatus === 'Active'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : c.contractStatus === 'Completed'
                                  ? 'bg-brand-primary/10 text-brand-gold border border-brand-primary/20'
                                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              }`}
                          >
                            {c.contractStatus}
                          </span>
                        </td>
                        <td className="p-4 text-center font-extrabold text-brand-charcoal">{c.projectsCount}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* Add Lead Modal */}
      {isAddLeadOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-2xl p-6">
            <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-4">
              <h2 className="text-lg font-extrabold text-brand-charcoal flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-primary" /> Acquire Prospective Lead
              </h2>
              <button
                onClick={() => setIsAddLeadOpen(false)}
                className="p-1 rounded-lg text-brand-gray hover:text-brand-charcoal hover:bg-bg-base dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 bg-transparent outline-none focus:outline-none transition-colors"
              >
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmitLead)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Lead Name */}
                <div>
                  <label className="block text-xs font-semibold text-brand-gray uppercase tracking-wider mb-2">Lead Name / Project Brief</label>
                  <input
                    type="text"
                    maxLength={150}
                    {...register('leadName', {
                      required: 'Lead name is required',
                      pattern: {
                        value: /^[a-zA-Z0-9]+[a-zA-Z0-9\s.'&()_-]*$/,
                        message: 'Name must start with an alphanumeric character and contain valid text'
                      },
                      onChange: (e) => {
                        const val = e.target.value.replace(/[^a-zA-Z0-9\s.'&()_-]/g, '')
                        e.target.value = val
                        setValue('leadName', val, { shouldValidate: true })
                      }
                    })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary/60 outline-none rounded-xl px-4 py-2.5 text-xs text-brand-charcoal"
                    placeholder="Signature Commercial Hub"
                  />
                  {errors.leadName && <p className="text-red-500 text-[10px] mt-1">{errors.leadName.message}</p>}
                </div>

                {/* Company */}
                <div>
                  <label className="block text-xs font-semibold text-brand-gray uppercase tracking-wider mb-2">Company / Developer Name</label>
                  <input
                    type="text"
                    maxLength={100}
                    {...register('company', {
                      required: 'Company is required',
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
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary/60 outline-none rounded-xl px-4 py-2.5 text-xs text-brand-charcoal"
                    placeholder="Signature Infra Developers"
                  />
                  {errors.company && <p className="text-red-500 text-[10px] mt-1">{errors.company.message}</p>}
                </div>

                {/* Contact Person */}
                <div>
                  <label className="block text-xs font-semibold text-brand-gray uppercase tracking-wider mb-2">Contact Person</label>
                  <input
                    type="text"
                    maxLength={50}
                    {...register('contactPerson', {
                      required: 'Contact name is required',
                      pattern: {
                        value: /^[a-zA-Z]+[a-zA-Z\s.'-]*$/,
                        message: 'Name must start with a letter and contain only alphabets/spaces/dots'
                      },
                      onChange: (e) => {
                        const val = e.target.value.replace(/[^a-zA-Z\s.'-]/g, '')
                        e.target.value = val
                        setValue('contactPerson', val, { shouldValidate: true })
                      }
                    })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary/60 outline-none rounded-xl px-4 py-2.5 text-xs text-brand-charcoal"
                    placeholder="Mr. Ramesh K."
                  />
                  {errors.contactPerson && <p className="text-red-500 text-[10px] mt-1">{errors.contactPerson.message}</p>}
                </div>

                {/* Mobile */}
                <div>
                  <label className="block text-xs font-semibold text-brand-gray uppercase tracking-wider mb-2">Mobile Phone</label>
                  <input
                    type="tel"
                    maxLength={10}
                    {...register('mobile', {
                      required: 'Mobile number is required',
                      pattern: {
                        value: /^[6-9]\d{9}$/,
                        message: 'Enter a valid 10-digit mobile number'
                      },
                      onChange: (e) => {
                        const val = e.target.value.replace(/\D/g, '')
                        e.target.value = val
                        setValue('mobile', val, { shouldValidate: true })
                      }
                    })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary/60 outline-none rounded-xl px-4 py-2.5 text-xs text-brand-charcoal"
                    placeholder="98XXXXXXXX"
                  />
                  {errors.mobile && <p className="text-red-500 text-[10px] mt-1">{errors.mobile.message}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-brand-gray uppercase tracking-wider mb-2">Email Address</label>
                  <input
                    type="email"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Enter a valid email address'
                      }
                    })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary/60 outline-none rounded-xl px-4 py-2.5 text-xs text-brand-charcoal"
                    placeholder="ramesh@signatureinfra.com"
                  />
                  {errors.email && <p className="text-red-500 text-[10px] mt-1">{errors.email.message}</p>}
                </div>

                {/* Source */}
                <div>
                  <label className="block text-xs font-semibold text-brand-gray uppercase tracking-wider mb-2">Lead Source</label>
                  <select
                    {...register('source')}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary/60 outline-none rounded-xl px-4 py-2.5 text-xs text-brand-charcoal"
                  >
                    <option value="Website">Website</option>
                    <option value="Reference">Reference</option>
                    <option value="Cold Call">Cold Call</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Partner">Partner</option>
                  </select>
                </div>

                {/* Assigned To */}
                <div>
                  <label className="block text-xs font-semibold text-brand-gray uppercase tracking-wider mb-2">Assigned Owner</label>
                  <select
                    {...register('assignedTo')}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary/60 outline-none rounded-xl px-4 py-2.5 text-xs text-brand-charcoal"
                  >
                    <option value="Rajeev Mehta">Rajeev Mehta</option>
                    <option value="Ananya Deshmukh">Ananya Deshmukh</option>
                    <option value="Vikram Malhotra">Vikram Malhotra</option>
                    <option value="Sundar Sundram">Sundar Sundram</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold text-brand-gray uppercase tracking-wider mb-2">Pipeline Status</label>
                  <select
                    {...register('status')}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary/60 outline-none rounded-xl px-4 py-2.5 text-xs text-brand-charcoal"
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Proposal">Proposal</option>
                    <option value="Negotiation">Negotiation</option>
                    <option value="Qualified">Qualified</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddLeadOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-brand-gray hover:text-brand-charcoal"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary text-xs font-extrabold text-brand-charcoal"
                >
                  Create Lead
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Convert Lead Workflow Dialog Modal */}
      {convertingLead && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl p-6">
            <h2 className="text-lg font-extrabold text-brand-charcoal flex items-center gap-2 mb-2">
              <RefreshCcw className="w-5 h-5 text-brand-primary" /> Convert Prospect to Active Client
            </h2>
            <p className="text-xs text-brand-gray leading-relaxed mb-4">
              Verify the final negotiated contract portfolio value to complete conversion for <strong>{convertingLead.company}</strong>.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-gray uppercase tracking-wider mb-2">Final Portfolio Value (INR ₹)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-brand-primary font-bold">₹</span>
                  <input
                    type="number"
                    id="convert-value-input"
                    defaultValue={18000000}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary/60 outline-none rounded-xl pl-8 pr-4 py-2.5 text-xs text-brand-charcoal"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setConvertingLead(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-brand-gray hover:text-brand-charcoal"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const val = Number((document.getElementById('convert-value-input') as HTMLInputElement).value)
                    handleConvertConfirm(val)
                  }}
                  className="px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary text-xs font-extrabold text-brand-charcoal shadow-md shadow-brand-primary/20"
                >
                  Complete Conversion
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
      {/* Selected Lead Details Modal */}
      {selectedLeadDetails && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto no-scrollbar">
          <div className="w-full max-w-4xl bg-bg-panel border border-border-base rounded-3xl shadow-2xl p-6 md:p-8 my-8 relative overflow-hidden flex flex-col max-h-[90vh] md:max-h-[85vh]">
            
            {/* Header */}
            <div className="flex justify-between items-start border-b border-border-base pb-4 mb-6 flex-shrink-0">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] bg-brand-primary/10 text-brand-primary font-bold border border-brand-primary/20">
                  {selectedLeadDetails.status || 'New Lead'}
                </span>
                <h2 className="text-xl font-extrabold text-brand-charcoal flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-brand-primary" /> {selectedLeadDetails.leadName || selectedLeadDetails.leadTitle || 'Lead Details'}
                </h2>
                <p className="text-xs text-brand-gray">Lead ID: <span className="font-mono font-bold text-brand-primary">{selectedLeadDetails.id}</span></p>
              </div>
              <button
                onClick={() => setSelectedLeadDetails(null)}
                className="p-1.5 rounded-xl text-brand-gray hover:text-brand-charcoal hover:bg-bg-base dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 bg-transparent outline-none focus:outline-none transition-colors"
                title="Close"
              >
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>

            {selectedLeadDetails.loading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-3 flex-grow">
                <div className="w-10 h-10 border-4 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin"></div>
                <p className="text-xs font-semibold text-brand-gray">Fetching complete lead information...</p>
              </div>
            ) : (
              <div className="space-y-6 overflow-y-auto flex-grow pr-1 no-scrollbar">
                
                {/* Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Column 1: Client & Contact Info */}
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-bg-base border border-border-base space-y-3">
                      <h3 className="text-xs font-bold text-brand-charcoal uppercase tracking-wider flex items-center gap-1.5 border-b border-border-base pb-2">
                        <User className="w-4 h-4 text-brand-primary" /> Client & Account Details
                      </h3>
                      
                      <div className="grid grid-cols-3 gap-y-2 text-xs">
                        <span className="text-brand-gray font-medium">Company:</span>
                        <span className="col-span-2 text-brand-charcoal font-bold">{selectedLeadDetails.company || 'N/A'}</span>
                        
                        <span className="text-brand-gray font-medium">Contact Person:</span>
                        <span className="col-span-2 text-brand-charcoal font-semibold">{selectedLeadDetails.contactPerson || selectedLeadDetails.clientName || 'N/A'}</span>
                        
                        <span className="text-brand-gray font-medium">Mobile:</span>
                        <span className="col-span-2 text-brand-charcoal flex items-center gap-1">
                          <Phone className="w-3 h-3 text-brand-primary" /> {selectedLeadDetails.mobile || 'N/A'}
                        </span>
                        
                        <span className="text-brand-gray font-medium">Email:</span>
                        <span className="col-span-2 text-brand-charcoal flex items-center gap-1 truncate">
                          <Mail className="w-3 h-3 text-brand-primary" /> {selectedLeadDetails.email || 'N/A'}
                        </span>
                        
                        <span className="text-brand-gray font-medium">Lead Source:</span>
                        <span className="col-span-2 text-brand-charcoal">{selectedLeadDetails.source || selectedLeadDetails.leadSource || 'N/A'}</span>

                        <span className="text-brand-gray font-medium">Assigned Owner:</span>
                        <span className="col-span-2 text-brand-charcoal font-semibold">{renderSafeValue(selectedLeadDetails.assignedTo || selectedLeadDetails.assignedEmployee || 'Unassigned')}</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-bg-base border border-border-base space-y-3">
                      <h3 className="text-xs font-bold text-brand-charcoal uppercase tracking-wider flex items-center gap-1.5 border-b border-border-base pb-2">
                        <MapPin className="w-4 h-4 text-brand-primary" /> Site & Location Details
                      </h3>
                      
                      <div className="grid grid-cols-3 gap-y-2 text-xs">
                        <span className="text-brand-gray font-medium">Site Address:</span>
                        <span className="col-span-2 text-brand-charcoal leading-relaxed">{selectedLeadDetails.siteAddress || 'N/A'}</span>
                        
                        <span className="text-brand-gray font-medium">City:</span>
                        <span className="col-span-2 text-brand-charcoal">{selectedLeadDetails.city || 'N/A'}</span>
                        
                        <span className="text-brand-gray font-medium">State:</span>
                        <span className="col-span-2 text-brand-charcoal">{selectedLeadDetails.state || 'N/A'}</span>
                        
                        <span className="text-brand-gray font-medium">Country:</span>
                        <span className="col-span-2 text-brand-charcoal flex items-center gap-1">
                          <Globe className="w-3.5 h-3.5 text-brand-primary" /> {selectedLeadDetails.country || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Project Specifications */}
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-bg-base border border-border-base space-y-3">
                      <h3 className="text-xs font-bold text-brand-charcoal uppercase tracking-wider flex items-center gap-1.5 border-b border-border-base pb-2">
                        <Layers className="w-4 h-4 text-brand-primary" /> Project Specifications
                      </h3>
                      
                      <div className="grid grid-cols-3 gap-y-2 text-xs">
                        <span className="text-brand-gray font-medium">Project Type:</span>
                        <span className="col-span-2 text-brand-charcoal font-bold">{renderSafeValue(selectedLeadDetails.projectType || 'N/A')}</span>
                        
                        <span className="text-brand-gray font-medium">Sub Type:</span>
                        <span className="col-span-2 text-brand-charcoal">{renderSafeValue(selectedLeadDetails.projectSubType || 'N/A')}</span>
                        
                        <span className="text-brand-gray font-medium">Category:</span>
                        <span className="col-span-2 text-brand-charcoal">{renderSafeValue(selectedLeadDetails.category || 'N/A')}</span>
                        
                        <span className="text-brand-gray font-medium">Survey Number:</span>
                        <span className="col-span-2 text-brand-charcoal font-mono">{selectedLeadDetails.surveyNumber || 'N/A'}</span>
                        
                        <span className="text-brand-gray font-medium">Site Area:</span>
                        <span className="col-span-2 text-brand-charcoal font-semibold">
                          {selectedLeadDetails.siteArea ? `${selectedLeadDetails.siteArea} ${selectedLeadDetails.unit || 'sqft'}` : 'N/A'}
                        </span>
                        
                        <span className="text-brand-gray font-medium">Est. Budget:</span>
                        <span className="col-span-2 text-brand-charcoal font-extrabold text-brand-primary">
                          {selectedLeadDetails.estimatedBudget ? `₹${selectedLeadDetails.estimatedBudget}` : 'N/A'}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-bg-base border border-border-base space-y-3">
                      <h3 className="text-xs font-bold text-brand-charcoal uppercase tracking-wider flex items-center gap-1.5 border-b border-border-base pb-2">
                        <Calendar className="w-4 h-4 text-brand-primary" /> Timeline & Branch
                      </h3>
                      
                      <div className="grid grid-cols-3 gap-y-2 text-xs">
                        <span className="text-brand-gray font-medium">Start Date:</span>
                        <span className="col-span-2 text-brand-charcoal">{selectedLeadDetails.expectedStartDate || 'N/A'}</span>
                        
                        <span className="text-brand-gray font-medium">End Date:</span>
                        <span className="col-span-2 text-brand-charcoal">{selectedLeadDetails.expectedCompletionDate || 'N/A'}</span>
                        
                        <span className="text-brand-gray font-medium">Branch:</span>
                        <span className="col-span-2 text-brand-charcoal flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5 text-brand-primary" /> {renderSafeValue(selectedLeadDetails.branch || 'N/A')}
                        </span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Section 3: Dynamic Category Values / Requirements */}
                {selectedLeadDetails.categoryValues && Object.keys(selectedLeadDetails.categoryValues).length > 0 && (
                  <div className="p-4 rounded-2xl bg-bg-base border border-border-base space-y-3">
                    <h3 className="text-xs font-bold text-brand-charcoal uppercase tracking-wider flex items-center gap-1.5 border-b border-border-base pb-2">
                      <Activity className="w-4 h-4 text-brand-primary" /> Captured Requirements & Template Fields
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-xs">
                      {Object.entries(selectedLeadDetails.categoryValues).map(([key, val]) => (
                        <div key={key} className="flex justify-between py-1 border-b border-border-base last:border-0 md:border-b md:border-border-base">
                          <span className="text-brand-gray font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                          <span className="text-brand-charcoal font-semibold max-w-[60%] truncate" title={renderSafeValue(val)}>
                            {val === true ? 'Yes' : val === false ? 'No' : renderSafeValue(val)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Section 4: Remarks / Description */}
                {(selectedLeadDetails.remarks || selectedLeadDetails.description) && (
                  <div className="p-4 rounded-2xl bg-bg-base border border-border-base space-y-2">
                    <h3 className="text-xs font-bold text-brand-charcoal uppercase tracking-wider flex items-center gap-1.5 border-b border-border-base pb-2">
                      <FileText className="w-4 h-4 text-brand-primary" /> Remarks & Internal Notes
                    </h3>
                    <p className="text-xs text-brand-gray whitespace-pre-wrap leading-relaxed">
                      {selectedLeadDetails.remarks || selectedLeadDetails.description}
                    </p>
                  </div>
                )}

                {/* Footer Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelectedLeadDetails(null)}
                    className="px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary text-xs font-extrabold text-brand-charcoal shadow-md shadow-brand-primary/20 transition-all duration-200"
                  >
                    Close
                  </button>
                </div>

              </div>
            )}

          </div>
        </div>,
        document.body
      )}

      {/* Category & Question Manager Modal for Company Admin / Super Admin */}
      <CategoryQuestionManagerModal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        onUpdated={fetchData}
      />
    </div>
  )
}
