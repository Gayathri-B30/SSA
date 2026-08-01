import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import {
  FiX, FiPlus, FiEdit2, FiTrash2, FiFolderPlus, FiHelpCircle,
  FiCheck, FiAlertCircle, FiLayers, FiGrid, FiArrowRight
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

interface CategoryQuestionManagerModalProps {
  isOpen: boolean
  onClose: () => void
  onUpdated?: () => void
  initialCategoryId?: number
}

export const CategoryQuestionManagerModal: React.FC<CategoryQuestionManagerModalProps> = ({
  isOpen,
  onClose,
  onUpdated,
  initialCategoryId
}) => {
  const [categories, setCategories] = useState<DBProjectCategory[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(initialCategoryId || null)
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

  // Fetch categories on mount/open
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
      console.error('Failed to fetch questions:', err)
      setErrorMsg('Failed to load questions for selected category.')
    } finally {
      setLoadingFields(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchCategories()
    }
  }, [isOpen])

  useEffect(() => {
    if (selectedCategoryId) {
      fetchFields(selectedCategoryId)
    }
  }, [selectedCategoryId])

  // Clear notifications after 4 seconds
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

  const handleOpenAddCategory = () => {
    setEditingCategory(null)
    setCatName('')
    setCatCode('')
    setCatDesc('')
    setIsCategoryModalOpen(true)
  }

  const handleOpenEditCategory = (cat: DBProjectCategory) => {
    setEditingCategory(cat)
    setCatName(cat.name)
    setCatCode(cat.code)
    setCatDesc(cat.description || '')
    setIsCategoryModalOpen(true)
  }

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!catName.trim()) {
      setErrorMsg('Category name is required.')
      return
    }

    setSavingCategory(true)
    setErrorMsg(null)
    setSuccessMsg(null)
    try {
      if (editingCategory) {
        // Update existing category
        const res = await api.put(`/leads/categories/${editingCategory.id}`, {
          name: catName.trim(),
          code: catCode.trim() ? catCode.trim().toUpperCase() : undefined,
          description: catDesc.trim()
        })
        if (res.data?.success) {
          setSuccessMsg('Category updated successfully.')
          fetchCategories()
          onUpdated?.()
        } else {
          setErrorMsg(res.data?.message || 'Failed to update category.')
          return
        }
      } else {
        // Add new category
        const res = await api.post('/leads/categories', {
          name: catName.trim(),
          code: catCode.trim() ? catCode.trim().toUpperCase() : undefined,
          description: catDesc.trim()
        })
        if (res.data?.success) {
          setSuccessMsg('New category added successfully.')
          fetchCategories()
          if (res.data.data?.id) {
            setSelectedCategoryId(res.data.data.id)
          }
          onUpdated?.()
        } else {
          setErrorMsg(res.data?.message || 'Failed to add category.')
          return
        }
      }
      setIsCategoryModalOpen(false)
    } catch (err: any) {
      console.error('Failed to save category:', err)
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to save category.'
      setErrorMsg(msg)
    } finally {
      setSavingCategory(false)
    }
  }

  const handleDeleteCategory = async (cat: DBProjectCategory) => {
    if (!confirm(`Are you sure you want to delete category "${cat.name}"? This action cannot be undone.`)) return

    try {
      const res = await api.delete(`/leads/categories/${cat.id}`)
      if (res.data?.success) {
        setSuccessMsg(`Category "${cat.name}" deleted.`)
        const remaining = categories.filter(c => c.id !== cat.id)
        setCategories(remaining)
        if (selectedCategoryId === cat.id) {
          setSelectedCategoryId(remaining.length > 0 ? remaining[0].id : null)
        }
        onUpdated?.()
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to delete category.')
    }
  }

  // ── Question / Template Field Handlers ────────────────────────────────────

  const handleOpenAddQuestion = () => {
    if (!selectedCategoryId) {
      setErrorMsg('Please select a category first.')
      return
    }
    setEditingField(null)
    setQFieldName('')
    setQSection(existingSections[0] || 'Space Programme')
    setCustomSection('')
    setQFieldType('text')
    setQOptionsText('')
    setQStage('Requirement Collection')
    setQIsRequired(false)
    setIsQuestionModalOpen(true)
  }

  const handleOpenEditQuestion = (field: DBCategoryTemplateField) => {
    setEditingField(field)
    setQFieldName(field.fieldName)
    setQSection(field.section)
    setCustomSection('')
    setQFieldType(field.fieldType)
    setQOptionsText(field.fieldOptions ? field.fieldOptions.join(', ') : '')
    setQStage(field.capturedAtStage)
    setQIsRequired(field.isRequired)
    setIsQuestionModalOpen(true)
  }

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!qFieldName.trim()) {
      setErrorMsg('Question / Field name is required.')
      return
    }

    const finalSection = (qSection === 'NEW_CUSTOM_SECTION' ? customSection : qSection).trim()
    if (!finalSection) {
      setErrorMsg('Section name is required.')
      return
    }

    const optionsArray = (qFieldType === 'single-select' || qFieldType === 'multi-select')
      ? qOptionsText.split(',').map(o => o.trim()).filter(Boolean)
      : undefined

    setSavingQuestion(true)
    try {
      if (editingField) {
        // Update question
        const res = await api.put(`/leads/templates/${editingField.id}`, {
          fieldName: qFieldName.trim(),
          section: finalSection,
          fieldType: qFieldType,
          fieldOptions: optionsArray,
          capturedAtStage: qStage,
          isRequired: qIsRequired
        })
        if (res.data?.success) {
          setSuccessMsg('Question updated successfully.')
          if (selectedCategoryId) fetchFields(selectedCategoryId)
          onUpdated?.()
        }
      } else {
        // Add new question
        const res = await api.post('/leads/templates', {
          categoryId: selectedCategoryId,
          fieldName: qFieldName.trim(),
          section: finalSection,
          fieldType: qFieldType,
          fieldOptions: optionsArray,
          capturedAtStage: qStage,
          isRequired: qIsRequired
        })
        if (res.data?.success) {
          setSuccessMsg('New question added successfully.')
          if (selectedCategoryId) fetchFields(selectedCategoryId)
          onUpdated?.()
        }
      }
      setIsQuestionModalOpen(false)
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to save question.')
    } finally {
      setSavingQuestion(false)
    }
  }

  const handleDeleteQuestion = async (field: DBCategoryTemplateField) => {
    if (!confirm(`Are you sure you want to delete question "${field.fieldName}"?`)) return

    try {
      const res = await api.delete(`/leads/templates/${field.id}`)
      if (res.data?.success) {
        setSuccessMsg(`Question "${field.fieldName}" deleted.`)
        if (selectedCategoryId) fetchFields(selectedCategoryId)
        onUpdated?.()
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to delete question.')
    }
  }

  // Derive existing sections for current category questions
  const existingSections = Array.from(new Set(fields.map(f => f.section))).filter(Boolean)
  if (!existingSections.includes('Space Programme')) existingSections.push('Space Programme')
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

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-fade-in overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#33a18a] to-[#288571] text-white flex items-center justify-center shadow-md">
              <FiLayers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-slate-100 tracking-tight">
                Lead Generation — Categories & Questions Manager
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Add, customize and configure project categories & dynamic client questions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Success / Error Notification Bar */}
        {(errorMsg || successMsg) && (
          <div className="px-6 py-2.5">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs font-semibold flex items-center gap-2">
                <FiAlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <FiCheck className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}
          </div>
        )}

        {/* Tab Toggle Navigation */}
        <div className="px-6 pt-3 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <button
            onClick={() => setActiveTab('questions')}
            className={`pb-3 px-2 text-xs font-extrabold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 ${activeTab === 'questions'
                ? 'border-[#33a18a] text-[#33a18a]'
                : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
          >
            <FiHelpCircle className="w-4 h-4" />
            Category Questions ({fields.length})
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`pb-3 px-2 text-xs font-extrabold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 ${activeTab === 'categories'
                ? 'border-[#33a18a] text-[#33a18a]'
                : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
          >
            <FiGrid className="w-4 h-4" />
            Project Categories ({categories.length})
          </button>
        </div>

        {/* Modal Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* TAB 1: QUESTIONS MANAGER */}
          {activeTab === 'questions' && (
            <div className="space-y-6">

              {/* Category Selector Bar & Add Question Button */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    Select Category:
                  </label>
                  <select
                    value={selectedCategoryId || ''}
                    onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
                    className="flex-1 max-w-md px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-[#33a18a]/20 cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} ({cat.code})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleOpenAddQuestion}
                  disabled={!selectedCategoryId}
                  className="px-4 py-2.5 bg-[#33a18a] hover:bg-[#288571] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <FiPlus className="w-4 h-4" />
                  Add New Question
                </button>
              </div>

              {/* Selected Category Header Banner */}
              {selectedCat && (
                <div className="px-4 py-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/50 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase text-[#33a18a] tracking-wider">
                      Active Category Template
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {selectedCat.name}
                    </h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[#33a18a]/10 text-[#33a18a] font-extrabold text-[10px]">
                    {fields.length} Questions Configured
                  </span>
                </div>
              )}

              {/* Question List Grouped By Sections */}
              {loadingFields ? (
                <div className="py-12 text-center">
                  <div className="w-8 h-8 rounded-full border-3 border-[#33a18a] border-t-transparent animate-spin mx-auto mb-3" />
                  <p className="text-xs text-slate-400 font-medium">Loading category questions...</p>
                </div>
              ) : Object.keys(fieldsBySection).length === 0 ? (
                <div className="py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center">
                  <FiHelpCircle className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-300">No questions configured for this category yet.</p>
                  <p className="text-[11px] text-slate-400 mt-1">Click "Add New Question" above to add dynamic lead fields.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(fieldsBySection).map(([sectionName, sectionFields]) => (
                    <div key={sectionName} className="space-y-3">
                      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                        <span className="w-2 h-2 rounded-full bg-[#33a18a]" />
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          {sectionName}
                        </h4>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                          {sectionFields.length}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {sectionFields.map((field) => (
                          <div
                            key={field.id}
                            className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-[#33a18a]/50 shadow-xs transition-all flex items-start justify-between gap-3 group"
                          >
                            <div className="space-y-1 min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                                  {field.fieldName}
                                </span>
                                {field.isRequired && (
                                  <span className="px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 text-[9px] font-extrabold uppercase">
                                    Required
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 text-[10px] text-slate-400 flex-wrap">
                                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                                  {field.fieldType}
                                </span>
                                <span>•</span>
                                <span>Key: {field.fieldKey}</span>
                              </div>

                              {field.fieldOptions && field.fieldOptions.length > 0 && (
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 italic truncate mt-1">
                                  Options: {field.fieldOptions.join(', ')}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => handleOpenEditQuestion(field)}
                                title="Edit Question"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-[#33a18a] hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors"
                              >
                                <FiEdit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteQuestion(field)}
                                title="Delete Question"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-slate-800 transition-colors"
                              >
                                <FiTrash2 className="w-3.5 h-3.5" />
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
          )}

          {/* TAB 2: CATEGORIES MANAGER */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Project Categories
                  </h3>
                  <p className="text-xs text-slate-400">
                    Define project classification types for lead generation
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleOpenAddCategory}
                  className="px-4 py-2 bg-[#33a18a] hover:bg-[#288571] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <FiFolderPlus className="w-4 h-4" />
                  Add New Category
                </button>
              </div>

              {loadingCategories ? (
                <div className="py-12 text-center">
                  <div className="w-8 h-8 rounded-full border-3 border-[#33a18a] border-t-transparent animate-spin mx-auto mb-3" />
                  <p className="text-xs text-slate-400 font-medium">Loading categories...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categories.map((cat) => (
                    <div
                      key={cat.id}
                      className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-[#33a18a]/50 shadow-xs transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-md bg-[#33a18a]/10 text-[#33a18a] font-mono text-[10px] font-black">
                            {cat.code}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEditCategory(cat)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-[#33a18a] hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors"
                            >
                              <FiEdit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCategory(cat)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-slate-800 transition-colors"
                            >
                              <FiTrash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {cat.name}
                        </h4>

                        {cat.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                            {cat.description}
                          </p>
                        )}
                      </div>

                      <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                        <span>ID: {cat.id}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCategoryId(cat.id)
                            setActiveTab('questions')
                          }}
                          className="text-[#33a18a] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          View Questions <FiArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </motion.div>

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
                {editingCategory ? 'Edit Project Category' : 'Add New Project Category'}
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
                  placeholder="e.g. Hospitality — Hotels & Resorts"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-[#33a18a]"
                />
              </div>

              {!editingCategory && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    Category Code (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. HOSPITALITY"
                    value={catCode}
                    onChange={(e) => setCatCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 font-mono outline-none focus:border-[#33a18a]"
                  />
                  <p className="text-[10px] text-slate-400">If left blank, a code will be generated from name.</p>
                </div>
              )}

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

              {/* Question Name */}
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

              {/* Section Selection */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Section Name <span className="text-red-500">*</span>
                </label>
                <select
                  value={qSection}
                  onChange={(e) => setQSection(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-[#33a18a]"
                >
                  {existingSections.map(s => (
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

              {/* Field Type & Stage Grid */}
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

              {/* Selection Options (if dropdown) */}
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

              {/* Is Required Checkbox */}
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

    </div>,
    document.body
  )
}
