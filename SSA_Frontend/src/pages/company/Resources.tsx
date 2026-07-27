import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { initialAllocations, type ResourceAllocation } from '../../data/mockData'
import { Plus, Sparkles, Clock, AlertTriangle, ShieldCheck } from 'lucide-react'

interface AllocationFormInputs {
  employeeName: string
  projectId: string
  projectName: string
  allocationPercentage: number
  weeklyHours: number
  budgetAllocation: number
}

export const Resources: React.FC = () => {
  const [allocations, setAllocations] = useState<ResourceAllocation[]>(initialAllocations)
  const [isAddOpen, setIsAddOpen] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AllocationFormInputs>()

  // Handle Form Submission
  const onSubmit = (data: AllocationFormInputs) => {
    const projectMappings: Record<string, string> = {
      'PRJ-101': 'GR Heights IT Tech Park',
      'PRJ-102': 'Fortis Oncology Wing expansion',
      'PRJ-103': 'Zoya Office Complex',
    }

    const newAlloc: ResourceAllocation = {
      id: `AL-${Math.floor(200 + Math.random() * 800)}`,
      employeeId: `EMP-${Math.floor(100 + Math.random() * 900)}`,
      employeeName: data.employeeName,
      designation: 'Architect',
      projectId: data.projectId,
      projectName: projectMappings[data.projectId] || data.projectName,
      allocationPercentage: Number(data.allocationPercentage),
      weeklyHours: Number(data.weeklyHours),
      budgetAllocation: Number(data.budgetAllocation),
    }

    setAllocations([...allocations, newAlloc])
    setIsAddOpen(false)
    reset()
  }

  // Delete allocation
  const deleteAllocation = (id: string) => {
    if (confirm('Are you sure you want to remove this resource allocation?')) {
      setAllocations(allocations.filter(al => al.id !== id))
    }
  }

  // Calculate stats
  const totalAllocatedHours = allocations.reduce((sum, item) => sum + item.weeklyHours, 0)
  const avgAllocationPercentage = allocations.length
    ? Math.round(allocations.reduce((sum, item) => sum + item.allocationPercentage, 0) / allocations.length)
    : 0

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-charcoal tracking-tight sm:text-3xl font-extrabold">Resource Allocation</h1>
          <p className="text-sm text-brand-gray mt-1 font-medium">Coordinate drafting staff, track weekly hours, and optimize employee workloads across project contracts.</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/95 text-xs font-bold text-white shadow-md shadow-brand-primary/10 transition-all duration-200 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Allocate Resource
        </button>
      </div>

      {/* Allocation widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-5 rounded-2xl border border-slate-200/80">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-brand-gray uppercase tracking-wider">Total Allocated Hours</span>
            <Clock className="w-4.5 h-4.5 text-brand-primary" />
          </div>
          <p className="text-2xl font-black text-brand-charcoal mt-2">{totalAllocatedHours} hrs / week</p>
          <p className="text-[10px] text-gray-500 mt-1">Across all design teams</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-200/80">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-brand-gray uppercase tracking-wider">Average Load Factor</span>
            <ShieldCheck className="w-4.5 h-4.5 text-brand-primary" />
          </div>
          <p className="text-2xl font-black text-brand-charcoal mt-2">{avgAllocationPercentage}%</p>
          <p className="text-[10px] text-gray-500 mt-1">Target workload: 80%</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-200/80">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-brand-gray uppercase tracking-wider">Resource Conflicts</span>
            <AlertTriangle className="w-4.5 h-4.5 text-brand-primary" />
          </div>
          <p className="text-2xl font-black text-brand-primary mt-2">
            {allocations.filter((a) => a.allocationPercentage > 100).length} Overloads
          </p>
          <p className="text-[10px] text-gray-500 mt-1">Requires immediate leveling</p>
        </div>
      </div>

      {/* Scheduler Data Table */}
      <div className="glass-card rounded-2xl border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-brand-charcoal">
            <thead className="bg-slate-50 text-brand-gray uppercase tracking-wider">
              <tr className="border-b border-slate-200">
                <th className="p-4 font-semibold">Allocation ID</th>
                <th className="p-4 font-semibold">Employee / Role</th>
                <th className="p-4 font-semibold">Project Assigned</th>
                <th className="p-4 font-semibold text-center">Allocated Load</th>
                <th className="p-4 font-semibold text-center">Weekly Hours</th>
                <th className="p-4 font-semibold">Budget Assigned</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allocations.map((alloc) => {
                const isOverload = alloc.allocationPercentage > 100 || alloc.weeklyHours > 40
                return (
                  <tr key={alloc.id} className="hover:bg-white/10 transition-colors">
                    <td className="p-4 font-mono font-semibold text-brand-primary">{alloc.id}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-slate-800 text-brand-primary border border-brand-primary/20 flex items-center justify-center font-bold">
                          {alloc.employeeName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-brand-charcoal">{alloc.employeeName}</p>
                          <p className="text-[9px] text-gray-500 uppercase">{alloc.designation}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-0.5">
                        <p className="text-brand-charcoal font-semibold truncate max-w-xs">{alloc.projectName}</p>
                        <p className="text-[9px] text-gray-500 font-mono">{alloc.projectId}</p>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded font-bold ${
                        isOverload
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse'
                          : 'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {alloc.allocationPercentage}%
                      </span>
                    </td>
                    <td className="p-4 text-center font-extrabold text-brand-charcoal">{alloc.weeklyHours} Hrs</td>
                    <td className="p-4 font-mono font-extrabold text-brand-charcoal">
                      ₹{(alloc.budgetAllocation / 1000).toFixed(0)}K
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => deleteAllocation(alloc.id)}
                        className="text-[10px] text-red-400 hover:text-red-300 font-semibold"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Allocation Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl p-6">
            <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-4">
              <h2 className="text-lg font-extrabold text-brand-charcoal flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-primary" /> Schedule Resource Allocation
              </h2>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1 rounded-lg text-brand-gray hover:text-brand-charcoal hover:bg-slate-100"
              >
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Employee */}
              <div>
                <label className="block text-xs font-semibold text-brand-gray uppercase tracking-wider mb-2">Employee Name</label>
                <input
                  type="text"
                  {...register('employeeName', { required: 'Name is required' })}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary/60 outline-none rounded-xl px-4 py-2.5 text-xs text-brand-charcoal"
                  placeholder="e.g. Siddharth Sen"
                />
                {errors.employeeName && <p className="text-red-500 text-[10px] mt-1">{errors.employeeName.message}</p>}
              </div>

              {/* Project ID */}
              <div>
                <label className="block text-xs font-semibold text-brand-gray uppercase tracking-wider mb-2">Assign Project</label>
                <select
                  {...register('projectId', { required: true })}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary/60 outline-none rounded-xl px-4 py-2.5 text-xs text-brand-charcoal"
                >
                  <option value="PRJ-101">GR Heights IT Tech Park (PRJ-101)</option>
                  <option value="PRJ-102">Fortis Oncology Wing (PRJ-102)</option>
                  <option value="PRJ-103">Zoya Office Complex (PRJ-103)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Allocation % */}
                <div>
                  <label className="block text-xs font-semibold text-brand-gray uppercase tracking-wider mb-2">Allocation Load (%)</label>
                  <input
                    type="number"
                    {...register('allocationPercentage', { required: 'Load is required', min: 1, max: 150 })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary/60 outline-none rounded-xl px-4 py-2.5 text-xs text-brand-charcoal"
                    placeholder="100"
                  />
                  {errors.allocationPercentage && <p className="text-red-500 text-[10px] mt-1">{errors.allocationPercentage.message}</p>}
                </div>

                {/* Weekly Hours */}
                <div>
                  <label className="block text-xs font-semibold text-brand-gray uppercase tracking-wider mb-2">Weekly Hours</label>
                  <input
                    type="number"
                    {...register('weeklyHours', { required: 'Hours is required', min: 1, max: 60 })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary/60 outline-none rounded-xl px-4 py-2.5 text-xs text-brand-charcoal"
                    placeholder="40"
                  />
                  {errors.weeklyHours && <p className="text-red-500 text-[10px] mt-1">{errors.weeklyHours.message}</p>}
                </div>
              </div>

              {/* Budget Allocation */}
              <div>
                <label className="block text-xs font-semibold text-brand-gray uppercase tracking-wider mb-2">Budget Allocation (INR ₹)</label>
                <input
                  type="number"
                  {...register('budgetAllocation', { required: 'Budget is required', min: 1000 })}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary/60 outline-none rounded-xl px-4 py-2.5 text-xs text-brand-charcoal"
                  placeholder="200000"
                />
                {errors.budgetAllocation && <p className="text-red-500 text-[10px] mt-1">{errors.budgetAllocation.message}</p>}
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
                  Confirm Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
