import React, { useState, useEffect } from 'react'

interface Activity {
  id: string
  user: string
  action: string
  status: 'Completed' | 'Pending' | 'Failed'
  time: string
  amount: string
}

export const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<Activity[]>([])

  const mockActivities: Activity[] = [
    { id: 'TX-8801', user: 'Sophia Carter', action: 'Purchase Order', status: 'Completed', time: '2 mins ago', amount: '$450.00' },
    { id: 'TX-8802', user: 'Liam Martinez', action: 'Refund Issued', status: 'Pending', time: '12 mins ago', amount: '$89.50' },
    { id: 'TX-8803', user: 'Emma Watson', action: 'Subscription Renewal', status: 'Completed', time: '1 hour ago', amount: '$1,200.00' },
    { id: 'TX-8804', user: 'Ethan Hunt', action: 'Invoice Settlement', status: 'Failed', time: '3 hours ago', amount: '$310.00' },
    { id: 'TX-8805', user: 'Olivia Davis', action: 'License Upgrade', status: 'Completed', time: '5 hours ago', amount: '$150.00' },
  ]

  const refreshData = () => {
    setLoading(true)
    setTimeout(() => {
      setData(mockActivities)
      setLoading(false)
    }, 800)
  }

  useEffect(() => {
    refreshData()
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 space-y-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-charcoal tracking-tight font-extrabold">System Dashboard</h1>
          <p className="text-brand-gray text-xs sm:text-sm mt-1 font-medium">Real-time status tracking and core analytics overview.</p>
        </div>
        <div>
          <button
            onClick={refreshData}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-brand-gray hover:text-brand-charcoal hover:bg-slate-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="inline-block animate-spin w-4 h-4 rounded-full border-2 border-primary border-t-transparent" />
            ) : (
              '🔄'
            )}
            Refresh Metrics
          </button>
        </div>
      </div>

      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Volume', value: '$84,520', change: '+12.4%', up: true, icon: '💵' },
          { label: 'Completed Orders', value: '412', change: '+8.1%', up: true, icon: '✅' },
          { label: 'System Health', value: '99.98%', change: 'Normal', up: true, icon: '⚙️' },
          { label: 'Pending Refunds', value: '3', change: '-2%', up: false, icon: '⏳' },
        ].map((card, idx) => (
          <div
            key={idx}
            className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 backdrop-blur-sm shadow-xl shadow-slate-950/20"
          >
            <div className="flex items-center justify-between">
              <span className="text-brand-gray text-xs font-semibold uppercase tracking-wider">
                {card.label}
              </span>
              <span className="text-2xl">{card.icon}</span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-3xl font-bold text-brand-charcoal tracking-tight font-extrabold">{card.value}</span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                  card.up
                    ? 'bg-success-light text-success'
                    : 'bg-rose-500/10 text-rose-400'
                }`}
              >
                {card.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Stats Table & Chart Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Table Panel (Takes 2/3 space) */}
        <div className="lg:col-span-2 bg-slate-50 border border-slate-200/80 rounded-2xl p-6 backdrop-blur-sm overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-extrabold text-brand-charcoal">Recent Transactions</h3>
            <span className="text-xs text-slate-500 font-semibold uppercase">Live Audits</span>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <div className="animate-spin w-8 h-8 rounded-full border-4 border-indigo-500 border-t-transparent" />
                <span className="text-brand-gray text-sm">Fetching record log...</span>
              </div>
            ) : (
              <table className="w-full text-left text-sm text-brand-charcoal">
                <thead>
                  <tr className="border-b border-slate-200 text-brand-gray text-xs uppercase tracking-wider">
                    <th className="pb-3 font-semibold">TX ID</th>
                    <th className="pb-3 font-semibold">User</th>
                    <th className="pb-3 font-semibold">Type</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 font-mono text-indigo-400 text-xs font-semibold">{row.id}</td>
                      <td className="py-4 font-medium text-brand-charcoal">{row.user}</td>
                      <td className="py-4 text-brand-gray">{row.action}</td>
                      <td className="py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            row.status === 'Completed'
                              ? 'bg-success-light text-success'
                              : row.status === 'Pending'
                              ? 'bg-amber-500/10 text-amber-400'
                              : 'bg-rose-500/10 text-rose-400'
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="py-4 text-right font-bold text-text-base">{row.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Info panel (Takes 1/3 space) */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 backdrop-blur-sm space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-brand-charcoal mb-2">Connection Status</h3>
            <p className="text-brand-gray text-sm leading-relaxed">
              Vite dev environment initialized with API endpoints pointing to backend gateway. CORS headers are enabled on development networks.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/50">
              <span className="text-sm font-semibold text-brand-charcoal">API Gateway</span>
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Active
              </span>
            </div>
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/50">
              <span className="text-sm font-semibold text-brand-charcoal">Environment</span>
              <span className="text-xs bg-indigo-500/10 text-indigo-400 font-bold px-2 py-0.5 rounded-md">
                Development
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200/80 text-xs text-slate-500 leading-relaxed text-center">
            System build triggers automatically upon local code modifications.
          </div>
        </div>
      </div>
    </div>
  )
}

