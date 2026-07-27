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
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
        <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center shrink-0">
          <Building2 className="w-6 h-6 text-brand-primary" />
        </div>
        <div className="text-left">
          <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Total Companies</p>
          <h3 className="text-2xl font-black text-zinc-800 leading-none my-1">{totalCompaniesCount}</h3>
          <p className="text-[10px] text-zinc-400 font-bold">All Registered Companies</p>
        </div>
      </div>

      {/* Active Companies */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
        <div className="w-12 h-12 rounded-xl bg-zinc-800/10 flex items-center justify-center shrink-0">
          <Building2 className="w-6 h-6 text-zinc-700" />
        </div>
        <div className="text-left">
          <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Active Companies</p>
          <h3 className="text-2xl font-black text-zinc-800 leading-none my-1">{activeCompaniesCount}</h3>
          <p className="text-[10px] text-zinc-400 font-bold">Currently Active</p>
        </div>
      </div>

      {/* Total Users */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
        <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center shrink-0">
          <Users className="w-6 h-6 text-brand-primary" />
        </div>
        <div className="text-left">
          <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Total Users</p>
          <h3 className="text-2xl font-black text-zinc-800 leading-none my-1">{totalUsersCount}</h3>
          <p className="text-[10px] text-zinc-400 font-bold">Across All Companies</p>
        </div>
      </div>

      {/* Recently Added */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
        <div className="w-12 h-12 rounded-xl bg-zinc-800/10 flex items-center justify-center shrink-0">
          <Calendar className="w-6 h-6 text-zinc-700" />
        </div>
        <div className="text-left">
          <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Recently Added</p>
          <h3 className="text-2xl font-black text-zinc-800 leading-none my-1">{recentlyAddedCount}</h3>
          <p className="text-[10px] text-zinc-400 font-bold">In Last 30 Days</p>
        </div>
      </div>
    </div>
  )
}
