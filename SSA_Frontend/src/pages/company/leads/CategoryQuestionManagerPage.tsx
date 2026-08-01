import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiX, FiPlus, FiEdit2, FiTrash2, FiFolderPlus, FiHelpCircle,
  FiCheck, FiAlertCircle, FiLayers, FiGrid, FiArrowRight, FiArrowLeft
} from 'react-icons/fi'
import api from '../../../services/api'

export interface DBProjectCategory {
  id: number
  code: string
  name: string
  description?: string
}

export interface DBCategoryTemplateField {
  id: number
  categoryId: number
  fieldKey: string
  fieldName: string
  fieldType: 'text' | 'number' | 'single-select' | 'multi-select' | 'yes-no' | 'attachment'
  fieldOptions?: string[]
  section: string
  capturedAtStage: 'Lead' | 'Requirement Collection' | 'Client Brief'
  isRequired: boolean
  displayOrder: number
}

export const CategoryQuestionManagerPage: React.FC = () => {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<DBProjectCategory[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [fields, setFields] = useState<DBCategoryTemplateField[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [loadingFields, setLoadingFields] = useState(false)
  const [activeTab, setActiveTab] = useState<'categories' | 'questions'>('questions')

  // Error & Status feedback
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // ── Category Modal State ──────────────────────────────────────────────────
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<DBProjectCategory | null>(null)
  const [catName, setCatName] = useState('')
  const [catCode, setCatCode] = useState('')
  const [catDesc, setCatDesc] = useState('')
  const [savingCategory, setSavingCategory] = useState(false)

  // ── Question / Template Field Modal State ─────────────────────────────────
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false)
  const [editingField, setEditingField] = useState<DBCategoryTemplateField | null>(null)
  const [qFieldName, setQFieldName] = useState('')
  const [qSection, setQSection] = useState('')
  const [customSection, setCustomSection] = useState('')
  const [qFieldType, setQFieldType] = useState<DBCategoryTemplateField['fieldType']>('text')
  const [qOptionsText, setQOptionsText] = useState('')
  const [qStage, setQStage] = useState<DBCategoryTemplateField['capturedAtStage']>('Requirement Collection')
  const [qIsRequired, setQIsRequired] = useState(false)
  const [savingQuestion, setSavingQuestion] = useState(false)

  // Fetch categories on mount
  const fetchCategories = async () => {
    setLoadingCategories(true)
    try {
      const res = await api.get('/leads/categories')
      if (res.data?.success) {
        const catList: DBProjectCategory[] = res.data.data || []
        setCategories(catList)
        if (catList.length > 0 && !selectedCategoryId) {
          setSelectedCategoryId(catList[0].id)
        }
      }
    } catch (err: any) {
      console.error('Failed to fetch categories:', err)
      setErrorMsg('Failed to load categories.')
    } finally {
      setLoadingCategories(false)
    }
  }

  // Fetch questions for selected category
  const fetchFields = async (catId: number) => {
    setLoadingFields(true)
    try {
      const res = await api.get(`/leads/templates?categoryId=${catId}`)
      if (res.data?.success) {
        setFields(res.data.data || [])
      }
    } catch (err: any) {
      console.error('Failed to fetch template fields:', err)
      setErrorMsg('Failed to load category questions.')
    } finally {
      setLoadingFields(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (selectedCategoryId) {
      fetchFields(selectedCategoryId)
    }
  }, [selectedCategoryId])

  // Clear notification messages after 4s
  useEffect(() => {
    if (errorMsg || successMsg) {
      const timer = setTimeout(() => {
        setErrorMsg(null)
        setSuccessMsg(null)
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [errorMsg, successMsg])

  // ── Category Handlers ─────────────────────────────────────────────────────
  const openNewCategoryModal = () => {
    setEditingCategory(null)
    setCatName('')
    setCatCode('')
    setCatDesc('')
    setIsCategoryModalOpen(true)
  }

  const openEditCategoryModal = (cat: DBProjectCategory) => {
    setEditingCategory(cat)
    setCatName(cat.name)
    setCatCode(cat.code)
    setCatDesc(cat.description || '')
    setIsCategoryModalOpen(true)
  }

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!catName.trim() || !catCode.trim()) {
      setErrorMsg('Category name and code are required.')
      return
    }

    setSavingCategory(true)
    try {
      if (editingCategory) {
        const res = await api.put(`/leads/categories/${editingCategory.id}`, {
          name: catName.trim(),
          code: catCode.trim(),
          description: catDesc.trim()
        })
        if (res.data?.success) {
          setSuccessMsg('Category updated successfully!')
          setIsCategoryModalOpen(false)
          fetchCategories()
        }
      } else {
        const res = await api.post('/leads/categories', {
          name: catName.trim(),
          code: catCode.trim(),
          description: catDesc.trim()
        })
        if (res.data?.success) {
          setSuccessMsg('New category created successfully!')
          setIsCategoryModalOpen(false)
          fetchCategories()
          if (res.data.data?.id) {
            setSelectedCategoryId(res.data.data.id)
          }
        }
      }
    } catch (err: any) {
      console.error('Failed to save category:', err)
      setErrorMsg(err.response?.data?.message || 'Failed to save category.')
    } finally {
      setSavingCategory(false)
    }
  }

  // ── Custom Delete Confirmation State ─────────────────────────────────────
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'category' | 'question'
    id: number
    name: string
  } | null>(null)
  const [deleting, setDeleting] = useState(false)

  const promptDeleteCategory = (id: number, name: string) => {
    setDeleteConfirm({ type: 'category', id, name })
  }

  const promptDeleteField = (id: number, name: string) => {
    setDeleteConfirm({ type: 'question', id, name })
  }

  const executeDelete = async () => {
    if (!deleteConfirm) return
    setDeleting(true)
    try {
      if (deleteConfirm.type === 'category') {
        const res = await api.delete(`/leads/categories/${deleteConfirm.id}`)
        if (res.data?.success) {
          setSuccessMsg(`Category "${deleteConfirm.name}" deleted successfully.`)
          if (selectedCategoryId === deleteConfirm.id) {
            setSelectedCategoryId(null)
          }
          fetchCategories()
        }
      } else {
        const res = await api.delete(`/leads/templates/${deleteConfirm.id}`)
        if (res.data?.success) {
          setSuccessMsg(`Question "${deleteConfirm.name}" deleted successfully.`)
          if (selectedCategoryId) fetchFields(selectedCategoryId)
        }
      }
    } catch (err: any) {
      console.error('Failed to delete item:', err)
      setErrorMsg(err.response?.data?.message || 'Failed to delete item.')
    } finally {
      setDeleting(false)
      setDeleteConfirm(null)
    }
  }


  // ── Question Handlers ──────────────────────────────────────────────────────
  const openNewQuestionModal = () => {
    if (!selectedCategoryId) {
      setErrorMsg('Please select a category first.')
      return
    }
    setEditingField(null)
    setQFieldName('')
    setQSection(existingSections[0] || 'General Information')
    setCustomSection('')
    setQFieldType('text')
    setQOptionsText('')
    setQStage('Requirement Collection')
    setQIsRequired(false)
    setIsQuestionModalOpen(true)
  }

  const openEditQuestionModal = (f: DBCategoryTemplateField) => {
    setEditingField(f)
    setQFieldName(f.fieldName)
    setQSection(f.section)
    setCustomSection('')
    setQFieldType(f.fieldType)
    setQOptionsText(f.fieldOptions ? f.fieldOptions.join(', ') : '')
    setQStage(f.capturedAtStage)
    setQIsRequired(f.isRequired)
    setIsQuestionModalOpen(true)
  }

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCategoryId) return
    if (!qFieldName.trim()) {
      setErrorMsg('Question name is required.')
      return
    }

    const finalSection = qSection === 'NEW_CUSTOM_SECTION' ? customSection.trim() : qSection.trim()
    if (!finalSection) {
      setErrorMsg('Section name is required.')
      return
    }

    let parsedOptions: string[] | undefined = undefined
    if (qFieldType === 'single-select' || qFieldType === 'multi-select') {
      parsedOptions = qOptionsText.split(',').map(s => s.trim()).filter(Boolean)
      if (parsedOptions.length === 0) {
        setErrorMsg('Please provide options for single or multi-select dropdown fields.')
        return
      }
    }

    const fieldKey = editingField
      ? editingField.fieldKey
      : qFieldName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')

    setSavingQuestion(true)
    try {
      const payload = {
        categoryId: selectedCategoryId,
        fieldKey,
        fieldName: qFieldName.trim(),
        fieldType: qFieldType,
        fieldOptions: parsedOptions,
        section: finalSection,
        capturedAtStage: qStage,
        isRequired: qIsRequired,
        displayOrder: editingField ? editingField.displayOrder : fields.length + 1
      }

      if (editingField) {
        const res = await api.put(`/leads/templates/${editingField.id}`, payload)
        if (res.data?.success) {
          setSuccessMsg('Question updated successfully!')
          setIsQuestionModalOpen(false)
          fetchFields(selectedCategoryId)
        }
      } else {
        const res = await api.post('/leads/templates', payload)
        if (res.data?.success) {
          setSuccessMsg('New question added to template!')
          setIsQuestionModalOpen(false)
          fetchFields(selectedCategoryId)
        }
      }
    } catch (err: any) {
      console.error('Failed to save question template:', err)
      setErrorMsg(err.response?.data?.message || 'Failed to save question template.')
    } finally {
      setSavingQuestion(false)
    }
  }



  // Get list of existing unique sections
  const existingSections = Array.from(new Set(fields.map(f => f.section))).filter(Boolean)
  if (!existingSections.includes('General Information')) existingSections.push('General Information')
  if (!existingSections.includes('Site & Zoning')) existingSections.push('Site & Zoning')
  if (!existingSections.includes('Building Specifications')) existingSections.push('Building Specifications')
  if (!existingSections.includes('Preferences')) existingSections.push('Preferences')

  // Group fields by section
  const fieldsBySection: Record<string, DBCategoryTemplateField[]> = {}
  fields.forEach(f => {
    if (!fieldsBySection[f.section]) {
      fieldsBySection[f.section] = []
    }
    fieldsBySection[f.section].push(f)
  })

  const selectedCat = categories.find(c => c.id === selectedCategoryId)

  return (
    <div className="space-y-6 animate-fade-in text-slate-800 dark:text-slate-100 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/crm/leads')}
            className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Back to CRM Leads"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#33a18a] to-[#288571] text-white flex items-center justify-center shadow-lg shadow-[#33a18a]/20">
            <FiLayers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Lead Generation — Categories & Questions Manager
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Add, customize, and configure project categories & dynamic client lead questions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openNewCategoryModal}
            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-2 transition-all"
          >
            <FiFolderPlus className="w-4 h-4 text-[#33a18a]" />
            <span>+ Add Category</span>
          </button>
          <button
            onClick={openNewQuestionModal}
            className="px-5 py-2.5 rounded-xl bg-[#33a18a] hover:bg-[#288571] text-white text-xs font-extrabold flex items-center gap-2 shadow-md shadow-[#33a18a]/20 transition-all"
          >
            <FiPlus className="w-4 h-4" />
            <span>Add New Question</span>
          </button>
        </div>
      </div>

      {/* Success / Error Notification Bar */}
      {(errorMsg || successMsg) && (
        <div className="animate-fade-in">
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs font-semibold flex items-center gap-3 shadow-sm">
              <FiAlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-300 text-xs font-semibold flex items-center gap-3 shadow-sm">
              <FiCheck className="w-5 h-5 flex-shrink-0 text-emerald-500" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>
      )}

      {/* Category Selector & Main Tabs Control Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 min-w-[280px]">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
              Active Category:
            </label>
            <select
              value={selectedCategoryId || ''}
              onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
              disabled={loadingCategories || categories.length === 0}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs font-bold text-slate-900 dark:text-slate-100 outline-none focus:border-[#33a18a] transition-colors"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
            <button
              onClick={() => setActiveTab('questions')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${activeTab === 'questions'
                ? 'bg-white dark:bg-slate-900 text-[#33a18a] shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
            >
              <FiHelpCircle className="w-4 h-4" />
              <span>Category Questions ({fields.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${activeTab === 'categories'
                ? 'bg-white dark:bg-slate-900 text-[#33a18a] shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
            >
              <FiGrid className="w-4 h-4" />
              <span>Project Categories ({categories.length})</span>
            </button>
          </div>
        </div>

        {selectedCat && activeTab === 'questions' && (
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>
              Configuring dynamic questions for <strong className="text-slate-900 dark:text-slate-100">{selectedCat.name}</strong> ({selectedCat.code})
            </span>
            {selectedCat.description && (
              <span className="italic text-slate-400 dark:text-slate-500">{selectedCat.description}</span>
            )}
          </div>
        )}
      </div>

      {/* Main Tab Content */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm min-h-[400px]">
        {activeTab === 'questions' ? (
          <div>
            {loadingFields ? (
              <div className="py-16 text-center text-xs text-slate-400 font-medium">
                Loading questions for category...
              </div>
            ) : Object.keys(fieldsBySection).length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                  <FiHelpCircle className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No Custom Questions Added Yet</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Click "Add New Question" to configure dynamic questions captured during Lead submission.
                </p>
                <button
                  onClick={openNewQuestionModal}
                  className="mt-2 px-4 py-2 bg-[#33a18a] hover:bg-[#288571] text-white text-xs font-bold rounded-xl shadow-md"
                >
                  + Add First Question
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(fieldsBySection).map(([sectionName, sectionFields]) => (
                  <div
                    key={sectionName}
                    className="border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/40 dark:bg-slate-800/20"
                  >
                    <div className="px-5 py-3.5 bg-slate-100/70 dark:bg-slate-800/60 border-b border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#33a18a]" />
                        <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                          {sectionName}
                        </h3>
                        <span className="text-[11px] font-bold text-slate-400 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                          {sectionFields.length} fields
                        </span>
                      </div>
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {sectionFields.map((f) => (
                        <div
                          key={f.id}
                          className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-100/50 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                {f.fieldName}
                              </span>
                              {f.isRequired && (
                                <span className="text-[10px] font-extrabold text-red-500 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 px-1.5 py-0.5 rounded">
                                  REQUIRED
                                </span>
                              )}
                              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full uppercase">
                                Type: {f.fieldType}
                              </span>
                              <span className="text-[10px] font-semibold text-[#33a18a] bg-[#33a18a]/10 border border-[#33a18a]/20 px-2 py-0.5 rounded-full">
                                Stage: {f.capturedAtStage}
                              </span>
                            </div>

                            {f.fieldOptions && f.fieldOptions.length > 0 && (
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                Options: <span className="font-medium text-slate-700 dark:text-slate-300">{f.fieldOptions.join(', ')}</span>
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => openEditQuestionModal(f)}
                              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                              title="Edit Question"
                            >
                              <FiEdit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => promptDeleteField(f.id, f.fieldName)}
                              className="p-2 rounded-xl text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors cursor-pointer"
                              title="Delete Question"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* PROJECT CATEGORIES TAB */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                Configured Project Categories
              </h3>
              <button
                onClick={openNewCategoryModal}
                className="px-3.5 py-1.5 rounded-xl bg-[#33a18a] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <FiPlus className="w-4 h-4" /> + Add Category
              </button>
            </div>

            {loadingCategories ? (
              <div className="py-12 text-center text-xs text-slate-400">Loading categories...</div>
            ) : categories.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">No project categories found.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className={`p-4 rounded-2xl border transition-all ${selectedCategoryId === cat.id
                      ? 'border-[#33a18a] bg-[#33a18a]/5 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-[#33a18a] bg-[#33a18a]/10 px-2 py-0.5 rounded">
                          {cat.code}
                        </span>
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 mt-1">
                          {cat.name}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditCategoryModal(cat)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                        >
                          <FiEdit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => promptDeleteCategory(cat.id, cat.name)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 cursor-pointer"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {cat.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                        {cat.description}
                      </p>
                    )}

                    <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
                      <button
                        onClick={() => {
                          setSelectedCategoryId(cat.id)
                          setActiveTab('questions')
                        }}
                        className="text-[#33a18a] font-bold flex items-center gap-1 hover:underline"
                      >
                        Manage Questions <FiArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── SUB-MODAL 1: ADD / EDIT CATEGORY ── */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                {editingCategory ? 'Edit Project Category' : 'Add New Category'}
              </h3>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <FiX className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Residential Villa, Healthcare Facilities"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-[#33a18a]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Category Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. RESIDENTIAL, HOSPITALITY"
                  value={catCode}
                  onChange={(e) => setCatCode(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-[#33a18a] uppercase"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Hotel projects, guest amenities, BOH operations..."
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-[#33a18a] resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCategory}
                  className="px-5 py-2 bg-[#33a18a] hover:bg-[#288571] text-white text-xs font-bold rounded-xl shadow-md"
                >
                  {savingCategory ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ── SUB-MODAL 2: ADD / EDIT QUESTION / TEMPLATE FIELD ── */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                {editingField ? 'Edit Question' : 'Add New Question'}
              </h3>
              <button onClick={() => setIsQuestionModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <FiX className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Question / Field Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Number of Guest Rooms / Balcony Count"
                  value={qFieldName}
                  onChange={(e) => setQFieldName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-[#33a18a]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Section Name <span className="text-red-500">*</span>
                </label>
                <select
                  value={qSection}
                  onChange={(e) => setQSection(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-[#33a18a]"
                >
                  {existingSections.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                  <option value="NEW_CUSTOM_SECTION">Add New Section...</option>
                </select>

                {qSection === 'NEW_CUSTOM_SECTION' && (
                  <input
                    type="text"
                    required
                    placeholder="Enter custom section name (e.g., Acoustic Requirements)"
                    value={customSection}
                    onChange={(e) => setCustomSection(e.target.value)}
                    className="w-full mt-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-[#33a18a]"
                  />
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    Answer Input Type
                  </label>
                  <select
                    value={qFieldType}
                    onChange={(e) => setQFieldType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-[#33a18a]"
                  >
                    <option value="text">Text Box</option>
                    <option value="number">Number</option>
                    <option value="single-select">Single Choice Dropdown</option>
                    <option value="multi-select">Multiple Choice Select</option>
                    <option value="yes-no">Yes / No Toggle</option>
                    <option value="attachment">File Attachment</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    Captured At Stage
                  </label>
                  <select
                    value={qStage}
                    onChange={(e) => setQStage(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-[#33a18a]"
                  >
                    <option value="Lead">Lead Stage</option>
                    <option value="Requirement Collection">Requirement Collection</option>
                    <option value="Client Brief">Client Brief Stage</option>
                  </select>
                </div>
              </div>

              {(qFieldType === 'single-select' || qFieldType === 'multi-select') && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    Dropdown Options (Comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Open, Closed, Dual"
                    value={qOptionsText}
                    onChange={(e) => setQOptionsText(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-[#33a18a]"
                  />
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="qIsRequired"
                  checked={qIsRequired}
                  onChange={(e) => setQIsRequired(e.target.checked)}
                  className="w-4 h-4 rounded text-[#33a18a] focus:ring-[#33a18a]"
                />
                <label htmlFor="qIsRequired" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Mark as Required field during Lead submission
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsQuestionModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingQuestion}
                  className="px-5 py-2 bg-[#33a18a] hover:bg-[#288571] text-white text-xs font-bold rounded-xl shadow-md"
                >
                  {savingQuestion ? 'Saving...' : 'Save Question'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ── SUB-MODAL 3: DELETE CONFIRMATION POPUP ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-center space-y-4 relative"
          >
            <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-500 flex items-center justify-center mx-auto shadow-sm">
              <FiAlertCircle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900 dark:text-slate-100 tracking-tight">
                Confirm Deletion
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                {deleteConfirm.type === 'category'
                  ? `Are you sure you want to delete category "${deleteConfirm.name}"? Dynamic questions associated with this category will also be deleted.`
                  : `Are you sure you want to delete question "${deleteConfirm.name}"?`}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
                className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeDelete}
                disabled={deleting}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold rounded-xl shadow-md shadow-red-600/20 transition-all cursor-pointer disabled:opacity-60"
              >
                {deleting ? 'Deleting...' : 'Delete Now'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

