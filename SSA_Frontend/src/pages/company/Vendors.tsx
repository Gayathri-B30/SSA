import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { initialVendors, type Vendor } from '../../data/mockData'
import { Plus, Check, X, Sparkles, Phone, Mail, Star } from 'lucide-react'

interface VendorsProps {
  defaultTab?: 'vendors' | 'contractors' | 'approvals'
}

interface VendorFormInputs {
  vendorName: string
  category: Vendor['category']
  contactPerson: string
  mobile: string
  email: string
  rating: number
}

export const Vendors: React.FC<VendorsProps> = ({ defaultTab = 'vendors' }) => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'vendors' | 'contractors' | 'approvals'>(defaultTab)

  useEffect(() => {
    setActiveTab(defaultTab)
  }, [defaultTab])
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors)
  const [isAddOpen, setIsAddOpen] = useState(false)

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<VendorFormInputs>({ mode: 'onChange' })

  // Toggle approval state
  const handleSetStatus = (id: string, status: Vendor['approvalStatus']) => {
    setVendors(prev =>
      prev.map(v => (v.id === id ? { ...v, approvalStatus: status } : v))
    )
  }

  // Submit new vendor
  const onSubmit = (data: VendorFormInputs) => {
    const newV: Vendor = {
      id: `VEN-${Math.floor(500 + Math.random() * 500)}`,
      vendorName: data.vendorName,
      category: data.category,
      contactPerson: data.contactPerson,
      mobile: data.mobile,
      email: data.email,
      approvalStatus: 'Pending Approval',
      rating: Number(data.rating),
    }
    setVendors([...vendors, newV])
    setIsAddOpen(false)
    reset()
  }

  // Delete vendor
  const deleteVendor = (id: string) => {
    if (confirm('Delete this vendor entity?')) {
      setVendors(vendors.filter(v => v.id !== id))
    }
  }

  const renderStars = (rating: number) => {
    const stars = []
    const floor = Math.floor(rating)
    for (let i = 1; i <= 5; i++) {
      if (i <= floor) {
        stars.push(<Star key={i} className="w-3 h-3 text-brand-primary fill-brand-primary flex-shrink-0" />)
      } else {
        stars.push(<Star key={i} className="w-3 h-3 text-gray-700 flex-shrink-0" />)
      }
    }
    return <div className="flex gap-0.5">{stars}</div>
  }

  // Filters based on tab
  const getFilteredData = () => {
    if (activeTab === 'contractors') {
      // Contractors category or status simulation
      return vendors.filter(v => v.category === 'BIM services' || v.category === 'HVAC Expert')
    }
    if (activeTab === 'approvals') {
      return vendors.filter(v => v.approvalStatus === 'Pending Approval')
    }
    return vendors
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-charcoal tracking-tight sm:text-3xl font-extrabold">Vendor Directory</h1>
          <p className="text-sm text-brand-gray mt-1 font-medium">Coordinate BIM partners, structural modeling suppliers, and specialty HVAC contractors.</p>
        </div>
        {activeTab === 'vendors' && (
          <button
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/95 text-xs font-bold text-white shadow-md shadow-brand-primary/10 transition-all duration-200 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Vendor
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => navigate('/vendors/list')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'vendors'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-brand-gray hover:text-brand-charcoal'
          }`}
        >
          All Vendors
        </button>
        <button
          onClick={() => navigate('/vendors/contractors')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'contractors'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-brand-gray hover:text-brand-charcoal'
          }`}
        >
          Contractors
        </button>
        <button
          onClick={() => navigate('/vendors/approvals')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'approvals'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-brand-gray hover:text-brand-charcoal'
          }`}
        >
          Approvals ({vendors.filter(v => v.approvalStatus === 'Pending Approval').length})
        </button>
      </div>

      {/* Vendors list grid */}
      <div className="glass-card rounded-2xl border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-brand-charcoal">
            <thead className="bg-slate-50 text-brand-gray uppercase tracking-wider">
              <tr className="border-b border-slate-200">
                <th className="p-4 font-semibold">Vendor ID</th>
                <th className="p-4 font-semibold">Vendor Name</th>
                <th className="p-4 font-semibold">Trade Category</th>
                <th className="p-4 font-semibold">Contact Person</th>
                <th className="p-4 font-semibold text-center">Quality Rating</th>
                <th className="p-4 font-semibold">Approval Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {getFilteredData().length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    No vendors found in this category.
                  </td>
                </tr>
              ) : (
                getFilteredData().map((v) => (
                  <tr key={v.id} className="hover:bg-white/10 transition-colors">
                    <td className="p-4 font-mono font-semibold text-brand-primary">{v.id}</td>
                    <td className="p-4">
                      <span className="font-bold text-brand-charcoal">{v.vendorName}</span>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex px-2 py-0.5 rounded text-[10px] bg-slate-100 text-brand-charcoal border border-slate-200/80">
                        {v.category}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="space-y-0.5 text-brand-gray">
                        <p className="text-brand-charcoal font-semibold">{v.contactPerson}</p>
                        <p className="flex items-center gap-1"><Phone className="w-3 h-3 text-brand-primary" /> {v.mobile}</p>
                        <p className="flex items-center gap-1"><Mail className="w-3 h-3 text-brand-primary" /> {v.email}</p>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="inline-flex flex-col items-center gap-1">
                        <span className="font-extrabold text-brand-charcoal text-[11px]">{v.rating} / 5.0</span>
                        {renderStars(v.rating)}
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          v.approvalStatus === 'Approved'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : v.approvalStatus === 'Pending Approval'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}
                      >
                        {v.approvalStatus}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {v.approvalStatus === 'Pending Approval' ? (
                          <>
                            <button
                              onClick={() => handleSetStatus(v.id, 'Approved')}
                              className="p-1 rounded bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-brand-charcoal transition-all cursor-pointer"
                              title="Approve Vendor"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleSetStatus(v.id, 'Rejected')}
                              className="p-1 rounded bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-brand-charcoal transition-all cursor-pointer"
                              title="Reject Vendor"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => deleteVendor(v.id)}
                            className="text-[10px] text-red-400 hover:text-red-300 font-semibold"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Vendor Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl p-6">
            <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-4">
              <h2 className="text-lg font-extrabold text-brand-charcoal flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-primary" /> Register Partner Vendor
              </h2>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1 rounded-lg text-brand-gray hover:text-brand-charcoal hover:bg-slate-100"
              >
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Vendor Name */}
              <div>
                <label className="block text-xs font-semibold text-brand-gray uppercase tracking-wider mb-2">Vendor/Firm Name</label>
                <input
                  type="text"
                  maxLength={100}
                  {...register('vendorName', {
                    required: 'Vendor name is required',
                    pattern: {
                      value: /^[a-zA-Z0-9]+[a-zA-Z0-9\s.'&()_-]*$/,
                      message: 'Name must start with an alphanumeric character and contain valid text'
                    },
                    onChange: (e) => {
                      const val = e.target.value.replace(/[^a-zA-Z0-9\s.'&()_-]/g, '')
                      e.target.value = val
                      setValue('vendorName', val, { shouldValidate: true })
                    }
                  })}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary/60 outline-none rounded-xl px-4 py-2.5 text-xs text-brand-charcoal"
                  placeholder="Apex BIM Solutions"
                />
                {errors.vendorName && <p className="text-red-500 text-[10px] mt-1">{errors.vendorName.message}</p>}
              </div>

              {/* Trade Category */}
              <div>
                <label className="block text-xs font-semibold text-brand-gray uppercase tracking-wider mb-2">Trade Specialty</label>
                <select
                  {...register('category', { required: true })}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary/60 outline-none rounded-xl px-4 py-2.5 text-xs text-brand-charcoal"
                >
                  <option value="BIM services">BIM services</option>
                  <option value="Structural Consultant">Structural Consultant</option>
                  <option value="MEP Consultant">MEP Consultant</option>
                  <option value="LIDAR Surveying">LIDAR Surveying</option>
                  <option value="HVAC Expert">HVAC Expert</option>
                  <option value="Geotechnical Survey">Geotechnical Survey</option>
                  <option value="Landscape consultant">Landscape consultant</option>
                </select>
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
                  placeholder="Mr. Arvind Swamy"
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
                    required: 'Mobile is required',
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
                  placeholder="arvind@apexbim.com"
                />
                {errors.email && <p className="text-red-500 text-[10px] mt-1">{errors.email.message}</p>}
              </div>

              {/* Rating */}
              <div>
                <label className="block text-xs font-semibold text-brand-gray uppercase tracking-wider mb-2">Initial Rating (1 - 5)</label>
                <input
                  type="number"
                  step="0.1"
                  {...register('rating', { 
                    required: 'Rating is required', 
                    min: { value: 1, message: 'Rating must be at least 1.0' }, 
                    max: { value: 5, message: 'Rating cannot exceed 5.0' } 
                  })}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary/60 outline-none rounded-xl px-4 py-2.5 text-xs text-brand-charcoal"
                  defaultValue={4.0}
                />
                {errors.rating && <p className="text-red-500 text-[10px] mt-1">{errors.rating.message}</p>}
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
                  Register Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
