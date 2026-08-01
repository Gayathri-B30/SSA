import React from 'react'
import { Building2, Users, Calendar } from 'lucide-react'

interface StatsCardsProps {
  totalCompaniesCount: number
  activeCompaniesCount: number
  totalUsersCount: number
  recentlyAddedCount: number
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  totalCompaniesCount,
  activeCompaniesCount,
  totalUsersCount,
  recentlyAddedCount,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 shrink-0">
      {/* Total Companies */}
      <div className="bg-white rounded-2xl border border-border-base p-5 hover:border-brand-primary/30 transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden shadow-sm flex items-center gap-4">
        {/* Hover accent bar */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-brand-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
        
        <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center shrink-0 group-hover:bg-brand-primary transition-colors duration-300">
          <Building2 className="w-6 h-6 text-brand-primary group-hover:text-white transition-colors duration-300" />
        </div>
        <div className="text-left">
          <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Total Companies</p>
          <h3 className="text-2xl font-black text-zinc-800 leading-none my-1 group-hover:text-brand-primary transition-colors duration-300">{totalCompaniesCount}</h3>
          <p className="text-[10px] text-zinc-400 font-bold">All Registered Companies</p>
        </div>
      </div>

      {/* Active Companies */}
      <div className="bg-white rounded-2xl border border-border-base p-5 hover:border-brand-primary/30 transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden shadow-sm flex items-center gap-4">
        {/* Hover accent bar */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-brand-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />

        <div className="w-12 h-12 rounded-xl bg-zinc-800/10 flex items-center justify-center shrink-0 group-hover:bg-brand-primary transition-colors duration-300">
          <Building2 className="w-6 h-6 text-zinc-700 group-hover:text-white transition-colors duration-300" />
        </div>
        <div className="text-left">
          <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Active Companies</p>
          <h3 className="text-2xl font-black text-zinc-800 leading-none my-1 group-hover:text-brand-primary transition-colors duration-300">{activeCompaniesCount}</h3>
          <p className="text-[10px] text-zinc-400 font-bold">Currently Active</p>
        </div>
      </div>

      {/* Total Users */}
      <div className="bg-white rounded-2xl border border-border-base p-5 hover:border-brand-primary/30 transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden shadow-sm flex items-center gap-4">
        {/* Hover accent bar */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-brand-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />

        <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center shrink-0 group-hover:bg-brand-primary transition-colors duration-300">
          <Users className="w-6 h-6 text-brand-primary group-hover:text-white transition-colors duration-300" />
        </div>
        <div className="text-left">
          <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Total Users</p>
          <h3 className="text-2xl font-black text-zinc-800 leading-none my-1 group-hover:text-brand-primary transition-colors duration-300">{totalUsersCount}</h3>
          <p className="text-[10px] text-zinc-400 font-bold">Across All Companies</p>
        </div>
      </div>

      {/* Recently Added */}
      <div className="bg-white rounded-2xl border border-border-base p-5 hover:border-brand-primary/30 transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden shadow-sm flex items-center gap-4">
        {/* Hover accent bar */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-brand-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />

        <div className="w-12 h-12 rounded-xl bg-zinc-800/10 flex items-center justify-center shrink-0 group-hover:bg-brand-primary transition-colors duration-300">
          <Calendar className="w-6 h-6 text-zinc-700 group-hover:text-white transition-colors duration-300" />
        </div>
        <div className="text-left">
          <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Recently Added</p>
          <h3 className="text-2xl font-black text-zinc-800 leading-none my-1 group-hover:text-brand-primary transition-colors duration-300">{recentlyAddedCount}</h3>
          <p className="text-[10px] text-zinc-400 font-bold">In Last 30 Days</p>
        </div>
      </div>
    </div>
  )
}
