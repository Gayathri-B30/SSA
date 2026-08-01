import React from 'react'
import { Search, Plus, Building2, Pencil, Trash2 } from 'lucide-react'

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

interface CompanyTableProps {
  filteredCompanies: Company[]
  searchQuery: string
  onSearchChange: (query: string) => void
  onAddClick: () => void
  onEditClick: (company: Company) => void
  onDeleteClick: (id: string) => void
}

export const CompanyTable: React.FC<CompanyTableProps> = ({
  filteredCompanies,
  searchQuery,
  onSearchChange,
  onAddClick,
  onEditClick,
  onDeleteClick,
}) => {
  return (
    <div className="space-y-4">
      {/* Company Control Panel Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-border-base shadow-sm shrink-0">
        <div className="relative flex items-center w-full sm:w-80">
          <span className="absolute left-3.5 text-zinc-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search companies by name..."
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-border-base rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary/10 focus:border-brand-primary transition-all"
          />
        </div>

        <button
          onClick={onAddClick}
          className="px-5 py-2.5 bg-brand-primary hover:bg-primary-600 text-white text-xs font-black tracking-wider uppercase rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add New Company
        </button>
      </div>

      {/* Company List Table with Edit and Delete options */}
      <div className="glass-card rounded-2xl border border-slate-200 overflow-hidden shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs text-brand-charcoal min-w-[800px]">
          <thead className="bg-slate-50 text-brand-gray uppercase tracking-wider">
            <tr className="border-b border-slate-200 text-[10px] font-black uppercase tracking-wider">
              <th className="py-4 px-6">Company Name</th>
              <th className="py-4 px-6">Contact Person</th>
              <th className="py-4 px-6">Status</th>
              <th className="py-4 px-6">Joined On</th>
              <th className="py-4 px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredCompanies.length > 0 ? (
              filteredCompanies.map((company) => (
                <tr key={company.id} className="transition-colors">
                  {/* Name with circular red logo */}
                  <td className="py-3.5 px-6 font-extrabold text-zinc-800">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-brand-primary flex items-center justify-center shrink-0 shadow-inner">
                        <Building2 className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-sm font-extrabold">{company.name}</span>
                    </div>
                  </td>

                  {/* Contact Person & Designation */}
                  <td className="py-3.5 px-6">
                    <div className="font-extrabold text-zinc-800">{company.contactPerson}</div>
                    {company.designation && (
                      <div className="text-[10px] text-zinc-400 font-bold mt-0.5">{company.designation}</div>
                    )}
                  </td>

                  {/* Status badge */}
                  <td className="py-3.5 px-6">
                    <span className={`px-2.5 py-0.5 rounded-full font-black text-[9px] uppercase tracking-wide inline-block ${
                      company.status === 'Active' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {company.status}
                    </span>
                  </td>

                  {/* Joined Date */}
                  <td className="py-3.5 px-6 text-zinc-400 font-bold">
                    {company.joinedDate}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-6 text-center whitespace-nowrap space-x-2.5">
                    <button
                      onClick={() => onEditClick(company)}
                      className="p-2 text-zinc-500 hover:text-zinc-950 bg-white hover:bg-zinc-50 border border-slate-200 rounded-lg transition-all cursor-pointer inline-flex items-center justify-center"
                      title="Edit Company"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteClick(company.id)}
                      className="p-2 text-red-700 hover:text-red-900 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-all cursor-pointer inline-flex items-center justify-center"
                      title="Delete Company"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-12 text-center text-zinc-400 font-bold uppercase tracking-wider">
                  No companies match your search parameters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
