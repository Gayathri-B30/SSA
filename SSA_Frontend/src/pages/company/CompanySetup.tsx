import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { initialCompanies, type CompanySetup as CompanyType } from '../../data/mockData'
import { Plus, Edit2, Trash2, Mail, Phone, Globe, MapPin, Hash, Sparkles } from 'lucide-react'
import api from '../../services/api'

interface CompanySetupProps {
  defaultTab?: 'companies' | 'departments' | 'branches'
}

interface CompanyFormInputs {
  name: string
  legalEntity: string
  gstNumber: string
  panNumber: string
  address: string
  city: string
  state: string
  country: string
  phone: string
  email: string
  website: string
}

interface Branch {
  id: string
  name: string
  code: string
  manager: string
  address: string
  phone: string
}

interface BranchFormInputs {
  name: string
  code: string
  manager: string
  phone: string
  address: string
  password?: string
}

export const CompanySetup: React.FC<CompanySetupProps> = ({ defaultTab = 'companies' }) => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'companies' | 'departments' | 'branches'>(defaultTab)

  useEffect(() => {
    setActiveTab(defaultTab)
  }, [defaultTab])
  const [companies, setCompanies] = useState<CompanyType[]>(initialCompanies)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState<CompanyType | null>(null)

  // Sub-items mock data
  const departments = [
    { id: 'dept-1', name: 'Executive Office', code: 'EXEC', head: 'Sundar Sundram', count: 4 },
    { id: 'dept-2', name: 'Studio A (Commercial)', code: 'ST-A', head: 'Rajeev Mehta', count: 32 },
    { id: 'dept-3', name: 'Studio B (Residential)', code: 'ST-B', head: 'Vikram Malhotra', count: 28 },
    { id: 'dept-4', name: 'Structural Engineering', code: 'STR', head: 'Priya Ranganathan', count: 18 },
    { id: 'dept-5', name: 'MEP Services', code: 'MEP', head: 'Rahul Sharma', count: 12 },
    { id: 'dept-6', name: 'BIM & Rendering', code: 'BIM', head: 'Siddharth Sen', count: 24 },
  ]

  const [branches, setBranches] = useState<Branch[]>([])
  const [loadingBranches, setLoadingBranches] = useState(false)
  const [branchError, setBranchError] = useState<string | null>(null)

  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false)
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null)

  const fetchBranches = async () => {
    setLoadingBranches(true)
    setBranchError(null)
    try {
      const response = await api.get('/branches')
      const mapped = response.data.map((b: any) => ({
        id: b.branchId,
        name: b.name,
        code: b.code,
        manager: b.manager,
        address: b.address,
        phone: b.phone
      }))
      setBranches(mapped)
    } catch (err: any) {
      console.error('Failed to fetch branches:', err)
      setBranchError(err.response?.data?.message || 'Failed to load branches.')
    } finally {
      setLoadingBranches(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'branches') {
      fetchBranches()
    }
  }, [activeTab])

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<CompanyFormInputs>({ mode: 'onChange' })

  const {
    register: registerBranch,
    handleSubmit: handleBranchSubmit,
    reset: resetBranch,
    setValue: setBranchValue,
    formState: { errors: branchErrors },
  } = useForm<BranchFormInputs>({ mode: 'onChange' })

  const openAddBranchModal = () => {
    setEditingBranch(null)
    resetBranch({
      name: '',
      code: '',
      manager: '',
      phone: '',
      address: '',
      password: '',
    })
    setIsBranchModalOpen(true)
  }

  const openEditBranchModal = (branch: Branch) => {
    setEditingBranch(branch)
    setBranchValue('name', branch.name)
    setBranchValue('code', branch.code)
    setBranchValue('manager', branch.manager)
    setBranchValue('phone', branch.phone)
    setBranchValue('address', branch.address)
    setBranchValue('password', '')
    setIsBranchModalOpen(true)
  }

  const deleteBranch = async (id: string) => {
    if (confirm('Are you sure you want to delete this branch/division?')) {
      try {
        await api.delete(`/branches?branchId=${id}`)
        setBranches(branches.filter((b) => b.id !== id))
      } catch (err: any) {
        console.error('Failed to delete branch:', err)
        alert(err.response?.data?.message || 'Failed to delete branch.')
      }
    }
  }

  const onBranchSubmit = async (data: BranchFormInputs) => {
    try {
      if (editingBranch) {
        const response = await api.put('/branches', {
          branchId: editingBranch.id,
          ...data
        })
        const updated = {
          id: response.data.branchId,
          name: response.data.name,
          code: response.data.code,
          manager: response.data.manager,
          address: response.data.address,
          phone: response.data.phone
        }
        setBranches(branches.map((b) => (b.id === editingBranch.id ? updated : b)))
      } else {
        const response = await api.post('/branches', data)
        const newBranch = {
          id: response.data.branchId,
          name: response.data.name,
          code: response.data.code,
          manager: response.data.manager,
          address: response.data.address,
          phone: response.data.phone
        }
        setBranches([...branches, newBranch])
      }
      setIsBranchModalOpen(false)
      resetBranch()
    } catch (err: any) {
      console.error('Failed to save branch:', err)
      alert(err.response?.data?.message || 'Failed to save branch/division.')
    }
  }

  // Handle Edit click
  const openEditModal = (company: CompanyType) => {
    setEditingCompany(company)
    setValue('name', company.name)
    setValue('legalEntity', company.legalEntity)
    setValue('gstNumber', company.gstNumber)
    setValue('panNumber', company.panNumber)
    setValue('address', company.address)
    setValue('city', company.city)
    setValue('state', company.state)
    setValue('country', company.country)
    setValue('phone', company.phone)
    setValue('email', company.email)
    setValue('website', company.website)
    setIsModalOpen(true)
  }

  // Handle Add click
  const openAddModal = () => {
    setEditingCompany(null)
    reset({
      name: '',
      legalEntity: 'Private Limited Company',
      gstNumber: '',
      panNumber: '',
      address: '',
      city: '',
      state: '',
      country: '',
      phone: '',
      email: '',
      website: '',
    })
    setIsModalOpen(true)
  }

  // Delete company handler
  const deleteCompany = (id: string) => {
    if (confirm('Are you sure you want to delete this company entity?')) {
      setCompanies(companies.filter(c => c.id !== id))
    }
  }

  // Submit Handler
  const onSubmit = (data: CompanyFormInputs) => {
    if (editingCompany) {
      // Edit mode
      setCompanies(companies.map(c => c.id === editingCompany.id ? { ...c, ...data } : c))
    } else {
      // Create mode
      const newCompany: CompanyType = {
        id: `comp-${Math.floor(100 + Math.random() * 900)}`,
        ...data
      }
      setCompanies([...companies, newCompany])
    }
    setIsModalOpen(false)
    reset()
  }

  return (
    <div className="space-y-6 animate-fade-in text-brand-charcoal">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-charcoal tracking-tight sm:text-3xl font-sans">Organization Setup</h1>
          <p className="text-xs sm:text-sm text-brand-gray mt-1 font-medium">Configure legal entities, structural departments, and operational branches / divisions.</p>
        </div>
        {activeTab === 'companies' && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/95 text-xs font-bold text-white shadow-md shadow-brand-primary/10 transition-all duration-200 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Entity
          </button>
        )}
        {activeTab === 'branches' && (
          <button
            onClick={openAddBranchModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/95 text-xs font-bold text-white shadow-md shadow-brand-primary/10 transition-all duration-200 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Branch / Division
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        {/* <button
          onClick={() => navigate('/organization/company-setup')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === 'companies'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-brand-gray hover:text-brand-charcoal'
          }`}
        >
          Company Setup
        </button> */}
        {/* <button
          onClick={() => navigate('/organization/departments')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === 'departments'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-brand-gray hover:text-brand-charcoal'
          }`}
        >
          Departments
        </button> */}
        <button
          onClick={() => navigate('/organization/branches')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${activeTab === 'branches'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-brand-gray hover:text-brand-charcoal'
            }`}
        >
          Branch / Division
        </button>
      </div>

      {/* 1. Companies Tab */}
      {activeTab === 'companies' && (
        <div className="grid grid-cols-1 gap-6">
          {companies.map((company) => (
            <div
              key={company.id}
              className="glass-card p-6 rounded-3xl border border-slate-200/80 hover:border-brand-primary/30 transition-all duration-300 relative overflow-hidden group bg-white shadow-sm"
            >
              {/* Glowing decorative border */}
              <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-brand-primary to-brand-gold" />

              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="space-y-4 flex-1">
                  <div>
                    <span className="text-[10px] font-bold bg-primary-50 text-brand-primary border border-primary-200/50 px-2.5 py-1 rounded-md uppercase">
                      {company.legalEntity}
                    </span>
                    <h3 className="text-xl font-extrabold text-brand-charcoal mt-3 group-hover:text-brand-primary transition-colors">
                      {company.name}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-6 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-brand-gold" />
                      <span>GST: <strong className="text-brand-charcoal">{company.gstNumber}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-brand-gold" />
                      <span>PAN: <strong className="text-brand-charcoal">{company.panNumber}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-brand-gold" />
                      <span className="truncate">{company.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-brand-gold" />
                      <span>{company.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-brand-gold" />
                      <a href={company.website} target="_blank" rel="noreferrer" className="hover:text-brand-primary font-medium transition-colors truncate">
                        {company.website}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-brand-gold" />
                      <span className="truncate">{company.address}, {company.city}, {company.state}, {company.country}</span>
                    </div>
                  </div>
                </div>

                {/* Edit & Delete Action Panel */}
                <div className="flex items-center gap-2 lg:self-start">
                  <button
                    onClick={() => openEditModal(company)}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:text-brand-primary hover:border-brand-primary/40 hover:bg-slate-100 transition-all cursor-pointer shadow-sm"
                    title="Edit Entity"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteCompany(company.id)}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-red-600 hover:text-brand-charcoal hover:bg-red-700 hover:border-red-700 transition-all cursor-pointer shadow-sm"
                    title="Delete Entity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. Departments Tab */}
      {activeTab === 'departments' && (
        <div className="glass-card rounded-2xl border border-slate-200/80 overflow-hidden bg-white shadow-sm">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-sm font-bold text-brand-charcoal uppercase tracking-wider">Operational Departments</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-brand-charcoal">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200/60 font-bold">
                <tr>
                  <th className="p-4">Code</th>
                  <th className="p-4">Department Name</th>
                  <th className="p-4">Head of Dept</th>
                  <th className="p-4">FTE Count</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {departments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-brand-primary">{dept.code}</td>
                    <td className="p-4 font-semibold text-brand-charcoal">{dept.name}</td>
                    <td className="p-4 text-slate-600 font-medium">{dept.head}</td>
                    <td className="p-4 font-bold text-brand-gold">{dept.count} Members</td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1 h-1 rounded-full bg-emerald-600" /> Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Branches Tab */}
      {activeTab === 'branches' && (
        <div className="w-full">
          {loadingBranches ? (
            <div className="py-12 flex flex-col justify-center items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Loading Branches...</span>
            </div>
          ) : branchError ? (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700 uppercase tracking-wider">
              {branchError}
            </div>
          ) : branches.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">No branches registered yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {branches.map((branch) => (
                <div key={branch.id} className="glass-card p-5 rounded-2xl border border-slate-200/80 hover:border-brand-primary/20 transition-all duration-300 bg-white shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-mono text-xs font-bold text-brand-primary bg-primary-50 px-2 py-0.5 rounded-md border border-primary-100">
                        {branch.code}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEditBranchModal(branch)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-brand-primary hover:bg-slate-50 transition-colors cursor-pointer"
                          title="Edit Branch"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteBranch(branch.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-50 transition-colors cursor-pointer"
                          title="Delete Branch"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <h3 className="text-base font-bold text-brand-charcoal mb-2">{branch.name}</h3>
                    <p className="text-xs text-brand-gray mb-4 leading-relaxed h-10 overflow-hidden">
                      {branch.address}
                    </p>
                  </div>
                  <div className="border-t border-slate-100 pt-3 text-xs text-slate-500 space-y-1.5 font-medium">
                    <p>Manager: <strong className="text-brand-charcoal">{branch.manager}</strong></p>
                    <p>Tel: <span className="text-brand-charcoal">{branch.phone}</span></p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CRUD Edit/Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-20 md:pt-24 pb-8 bg-slate-50/40 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative my-auto w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 text-brand-charcoal">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
              <h2 className="text-base font-extrabold text-brand-charcoal flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-primary" />
                {editingCompany ? 'Modify Legal Entity' : 'Register New Company'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 bg-transparent cursor-pointer outline-none focus:outline-none"
              >
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Company Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Company Name</label>
                  <input
                    type="text"
                    maxLength={100}
                    {...register('name', {
                      required: 'Company Name is required',
                      pattern: {
                        value: /^[a-zA-Z0-9]+[a-zA-Z0-9\s.'&()_-]*$/,
                        message: 'Name must start with an alphanumeric character and contain valid text'
                      },
                      onChange: (e) => {
                        const val = e.target.value.replace(/[^a-zA-Z0-9\s.'&()_-]/g, '')
                        e.target.value = val
                        setValue('name', val, { shouldValidate: true })
                      }
                    })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 outline-none rounded-xl px-4 py-2.5 text-xs text-slate-800"
                    placeholder="Sundar Architects"
                  />
                  {errors.name && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.name.message}</p>}
                </div>

                {/* Legal Entity Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Legal Entity Type</label>
                  <select
                    {...register('legalEntity', { required: true })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary outline-none rounded-xl px-4 py-2.5 text-xs text-slate-800 cursor-pointer"
                  >
                    <option value="Sole Proprietorship">Sole Proprietorship</option>
                    <option value="Partnership Firm">Partnership Firm</option>
                    <option value="Limited Liability Partnership">Limited Liability Partnership</option>
                    <option value="Private Limited Company">Private Limited Company</option>
                    <option value="Public Limited Company">Public Limited Company</option>
                  </select>
                </div>

                {/* GST Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">GSTIN Number</label>
                  <input
                    type="text"
                    {...register('gstNumber', {
                      required: 'GSTIN is required',
                      pattern: {
                        value: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
                        message: 'Invalid GSTIN format (e.g. 33AABCS1234D1Z2)'
                      }
                    })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 outline-none rounded-xl px-4 py-2.5 text-xs text-slate-800"
                    placeholder="33AABCS1234D1Z2"
                  />
                  {errors.gstNumber && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.gstNumber.message}</p>}
                </div>

                {/* PAN Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">PAN Card Number</label>
                  <input
                    type="text"
                    {...register('panNumber', {
                      required: 'PAN is required',
                      pattern: {
                        value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
                        message: 'Invalid PAN format (e.g. AABCS1234D)'
                      }
                    })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 outline-none rounded-xl px-4 py-2.5 text-xs text-slate-800"
                    placeholder="AABCS1234D"
                  />
                  {errors.panNumber && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.panNumber.message}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Mobile Phone</label>
                  <input
                    type="tel"
                    maxLength={10}
                    {...register('phone', {
                      required: 'Mobile phone is required',
                      pattern: {
                        value: /^[6-9]\d{9}$/,
                        message: 'Enter a valid 10-digit mobile number'
                      },
                      onChange: (e) => {
                        const val = e.target.value.substring(0, 10).replace(/\D/g, '')
                        e.target.value = val
                        setValue('phone', val, { shouldValidate: true })
                      }
                    })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 outline-none rounded-xl px-4 py-2.5 text-xs text-slate-800"
                    placeholder="9876543210"
                  />
                  {errors.phone && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.phone.message}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                  <input
                    type="email"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Enter a valid email address'
                      }
                    })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 outline-none rounded-xl px-4 py-2.5 text-xs text-slate-800"
                    placeholder="contact@sundaramarchitects.com"
                  />
                  {errors.email && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.email.message}</p>}
                </div>

                {/* Website */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Website URL</label>
                  <input
                    type="text"
                    {...register('website', { required: 'Website is required' })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 outline-none rounded-xl px-4 py-2.5 text-xs text-slate-800"
                    placeholder="https://sundaramarchitects.com"
                  />
                  {errors.website && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.website.message}</p>}
                </div>

                {/* City */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">City</label>
                  <input
                    type="text"
                    {...register('city', { required: 'City is required' })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 outline-none rounded-xl px-4 py-2.5 text-xs text-slate-800"
                    placeholder="Chennai"
                  />
                  {errors.city && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.city.message}</p>}
                </div>

                {/* State */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">State / Province</label>
                  <input
                    type="text"
                    {...register('state', { required: 'State is required' })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 outline-none rounded-xl px-4 py-2.5 text-xs text-slate-800"
                    placeholder="Tamil Nadu"
                  />
                  {errors.state && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.state.message}</p>}
                </div>

                {/* Country */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Country</label>
                  <input
                    type="text"
                    {...register('country', { required: 'Country is required' })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 outline-none rounded-xl px-4 py-2.5 text-xs text-slate-800"
                    placeholder="India"
                  />
                  {errors.country && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.country.message}</p>}
                </div>
              </div>

              {/* Full Address */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Office Address</label>
                <textarea
                  rows={2}
                  {...register('address', { required: 'Address is required' })}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 outline-none rounded-xl px-4 py-2.5 text-xs text-slate-800 resize-none"
                  placeholder="Suite 402, Pinnacle Towers, OMR Road"
                />
                {errors.address && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.address.message}</p>}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/95 text-xs font-bold text-white shadow-md shadow-brand-primary/10 transition-colors cursor-pointer"
                >
                  {editingCompany ? 'Save Changes' : 'Register Entity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Branch Modal */}
      {isBranchModalOpen && (
        <div 
          onClick={() => setIsBranchModalOpen(false)}
          className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-20 md:pt-24 pb-8 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative my-auto w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 text-brand-charcoal"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
              <h2 className="text-base font-extrabold text-brand-charcoal flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-primary" />
                {editingBranch ? 'Modify Branch / Division' : 'Register New Branch / Division'}
              </h2>
              <button
                onClick={() => setIsBranchModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 bg-transparent cursor-pointer outline-none focus:outline-none"
              >
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleBranchSubmit(onBranchSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Branch Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Branch / Division Name</label>
                  <input
                    type="text"
                    maxLength={100}
                    {...registerBranch('name', {
                      required: 'Name is required',
                      pattern: {
                        value: /^[a-zA-Z0-9]+[a-zA-Z0-9\s.'&()_-]*$/,
                        message: 'Name must start with an alphanumeric character and contain valid text'
                      },
                      onChange: (e) => {
                        const val = e.target.value.replace(/[^a-zA-Z0-9\s.'&()_-]/g, '')
                        e.target.value = val
                        setBranchValue('name', val, { shouldValidate: true })
                      }
                    })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 outline-none rounded-xl px-4 py-2.5 text-xs text-slate-800"
                    placeholder="Bangalore Studio"
                  />
                  {branchErrors.name && <p className="text-red-500 text-[10px] mt-1 font-semibold">{branchErrors.name.message}</p>}
                </div>

                {/* Branch Code */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    {...registerBranch('code', {
                      required: 'Code is required',
                      pattern: {
                        value: /^[A-Z0-9]{2,6}$/,
                        message: 'Invalid format (2-6 uppercase alphanumeric chars)'
                      },
                      onChange: (e) => {
                        const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
                        e.target.value = val
                        setBranchValue('code', val, { shouldValidate: true })
                      }
                    })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 outline-none rounded-xl px-4 py-2.5 text-xs text-slate-800"
                    placeholder="BLR"
                  />
                  {branchErrors.code && <p className="text-red-500 text-[10px] mt-1 font-semibold">{branchErrors.code.message}</p>}
                </div>

                {/* Manager Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Branch Manager</label>
                  <input
                    type="text"
                    maxLength={50}
                    {...registerBranch('manager', {
                      required: 'Manager name is required',
                      pattern: {
                        value: /^[a-zA-Z]+[a-zA-Z\s.'-]*$/,
                        message: 'Name must start with a letter and contain only alphabets/spaces/dots'
                      },
                      onChange: (e) => {
                        const val = e.target.value.replace(/[^a-zA-Z\s.'-]/g, '')
                        e.target.value = val
                        setBranchValue('manager', val, { shouldValidate: true })
                      }
                    })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 outline-none rounded-xl px-4 py-2.5 text-xs text-slate-800"
                    placeholder="Rajeev Mehta"
                  />
                  {branchErrors.manager && <p className="text-red-500 text-[10px] mt-1 font-semibold">{branchErrors.manager.message}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Mobile Phone</label>
                  <input
                    type="tel"
                    maxLength={10}
                    {...registerBranch('phone', {
                      required: 'Mobile phone is required',
                      pattern: {
                        value: /^[6-9]\d{9}$/,
                        message: 'Enter a valid 10-digit mobile number'
                      },
                      onChange: (e) => {
                        const val = e.target.value.substring(0, 10).replace(/\D/g, '')
                        e.target.value = val
                        setBranchValue('phone', val, { shouldValidate: true })
                      }
                    })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 outline-none rounded-xl px-4 py-2.5 text-xs text-slate-800"
                    placeholder="9876543210"
                  />
                  {branchErrors.phone && <p className="text-red-500 text-[10px] mt-1 font-semibold">{branchErrors.phone.message}</p>}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Password</label>
                  <input
                    type="password"
                    maxLength={25}
                    {...registerBranch('password', {
                      required: editingBranch ? false : 'Password is required',
                      validate: (value) => {
                        if (!value && editingBranch) return true
                        if (!value) return 'Password is required'
                        if (value.length < 8) return 'Password must be at least 8 characters'
                        if (value.length > 25) return 'Password cannot exceed 25 characters'
                        if (!/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter'
                        if (!/[a-z]/.test(value)) return 'Password must contain at least one lowercase letter'
                        if (!/[0-9]/.test(value)) return 'Password must contain at least one number'
                        if (!/[^A-Za-z0-9]/.test(value)) return 'Password must contain at least one special character (!@#$...)'
                        return true
                      }
                    })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 outline-none rounded-xl px-4 py-2.5 text-xs text-slate-800"
                    placeholder={editingBranch ? 'Leave empty to keep current password' : '••••••'}
                  />
                  {branchErrors.password && <p className="text-red-500 text-[10px] mt-1 font-semibold">{branchErrors.password.message}</p>}
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Address</label>
                <textarea
                  rows={2}
                  {...registerBranch('address', { required: 'Address is required' })}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 outline-none rounded-xl px-4 py-2.5 text-xs text-slate-800 resize-none"
                  placeholder="Floor 3, Brigade Chambers, Indiranagar"
                />
                {branchErrors.address && <p className="text-red-500 text-[10px] mt-1 font-semibold">{branchErrors.address.message}</p>}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBranchModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/95 text-xs font-bold text-white shadow-md shadow-brand-primary/10 transition-colors cursor-pointer"
                >
                  {editingBranch ? 'Save Changes' : 'Register Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
