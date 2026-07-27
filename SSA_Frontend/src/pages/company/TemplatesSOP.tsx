import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { mockTemplates, mockSops, type TemplateDoc, type SopDoc } from '../../data/mockData'
import { FileText, ClipboardList, BookOpen, Download, Copy, Check } from 'lucide-react'

interface TemplatesSOPProps {
  defaultTab?: 'templates' | 'sops'
}

export const TemplatesSOP: React.FC<TemplatesSOPProps> = ({ defaultTab = 'templates' }) => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'templates' | 'sops'>(defaultTab)

  useEffect(() => {
    setActiveTab(defaultTab)
  }, [defaultTab])
  
  // Selected files for preview
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateDoc | null>(mockTemplates[0])
  const [selectedSop, setSelectedSop] = useState<SopDoc | null>(mockSops[0])
  
  // Actions states
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadSim = (title: string) => {
    setDownloading(true)
    setTimeout(() => {
      setDownloading(false)
      alert(`Downloaded document "${title}" successfully to local Downloads!`)
    }, 1500)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-charcoal tracking-tight sm:text-3xl font-extrabold">Standardized Library</h1>
          <p className="text-sm text-brand-gray mt-1 font-medium font-sans">Access certified CAD checklist templates, project MOM layouts, fee proposals, and Standard Operating Procedures.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => navigate('/templates')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'templates'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-brand-gray hover:text-brand-charcoal'
          }`}
        >
          Document Templates ({mockTemplates.length})
        </button>
        <button
          onClick={() => navigate('/sop-library')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'sops'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-brand-gray hover:text-brand-charcoal'
          }`}
        >
          SOP Library ({mockSops.length})
        </button>
      </div>

      {/* Interactive Reader View Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* 1. Sidebar List Panel */}
        <div className="glass-card rounded-2xl border border-slate-200/80 overflow-hidden divide-y divide-slate-100 lg:col-span-1 max-h-[600px] overflow-y-auto no-scrollbar bg-white">
          {activeTab === 'templates' ? (
            mockTemplates.map((tmp: any) => (
              <button
                key={tmp.id}
                onClick={() => setSelectedTemplate(tmp)}
                className={`w-full p-4 text-left transition-all text-xs flex items-start gap-3 hover:bg-slate-50 cursor-pointer ${
                  selectedTemplate?.id === tmp.id
                    ? 'bg-primary-50 border-l-4 border-brand-primary'
                    : ''
                }`}
              >
                <FileText className={`w-4 h-4 flex-shrink-0 mt-0.5 ${selectedTemplate?.id === tmp.id ? 'text-brand-primary' : 'text-slate-400'}`} />
                <div>
                  <h4 className={`font-bold ${selectedTemplate?.id === tmp.id ? 'text-brand-primary' : 'text-brand-charcoal'}`}>{tmp.title}</h4>
                  <p className="text-[10px] text-brand-gray uppercase mt-0.5">{tmp.category} | {tmp.code}</p>
                </div>
              </button>
            ))
          ) : (
            mockSops.map((sop: any) => (
              <button
                key={sop.id}
                onClick={() => setSelectedSop(sop)}
                className={`w-full p-4 text-left transition-all text-xs flex items-start gap-3 hover:bg-slate-50 cursor-pointer ${
                  selectedSop?.id === sop.id
                    ? 'bg-primary-50 border-l-4 border-brand-primary'
                    : ''
                }`}
              >
                <ClipboardList className={`w-4 h-4 flex-shrink-0 mt-0.5 ${selectedSop?.id === sop.id ? 'text-brand-primary' : 'text-slate-400'}`} />
                <div>
                  <h4 className={`font-bold ${selectedSop?.id === sop.id ? 'text-brand-primary' : 'text-brand-charcoal'}`}>{sop.title}</h4>
                  <p className="text-[10px] text-brand-gray uppercase mt-0.5">{sop.category} | {sop.id}</p>
                </div>
              </button>
            ))
          )}
        </div>

        {/* 2. File Previewer Dashboard */}
        <div className="lg:col-span-2 glass-card rounded-2xl border border-slate-200/80 p-6 space-y-6 min-h-[450px] relative">
          {activeTab === 'templates' && selectedTemplate ? (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <span className="font-mono text-[10px] font-bold text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-md">
                    {selectedTemplate.code}
                  </span>
                  <h2 className="text-xl font-extrabold text-brand-charcoal mt-2">{selectedTemplate.title}</h2>
                  <p className="text-[10px] text-brand-gray mt-1 uppercase">Doc Category: {selectedTemplate.category}</p>
                </div>
                <button
                  onClick={() => handleDownloadSim(selectedTemplate.title)}
                  disabled={downloading}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary/95 text-xs font-bold text-white shadow-md shadow-brand-primary/10 cursor-pointer disabled:opacity-50 transition-colors"
                >
                  {downloading ? (
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent animate-spin rounded-full" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  {downloading ? 'Downloading...' : 'Download Template'}
                </button>
              </div>

              {/* Doc details layout */}
              <div className="space-y-4 text-xs">
                <div>
                  <h4 className="font-extrabold text-brand-charcoal uppercase tracking-wider text-[10px] text-brand-gray mb-1.5">Overview</h4>
                  <p className="text-brand-charcoal leading-relaxed">{selectedTemplate.description}</p>
                </div>
                
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                  <h4 className="font-bold text-brand-primary uppercase tracking-wider text-[9px]">Document Schema Specs</h4>
                  <div className="grid grid-cols-2 gap-y-2 gap-x-6 text-[10px] text-brand-gray">
                    <p>Format: <strong className="text-brand-charcoal">Excel (XLSX) / Word (DOCX)</strong></p>
                    <p>Revision: <strong className="text-brand-charcoal">R0 (June 2026)</strong></p>
                    <p>Mandatory: <strong className="text-brand-charcoal">Yes (All GFC stages)</strong></p>
                    <p>Security level: <strong className="text-brand-charcoal">Internal Only</strong></p>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'sops' && selectedSop ? (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <span className="font-mono text-[10px] font-bold text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-md">
                    {selectedSop.id}
                  </span>
                  <h2 className="text-xl font-extrabold text-brand-charcoal mt-2">{selectedSop.title}</h2>
                  <p className="text-[10px] text-brand-gray mt-1 uppercase">SOP Scope: {selectedSop.category}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopy(selectedSop.steps.join('\n'))}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-brand-primary/30 text-xs font-bold text-slate-500 hover:text-brand-charcoal transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied Steps!' : 'Copy Steps'}
                  </button>
                  <button
                    onClick={() => handleDownloadSim(selectedSop.title)}
                    className="p-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/95 text-white shadow-md shadow-brand-primary/10 cursor-pointer transition-colors"
                    title="Download SOP"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* SOP description and steps checklist */}
              <div className="space-y-4 text-xs">
                <div>
                  <h4 className="font-extrabold text-brand-charcoal uppercase tracking-wider text-[10px] text-brand-gray mb-1.5">SOP Mandate Description</h4>
                  <p className="text-brand-charcoal leading-relaxed">{selectedSop.description}</p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-extrabold text-brand-charcoal uppercase tracking-wider text-[10px] text-brand-gray">Step-by-step checklist process</h4>
                  <div className="space-y-2.5">
                    {selectedSop.steps.map((step: any, idx: number) => (
                      <div key={idx} className="flex gap-3 items-start p-3 bg-slate-50 border border-slate-100 rounded-xl">
                        <span className="w-5 h-5 rounded-full bg-brand-primary/10 text-brand-primary text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                          {idx + 1}
                        </span>
                        <p className="text-brand-charcoal leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center text-gray-500">
              <BookOpen className="w-12 h-12 text-slate-800 mb-3 animate-pulse" />
              <p className="text-xs">Select a document template or SOP from the list to load details previewer</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
