import React, { useState } from 'react'
import { FileText, Download, BarChart3, Database } from 'lucide-react'

export const Reports: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState('revenue')
  const [exportType, setExportType] = useState<'excel' | 'pdf' | null>(null)
  const [exportProgress, setExportProgress] = useState(0)
  const [isExporting, setIsExporting] = useState(false)

  const reportsList = [
    { id: 'revenue', title: 'Revenue & Financial Audit Report', desc: 'Summary of in-month invoices, collections, pipeline estimates, and project billing history.' },
    { id: 'employee', title: 'Employee Resource Utilization & Attendance', desc: 'FTE mapping, department workload percentages, sick leaves, and training compliance files.' },
    { id: 'lead', title: 'Lead Funnel & Acquisition Conversion Analytics', desc: 'Monthly statistics showing prospective developers, references, opportunities value, and conversions.' },
    { id: 'client', title: 'Client Portfolio Ledger', desc: 'Contract values, active projects list, and client account health indexes.' },
    { id: 'project', title: 'Project Stages & Milestones Audit Report', desc: 'Project budgets progress tracker, site construction milestones, and coordination statuses.' },
    { id: 'vendor', title: 'Vendor Quality Review & Rating Register', desc: 'Radar performance reviews, active contractor trades, and HVAC/MEP approval listings.' },
  ]

  // Simulated Export Trigger
  const handleExportSim = (type: 'excel' | 'pdf') => {
    setIsExporting(true)
    setExportType(type)
    setExportProgress(0)

    // Simulate progress bar increments
    const interval = setInterval(() => {
      setExportProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            setIsExporting(false)
            setExportType(null)
            const reportName = reportsList.find(r => r.id === selectedReport)?.title || 'Report'
            alert(`Successfully generated and downloaded "${reportName}" in ${type.toUpperCase()} format!`)
          }, 400)
          return 100
        }
        return prev + 20
      })
    }, 150)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-charcoal tracking-tight sm:text-3xl font-extrabold">Analytical Reporting Vault</h1>
          <p className="text-sm text-brand-gray mt-1 font-medium">Generate, filter, and export legal entity reports, resource loads, and collection balances.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* 1. Selector Panel */}
        <div className="glass-card rounded-2xl border border-slate-200/80 overflow-hidden divide-y divide-slate-100 lg:col-span-1">
          {reportsList.map((rep) => (
            <button
              key={rep.id}
              onClick={() => {
                if (!isExporting) setSelectedReport(rep.id)
              }}
              className={`w-full p-4 text-left transition-all text-xs flex items-start gap-3 hover:bg-white/30 ${
                isExporting ? 'cursor-not-allowed opacity-55' : ''
              } ${
                selectedReport === rep.id
                  ? 'bg-brand-primary/10 border-l-3 border-brand-primary'
                  : ''
              }`}
            >
              <BarChart3 className={`w-4 h-4 flex-shrink-0 mt-0.5 ${selectedReport === rep.id ? 'text-brand-primary' : 'text-brand-gray'}`} />
              <div>
                <h4 className={`font-bold ${selectedReport === rep.id ? 'text-brand-primary' : 'text-brand-charcoal'}`}>{rep.title}</h4>
                <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">{rep.desc}</p>
              </div>
            </button>
          ))}
        </div>

        {/* 2. Parameters & Exporter controls */}
        <div className="lg:col-span-2 glass-card rounded-2xl border border-slate-200/80 p-6 space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-lg font-extrabold text-brand-charcoal">Report Generation Configurations</h2>
            <p className="text-xs text-brand-gray mt-1">Specify parameters to isolate data prior to compiling local file.</p>
          </div>

          <div className="space-y-4 text-xs">
            {/* Mock Parameters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-brand-gray uppercase tracking-wider mb-2">Branch Scope</label>
                <select className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary/60 outline-none rounded-xl px-4 py-2.5 text-xs text-brand-charcoal">
                  <option>All Branches</option>
                  <option>Chennai HQ</option>
                  <option>Bangalore Studio</option>
                  <option>Dubai Office</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-brand-gray uppercase tracking-wider mb-2">Fiscal Date Interval</label>
                <select className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary/60 outline-none rounded-xl px-4 py-2.5 text-xs text-brand-charcoal">
                  <option>Current FY 2026-2027</option>
                  <option>Previous FY 2025-2026</option>
                  <option>Last 6 Months</option>
                  <option>Last 30 Days</option>
                </select>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-3">
              <Database className="w-5 h-5 text-brand-primary flex-shrink-0 mt-0.5 animate-pulse" />
              <p className="leading-relaxed text-slate-500 text-[10px]">
                <strong>Database Query Estimate:</strong> Generating this report will query approximately 500 active records including milestones updates, employee timesheets, and accounting receipts. File will compile immediately.
              </p>
            </div>

            {/* Export Actions Panel */}
            <div className="border-t border-slate-200 pt-5 space-y-4">
              {!isExporting ? (
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => handleExportSim('excel')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/95 text-xs font-bold text-white shadow-md shadow-brand-primary/10 cursor-pointer transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> Compile Excel Ledger
                  </button>
                  <button
                    onClick={() => handleExportSim('pdf')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-brand-primary/40 text-xs font-bold text-brand-charcoal hover:text-brand-charcoal cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-brand-primary" /> Export PDF Summary
                  </button>
                </div>
              ) : (
                <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-brand-gray">Compiling dataset into {exportType?.toUpperCase()} format...</span>
                    <span className="text-brand-primary font-bold">{exportProgress}%</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-brand-primary h-full rounded-full transition-all duration-300" style={{ width: `${exportProgress}%` }} />
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
