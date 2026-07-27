import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import {
  initialStats,
  revenueAnalyticsData,
  projectProgressData,
  type StatMetric
} from '../../data/mockData'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts'
import * as Icons from 'lucide-react'

// Helper to dynamic-render Lucide Icons
const StatIcon: React.FC<{ name: string; className?: string }> = ({ name, className }) => {
  const IconComponent = (Icons as any)[name]
  if (!IconComponent) return <Icons.HelpCircle className={className} />
  return <IconComponent className={className} />
}

export const DashboardOverview: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [stats] = useState<StatMetric[]>(initialStats)
  const [branchData, setBranchData] = useState<any>(null)
  const [branchLoading, setBranchLoading] = useState(false)

  useEffect(() => {
    if (user?.role === 'Branch') {
      setBranchLoading(true)
      api.get('/branches/dashboard')
        .then(res => {
          setBranchData(res.data)
        })
        .catch(err => {
          console.error('Failed to fetch branch dashboard stats:', err)
        })
        .finally(() => {
          setBranchLoading(false)
        })
    }
  }, [user])

  // Pick only the 4 most important KPIs
  const keyMetricIds = ['stat-employees', 'stat-projects-running', 'stat-tasks-overdue', 'stat-clients']
  const keyStats = keyMetricIds
    .map(id => stats.find(s => s.id === id))
    .filter(Boolean) as StatMetric[]

  // Branch Specific Stats
  const employeesList = branchData?.employees || []
  const activeCount = employeesList.filter((e: any) => e.status === 'Active').length
  const onLeaveCount = employeesList.filter((e: any) => e.status === 'On Leave').length

  const branchStats = [
    {
      id: 'branch-total',
      label: 'Total Employees',
      value: branchData?.totalEmployees || 0,
      change: 'Active in division',
      trend: 'neutral',
      icon: 'Users'
    },
    {
      id: 'branch-active',
      label: 'Active Staff',
      value: activeCount,
      change: 'Present on duty',
      trend: 'up',
      icon: 'UserCheck'
    },
    {
      id: 'branch-leave',
      label: 'Staff On Leave',
      value: onLeaveCount,
      change: 'Approved leaves',
      trend: 'down',
      icon: 'Users'
    },
    {
      id: 'branch-code',
      label: 'Branch Code',
      value: user?.code || '—',
      change: `ID: ${branchData?.branchId || '—'}`,
      trend: 'neutral',
      icon: 'Building2'
    }
  ]

  // Fallback if IDs don't match — take first 4 for Company Role
  const displayStats = user?.role === 'Branch'
    ? branchStats
    : (keyStats.length === 4 ? keyStats : stats.slice(0, 4))

  // Branch Specific Charts Data
  const operationsTrendData = [
    { month: 'Jan', sla: 92, attendance: 95 },
    { month: 'Feb', sla: 90, attendance: 96 },
    { month: 'Mar', sla: 95, attendance: 97 },
    { month: 'Apr', sla: 93, attendance: 94 },
    { month: 'May', sla: 96, attendance: 98 },
    { month: 'Jun', sla: 98, attendance: 97 },
  ]

  const branchCompetencyData = [
    { subject: 'BIM Coordination', branchAvg: 90, companyAvg: 85 },
    { subject: 'Site Supervision', branchAvg: 82, companyAvg: 90 },
    { subject: 'CAD Drafting', branchAvg: 95, companyAvg: 80 },
    { subject: 'Quality Control', branchAvg: 88, companyAvg: 85 },
    { subject: 'Client Liaison', branchAvg: 75, companyAvg: 90 },
    { subject: 'Bylaw Compliance', branchAvg: 85, companyAvg: 80 },
  ]

  if (branchLoading && !branchData) {
    return (
      <div className="w-full py-20 flex flex-col items-center justify-center text-slate-800 dark:text-slate-100">
        <div className="animate-spin w-10 h-10 rounded-full border-4 border-brand-primary border-t-transparent mb-4" />
        <p className="text-sm font-semibold tracking-wide animate-pulse">Loading Branch Dashboard...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in text-brand-charcoal relative text-left">
      {/* Building sketch as page background - top right */}
      <div className="absolute right-0 top-0 w-[60%] h-[300px] pointer-events-none hidden md:block z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-bg via-brand-bg/70 to-transparent z-10" />
        <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-gradient-to-t from-brand-bg to-transparent z-10" />
        <img
          src="/images/architecher.png"
          alt=""
          className="w-full h-full object-cover object-center opacity-70"
        />
      </div>

      {/* Welcome Banner */}
      <div className="relative z-10">
        <div className="p-6 sm:p-8 flex flex-col gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-brand-charcoal tracking-tight">
              Welcome back, <span className="text-brand-primary">{user?.name || 'Sundar Sundram'}</span>
            </h1>
            <p className="text-xs sm:text-sm text-brand-gray mt-1 font-medium">
              {user?.role === 'Branch'
                ? "Here is what's happening in your branch division today."
                : "Here's what's happening with your projects today."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {user?.role !== 'Branch' && (
              <>
                <button
                  onClick={() => navigate('')}
                  className="px-4 py-2 bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-brand-primary/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <Icons.Layers className="w-3.5 h-3.5" />
                  View Projects
                </button>
                <button
                  onClick={() => navigate('/crm/leads')}
                  className="px-4 py-2 bg-white hover:bg-slate-50 text-brand-charcoal text-xs font-bold rounded-xl border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Icons.Compass className="w-3.5 h-3.5" />
                  View Leads
                </button>
              </>
            )}
            <button
              onClick={() => navigate('/employees/list', { state: { openAddModal: true } })}
              className="px-4 py-2 bg-white hover:bg-slate-50 text-brand-charcoal text-xs font-bold rounded-xl border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Icons.UserPlus className="w-3.5 h-3.5 text-brand-primary" />
              Add Employee
            </button>
          </div>
        </div>
      </div>

      {/* 4 Key KPI Cards */}
      <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {displayStats.map((card: any) => {
          const isUp = card.trend === 'up'
          const isDown = card.trend === 'down'

          return (
            <div
              key={card.id}
              className="glass-card p-5 rounded-2xl border border-slate-200/80 hover:border-brand-primary/30 transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden bg-white"
            >
              {/* Hover accent bar */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-brand-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />

              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold text-brand-gray uppercase tracking-wider truncate">
                  {card.label}
                </span>
                <div className="p-2 rounded-lg bg-primary-50 text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-colors">
                  <StatIcon name={card.icon} className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-3 flex items-baseline justify-between gap-1 flex-wrap">
                <span className="text-2xl font-extrabold text-brand-charcoal tracking-tight group-hover:text-brand-primary transition-colors">
                  {card.value}
                </span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${isUp
                    ? 'bg-emerald-500/10 text-emerald-700'
                    : isDown
                      ? 'bg-brand-primary/10 text-brand-primary'
                      : 'bg-slate-100 text-slate-600'
                    }`}
                >
                  {card.change.split(' ')[0]}
                </span>
              </div>
              <p className="text-[10px] text-brand-gray mt-1.5 truncate">
                {card.change}
              </p>
            </div>
          )
        })}
      </div>

      {/* Dynamic Branch Charts or Company Charts */}
      {user?.role === 'Branch' ? (
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Operational Performance Trend */}
          <div className="glass-card p-5 rounded-2xl border border-slate-200/80 bg-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-bold text-brand-charcoal uppercase tracking-wider">
                  Operational Performance Trend
                </h3>
                <p className="text-[10px] text-brand-gray mt-0.5">Monthly Attendance vs Task SLA compliance rates</p>
              </div>
              <span className="text-[10px] text-brand-primary font-bold">Percentage (%)</span>
            </div>
            <div className="h-72 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={operationsTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSla" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#830117" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#830117" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C59D5F" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#C59D5F" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-base)" />
                  <XAxis dataKey="month" stroke="var(--color-text-muted)" />
                  <YAxis stroke="var(--color-text-muted)" domain={[80, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--color-bg-panel)', borderColor: 'var(--color-border-base)', color: 'var(--color-text-base)' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px' }} />
                  <Area type="monotone" dataKey="sla" name="SLA Compliance Rate" stroke="#830117" fillOpacity={1} fill="url(#colorSla)" strokeWidth={2.5} />
                  <Area type="monotone" dataKey="attendance" name="Avg Attendance" stroke="#C59D5F" fillOpacity={1} fill="url(#colorAttendance)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Team Competency Radar Index */}
          <div className="glass-card p-5 rounded-2xl border border-slate-200/80 bg-white">
            <div className="mb-4">
              <h3 className="text-xs font-bold text-brand-charcoal uppercase tracking-wider">
                Competency Radar Index
              </h3>
              <p className="text-[10px] text-brand-gray mt-0.5">Average skill index compared against company baseline</p>
            </div>
            <div className="h-72 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={branchCompetencyData}>
                  <PolarGrid stroke="var(--color-border-base)" />
                  <PolarAngleAxis dataKey="subject" stroke="var(--color-text-muted)" fontSize={9} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="var(--color-text-muted)" fontSize={8} />
                  <Radar name="Branch Avg" dataKey="branchAvg" stroke="#830117" fill="#830117" fillOpacity={0.4} />
                  <Radar name="Company Baseline" dataKey="companyAvg" stroke="#1F2937" fill="#1F2937" fillOpacity={0.1} />
                  <Legend wrapperStyle={{ paddingTop: '10px' }} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--color-bg-panel)', borderColor: 'var(--color-border-base)', color: 'var(--color-text-base)' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Revenue Analytics */}
          <div className="glass-card p-5 rounded-2xl border border-slate-200/80 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-brand-charcoal uppercase tracking-wider">
                Revenue Analytics (Billing vs Collections)
              </h3>
              <span className="text-[10px] text-brand-primary font-bold">INR (₹) Lakhs</span>
            </div>
            <div className="h-72 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueAnalyticsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBilling" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#33a18a" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#33a18a" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorCollection" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#42a5f5" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#42a5f5" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-base)" />
                  <XAxis dataKey="month" stroke="var(--color-text-muted)" />
                  <YAxis
                    stroke="var(--color-text-muted)"
                    tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--color-bg-panel)', borderColor: 'var(--color-border-base)', color: 'var(--color-text-base)' }}
                    formatter={(value: any) => [`₹${(Number(value) / 100000).toFixed(1)} Lakhs`]}
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px' }} />
                  <Area type="monotone" dataKey="billing" name="Invoiced Amount" stroke="#33a18a" fillOpacity={1} fill="url(#colorBilling)" strokeWidth={2.5} />
                  <Area type="monotone" dataKey="collection" name="Realized Receipts" stroke="#42a5f5" fillOpacity={1} fill="url(#colorCollection)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Projects by Phase */}
          <div className="glass-card p-5 rounded-2xl border border-slate-200/80 bg-white">
            <h3 className="text-xs font-bold text-brand-charcoal uppercase tracking-wider mb-4">
              Projects Active by Phase
            </h3>
            <div className="h-72 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%" className="outline-none focus:outline-none">
                <BarChart data={projectProgressData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }} className="outline-none focus:outline-none">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-base)" />
                  <XAxis dataKey="stage" stroke="var(--color-text-muted)" />
                  <YAxis stroke="var(--color-text-muted)" allowDecimals={false} />
                  <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ backgroundColor: 'var(--color-bg-panel)', borderColor: 'var(--color-border-base)', color: 'var(--color-text-base)' }}
                  />
                  <Bar dataKey="count" name="Active Projects" fill="#33a18a" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
