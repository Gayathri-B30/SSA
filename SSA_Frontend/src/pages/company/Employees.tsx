import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useLocation } from 'react-router-dom'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import {
  type Employee,
  mockAttendance,
  initialLeaves,
  type LeaveRequest
} from '../../data/mockData'
import { Search, Plus, Filter, UserCheck, Check, X, Calendar, Award, Mail, Phone, ChevronLeft, ChevronRight, Eye, Edit2, Trash2, AlertCircle } from 'lucide-react'

interface EmployeesProps {
  defaultTab?: 'list' | 'attendance' | 'leaves' | 'performance'
}

interface EmployeeFormInputs {
  name: string
  email: string
  phone: string
  department: string
  designation: string
  manager: string
  joiningDate: string
  status: 'Active' | 'On Leave' | 'Suspended' | 'Inactive' | ''
  branch?: string
}

const formatDisplayDate = (dateStr: string) => {
  if (!dateStr) return '';
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
    return dateStr;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const parts = dateStr.split('-');
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }
  return dateStr;
}

const formatInputDate = (dateStr: string) => {
  if (!dateStr) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
    const parts = dateStr.split('-');
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  }
  return dateStr;
}

export const Employees: React.FC<EmployeesProps> = ({ defaultTab = 'list' }) => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState<'list' | 'attendance' | 'leaves' | 'performance'>(defaultTab)

  useEffect(() => {
    setActiveTab(defaultTab)
  }, [defaultTab])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [deleteConfirmEmployee, setDeleteConfirmEmployee] = useState<Employee | null>(null)

  const [branchesList, setBranchesList] = useState<{ id: string; name: string; code: string }[]>([])

  useEffect(() => {
    const fetchBranchesList = async () => {
      try {
        const response = await api.get('/branches')
        const mapped = response.data.map((b: any) => ({
          id: b.branchId,
          name: b.name,
          code: b.code
        }))
        setBranchesList(mapped)
      } catch (err) {
        console.error('Failed to fetch branches from API:', err)
      }
    }
    fetchBranchesList()
  }, [])

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees')
      const mapped = response.data.map((item: any) => ({
        ...item,
        id: item.employeeId,
        joiningDate: formatDisplayDate(item.joiningDate)
      }))
      setEmployees(mapped)
    } catch (err) {
      console.error('Failed to fetch employees:', err)
    }
  }
  const [leaves, setLeaves] = useState<LeaveRequest[]>(initialLeaves)
  const [selectedProfile, setSelectedProfile] = useState<Employee | null>(null)

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [deptFilter, setDeptFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Form hooks
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<EmployeeFormInputs>({ mode: 'onChange' })

  // Search/Filter matching
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesDept = deptFilter === 'All' || emp.department === deptFilter
    const matchesStatus = statusFilter === 'All' || emp.status === statusFilter

    return matchesSearch && matchesDept && matchesStatus
  })

  // Pagination logic
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage)
  const currentItems = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  // Open Edit Form
  const openEditModal = (emp: Employee, e: React.MouseEvent) => {
    e.stopPropagation() // Don't trigger list click
    setEditingEmployee(emp)
    setValue('name', emp.name)
    setValue('email', emp.email)
    setValue('phone', emp.phone)
    setValue('department', emp.department)
    setValue('designation', emp.designation)
    setValue('manager', emp.manager || '')
    setValue('joiningDate', formatInputDate(emp.joiningDate))
    setValue('status', emp.status)
    setValue('branch', emp.branchId || 'Headquarters')
    setIsModalOpen(true)
  }

  // Open Add Form
  const openAddModal = () => {
    setEditingEmployee(null)
    reset({
      name: '',
      email: '',
      phone: '',
      department: '',
      designation: '',
      manager: '',
      joiningDate: new Date().toISOString().split('T')[0],
      status: '',
      branch: user?.role === 'Branch' ? user.id : '',
    })
    setIsModalOpen(true)
  }

  // Handle openAddModal trigger from Company Dashboard
  useEffect(() => {
    if (location.state && (location.state as any).openAddModal) {
      setActiveTab('list')
      openAddModal()
      // Clear location state to prevent repeating on refresh
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.state, navigate, location.pathname])

  useEffect(() => {
    fetchEmployees()
  }, [])

  // Delete Employee confirmation trigger
  const handleDeleteClick = (emp: Employee, e: React.MouseEvent) => {
    e.stopPropagation()
    setDeleteConfirmEmployee(emp)
  }

  const handleConfirmDelete = async () => {
    if (!deleteConfirmEmployee) return
    try {
      await api.delete(`/employees?employeeId=${deleteConfirmEmployee.id}`)
      await fetchEmployees()
    } catch (err: any) {
      console.error('Error deleting employee:', err)
      alert(err.response?.data?.message || 'Failed to delete employee.')
    } finally {
      setDeleteConfirmEmployee(null)
    }
  }

  // Submit Handler
  const onSubmit = async (data: EmployeeFormInputs) => {
    const { branch, ...rest } = data
    const payload = {
      ...rest,
      branchId: user?.role === 'Branch' ? user.id : ((branch && branch !== 'Headquarters') ? branch : null),
      joiningDate: formatDisplayDate(data.joiningDate)
    }
    try {
      if (editingEmployee) {
        await api.put('/employees', {
          employeeId: editingEmployee.id,
          ...payload
        })
      } else {
        await api.post('/employees', payload)
      }
      await fetchEmployees()
      setIsModalOpen(false)
      reset()
    } catch (err: any) {
      console.error('Error saving employee:', err)
      alert(err.response?.data?.message || 'Failed to save employee. Please try again.')
    }
  }

  // Approve leave requests
  const handleApproveLeave = (id: string) => {
    setLeaves(leaves.map(l => l.id === id ? { ...l, status: 'Approved' } : l))
  }

  const handleRejectLeave = (id: string) => {
    setLeaves(leaves.map(l => l.id === id ? { ...l, status: 'Rejected' } : l))
  }

  // Get departments unique list
  const departmentsList = Array.from(new Set(employees.map(e => e.department)))

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Custom Delete Confirmation Modal */}
      {deleteConfirmEmployee && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/20 backdrop-blur-[1px]">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/60 transition-opacity"
            onClick={() => setDeleteConfirmEmployee(null)}
          />

          {/* Modal box */}
          <div className="bg-white rounded-2xl max-w-sm w-full border border-zinc-200 shadow-2xl p-6 relative z-10 text-center animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4 text-brand-primary">
              <AlertCircle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-black text-zinc-900 tracking-tight text-brand-charcoal">Confirm Deletion</h3>
            <p className="text-xs text-zinc-500 mt-2 leading-relaxed font-bold">
              Are you sure you want to delete employee <span className="text-brand-primary font-extrabold">{deleteConfirmEmployee.name}</span> ({deleteConfirmEmployee.id})? This action cannot be undone.
            </p>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                type="button"
                onClick={() => setDeleteConfirmEmployee(null)}
                className="px-4 py-2.5 bg-brand-cancel hover:bg-brand-cancel-hover text-black text-xs font-black rounded-xl uppercase transition-colors tracking-wide cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2.5 bg-brand-primary hover:bg-primary-600 text-white text-xs font-black rounded-xl uppercase transition-colors tracking-wide cursor-pointer shadow-md shadow-brand-primary/10"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-charcoal tracking-tight sm:text-3xl font-extrabold">Employee Directory</h1>
          <p className="text-sm text-brand-gray mt-1">Manage human resources, staff attendance files, leaves, and performance grades.</p>
        </div>
        {activeTab === 'list' && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/95 text-xs font-bold text-white shadow-md shadow-brand-primary/10 transition-all duration-200 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Employee
          </button>
        )}
      </div>

      {/* Tabs */}
      {/* <div className="flex border-b border-slate-200/20 mb-6">
        <button
          onClick={() => { navigate('/employees/list'); setCurrentPage(1); }}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${activeTab === 'list'
              ? 'border-brand-primary text-brand-primary font-black'
              : 'border-transparent text-brand-gray hover:text-brand-charcoal'
            }`}
        >
          Employees List
        </button>
        <button
          onClick={() => navigate('/employees/attendance')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === 'attendance'
              ? 'border-brand-primary text-brand-primary font-black'
              : 'border-transparent text-brand-gray hover:text-brand-charcoal'
          }`}
        >
          Attendance
        </button>
        <button
          onClick={() => navigate('/employees/leaves')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === 'leaves'
              ? 'border-brand-primary text-brand-primary font-black'
              : 'border-transparent text-brand-gray hover:text-brand-charcoal'
          }`}
        >
          Leave Management
        </button>
        <button
          onClick={() => navigate('/employees/performance')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === 'performance'
              ? 'border-brand-primary text-brand-primary font-black'
              : 'border-transparent text-brand-gray hover:text-brand-charcoal'
          }`}
        >
          Performance
        </button>
      </div> */}

      {/* 1. Employees Tab */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Search */}
            <div className="flex items-center gap-2 bg-white border border-slate-200 px-3.5 py-2 rounded-xl text-brand-gray text-xs">
              <Search className="w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                placeholder="Search by ID, Name or Email..."
                className="bg-transparent border-none text-brand-charcoal outline-none w-full placeholder-slate-400"
              />
            </div>

            {/* Department Filter */}
            <div className="flex items-center gap-2 bg-white border border-slate-200 px-3.5 py-2 rounded-xl text-brand-gray text-xs">
              <Filter className="w-4 h-4 text-brand-primary" />
              <select
                value={deptFilter}
                onChange={(e) => { setDeptFilter(e.target.value); setCurrentPage(1); }}
                className="bg-transparent border-none text-brand-charcoal outline-none w-full"
              >
                <option value="All">All Departments</option>
                {departmentsList.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2 bg-white border border-slate-200 px-3.5 py-2 rounded-xl text-brand-gray text-xs">
              <UserCheck className="w-4 h-4 text-brand-primary" />
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="bg-transparent border-none text-brand-charcoal outline-none w-full"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Suspended">Suspended</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Data Table */}
          <div className="glass-card rounded-2xl border border-slate-200/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-brand-charcoal">
                <thead className="bg-slate-50 text-brand-gray uppercase tracking-wider">
                  <tr className="border-b border-slate-200/20">
                    <th className="p-4 font-semibold">Employee ID</th>
                    <th className="p-4 font-semibold">Name</th>
                    <th className="p-4 font-semibold">Contact Info</th>
                    <th className="p-4 font-semibold">Dept & Designation</th>
                    <th className="p-4 font-semibold">Joining Date</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/10">
                  {currentItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-500">
                        No employees found matching the search criteria.
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((emp) => (
                      <tr
                        key={emp.id}
                        onClick={() => setSelectedProfile(emp)}
                        className="hover:bg-slate-50 transition-colors cursor-pointer group"
                      >
                        <td className="p-4 font-mono font-bold text-brand-primary">{emp.id}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-800 text-brand-primary border border-brand-primary/20 flex items-center justify-center font-bold text-xs">
                              {emp.name.charAt(0)}
                            </div>
                            <span className="font-bold text-brand-charcoal group-hover:text-brand-primary transition-colors">{emp.name}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-0.5 text-brand-gray">
                            <p className="truncate">{emp.email}</p>
                            <p>{emp.phone}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-0.5">
                            <p className="text-brand-charcoal font-semibold">{emp.designation}</p>
                            <div className="flex flex-wrap items-center gap-1.5">
                              <p className="text-gray-500 text-[10px] uppercase">{emp.department}</p>
                              <span className="text-slate-300 text-[10px]">•</span>
                              <span className="text-brand-primary text-[10px] font-semibold">
                                {emp.branchId ? (branchesList.find(b => b.id === emp.branchId)?.name || emp.branchId) : 'Headquarters'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-brand-gray">{emp.joiningDate}</td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${emp.status === 'Active'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : emp.status === 'On Leave'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                              }`}
                          >
                            <span className={`w-1 h-1 rounded-full ${emp.status === 'Active'
                              ? 'bg-emerald-400'
                              : emp.status === 'On Leave'
                                ? 'bg-amber-400'
                                : 'bg-red-400'
                              }`} />
                            {emp.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => setSelectedProfile(emp)}
                              className="p-1.5 rounded-lg text-brand-gray hover:text-brand-charcoal hover:bg-slate-100 dark:hover:bg-slate-800 bg-transparent transition-colors"
                              title="Quick View"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => openEditModal(emp, e)}
                              className="p-1.5 rounded-lg text-brand-gray hover:text-brand-charcoal hover:bg-slate-100 dark:hover:bg-slate-800 bg-transparent transition-colors"
                              title="Edit Employee"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteClick(emp, e)}
                              className="p-1.5 rounded-lg text-red-400 hover:text-brand-charcoal hover:bg-red-500/10 transition-colors"
                              title="Delete Employee"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-slate-200 flex items-center justify-between">
                <span className="text-gray-500 text-xs">
                  Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredEmployees.length)} of {filteredEmployees.length} profiles
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="p-1.5 rounded-lg bg-white border border-slate-200 text-brand-gray hover:text-brand-charcoal disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => handlePageChange(idx + 1)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${currentPage === idx + 1
                        ? 'bg-brand-primary text-white shadow'
                        : 'bg-white border border-slate-200 text-brand-gray hover:text-brand-charcoal'
                        }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="p-1.5 rounded-lg bg-white border border-slate-200 text-brand-gray hover:text-brand-charcoal disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Attendance Tab */}
      {activeTab === 'attendance' && (
        <div className="glass-card rounded-2xl border border-slate-200/20 overflow-hidden">
          <div className="p-5 border-b border-slate-200/20 flex justify-between items-center">
            <h3 className="text-sm font-extrabold text-brand-charcoal uppercase tracking-wider">Attendance Log (Current Month)</h3>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md">92.5% AVG Attendance</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-brand-charcoal">
              <thead className="bg-slate-50 text-brand-gray uppercase tracking-wider">
                <tr className="border-b border-slate-200/20">
                  <th className="p-4 font-semibold">Employee</th>
                  <th className="p-4 font-semibold">Present Days</th>
                  <th className="p-4 font-semibold">Absent Days</th>
                  <th className="p-4 font-semibold">Late Check-ins</th>
                  <th className="p-4 font-semibold">Status Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/10">
                {mockAttendance.map((rec: any) => (
                  <tr key={rec.employeeId} className="hover:bg-white/10 transition-colors">
                    <td className="p-4 font-bold text-brand-charcoal">{rec.name}</td>
                    <td className="p-4 font-bold text-emerald-400">{rec.present} Days</td>
                    <td className="p-4 font-bold text-brand-gold">{rec.absent} Days</td>
                    <td className="p-4 font-bold text-amber-400">{rec.late} Times</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-brand-primary h-full rounded-full" style={{ width: `${rec.percentage}%` }} />
                        </div>
                        <span className="font-mono text-brand-charcoal font-extrabold">{rec.percentage}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Leave Requests Tab */}
      {activeTab === 'leaves' && (
        <div className="glass-card rounded-2xl border border-slate-200/20 overflow-hidden">
          <div className="p-5 border-b border-slate-200/20">
            <h3 className="text-sm font-extrabold text-brand-charcoal uppercase tracking-wider">Active Leave Requests</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-brand-charcoal">
              <thead className="bg-slate-50 text-brand-gray uppercase tracking-wider">
                <tr className="border-b border-slate-200/20">
                  <th className="p-4 font-semibold">Request ID</th>
                  <th className="p-4 font-semibold">Employee Name</th>
                  <th className="p-4 font-semibold">Leave Type</th>
                  <th className="p-4 font-semibold">Dates Schedule</th>
                  <th className="p-4 font-semibold text-center">Duration</th>
                  <th className="p-4 font-semibold">Approval Status</th>
                  <th className="p-4 font-semibold text-right">Approve Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/10">
                {leaves.map((l) => (
                  <tr key={l.id} className="hover:bg-white/10 transition-colors">
                    <td className="p-4 font-mono font-bold text-brand-primary">{l.id}</td>
                    <td className="p-4 font-bold text-brand-charcoal">{l.name}</td>
                    <td className="p-4">{l.type} Leave</td>
                    <td className="p-4 text-brand-gray">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-brand-primary" />
                        <span>{l.startDate} to {l.endDate}</span>
                      </div>
                    </td>
                    <td className="p-4 text-center font-extrabold text-brand-charcoal">{l.days} Days</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${l.status === 'Approved'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : l.status === 'Pending'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}
                      >
                        {l.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {l.status === 'Pending' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleApproveLeave(l.id)}
                            className="p-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-brand-charcoal transition-all cursor-pointer"
                            title="Approve Request"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleRejectLeave(l.id)}
                            className="p-1 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-brand-charcoal transition-all cursor-pointer"
                            title="Decline Request"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-[10px]">Actioned</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Performance Tab */}
      {activeTab === 'performance' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-5 rounded-2xl border border-slate-200/80">
            <h3 className="text-sm font-extrabold text-brand-charcoal uppercase tracking-wider mb-4">Top Project Delivers</h3>
            <div className="space-y-4">
              {[
                { name: 'Ananya Deshmukh', role: 'Project Architect', score: 96, count: 8 },
                { name: 'Siddharth Sen', role: 'BIM Modeler', score: 92, count: 12 },
                { name: 'Priya Ranganathan', role: 'Technical Director', score: 90, count: 6 },
              ].map((perf, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/50">
                  <div className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-brand-primary" />
                    <div>
                      <h4 className="text-xs font-bold text-brand-charcoal">{perf.name}</h4>
                      <p className="text-[10px] text-gray-500">{perf.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-brand-primary">{perf.score} Rating</p>
                    <p className="text-[9px] text-gray-500">{perf.count} Projects</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-slate-200/80">
            <h3 className="text-sm font-extrabold text-brand-charcoal uppercase tracking-wider mb-4">Training & Certifications Completed</h3>
            <div className="space-y-4">
              {[
                { title: 'Revit BIM Coordination Master', completed: '12 Architects', level: 'Advanced' },
                { title: 'Local Fire & Municipal Bylaws Review', completed: '8 Engineers', level: 'Compliance' },
                { title: 'BREEAM Sustainable Design Certification', completed: '4 Architects', level: 'Green Design' },
              ].map((cert, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/50">
                  <div>
                    <h4 className="text-xs font-bold text-brand-charcoal">{cert.title}</h4>
                    <p className="text-[10px] text-gray-500">{cert.completed}</p>
                  </div>
                  <span className="text-[9px] bg-brand-primary/10 text-brand-primary font-bold px-2 py-0.5 rounded-md">
                    {cert.level}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Slide-over Profile Drawer */}
      {selectedProfile && (
        <div className="fixed top-16 bottom-0 right-0 z-50 w-full max-w-md bg-white border-l border-slate-200 shadow-2xl p-6 overflow-y-auto animate-slide-in">
          <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-6">
            <h3 className="text-sm font-extrabold text-brand-charcoal uppercase tracking-wider">Employee Portfolio Profile</h3>
            <button
              onClick={() => setSelectedProfile(null)}
              className="p-1 rounded-lg text-brand-gray hover:text-brand-charcoal hover:bg-slate-100 dark:hover:bg-slate-800 bg-transparent transition-colors"
            >
              <Plus className="w-5 h-5 rotate-45" />
            </button>
          </div>

          <div className="space-y-6 text-xs text-brand-charcoal">
            {/* Main Badge Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 border border-brand-primary/30 flex items-center justify-center font-extrabold text-brand-primary text-xl">
                {selectedProfile.name.charAt(0)}
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-brand-charcoal">{selectedProfile.name}</h4>
                <p className="text-brand-gray mt-0.5">{selectedProfile.designation}</p>
                <p className="text-brand-primary text-[10px] uppercase font-bold mt-1 tracking-wider">{selectedProfile.department}</p>
              </div>
            </div>

            {/* Profile fields details */}
            <div className="space-y-3 p-4 bg-slate-50/30 rounded-2xl border border-slate-200/60">
              <div className="flex justify-between py-1.5 border-b border-slate-200/40">
                <span className="text-gray-500 font-medium">Employee ID</span>
                <span className="font-mono text-brand-charcoal font-bold">{selectedProfile.id}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200/40">
                <span className="text-gray-500 font-medium">Status</span>
                <span className="font-extrabold text-brand-charcoal">{selectedProfile.status}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200/40">
                <span className="text-gray-500 font-medium">Email</span>
                <span className="text-brand-charcoal flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-brand-primary" /> {selectedProfile.email}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200/40">
                <span className="text-gray-500 font-medium">Phone</span>
                <span className="text-brand-charcoal flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-brand-primary" /> {selectedProfile.phone}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200/40">
                <span className="text-gray-500 font-medium">Manager</span>
                <span className="text-brand-charcoal">{selectedProfile.manager}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200/40">
                <span className="text-gray-500 font-medium">Branch / Division</span>
                <span className="text-brand-primary font-bold">
                  {selectedProfile.branchId ? (branchesList.find(b => b.id === selectedProfile.branchId)?.name || selectedProfile.branchId) : 'Headquarters'}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-gray-500 font-medium">Joining Date</span>
                <span className="text-brand-charcoal">{selectedProfile.joiningDate}</span>
              </div>
            </div>

            {/* Simulated analytics log */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-brand-charcoal uppercase tracking-wider border-b border-slate-200 pb-2">Active Performance KPIs</h4>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] text-gray-500 uppercase">Weekly Utilized Load</p>
                  <p className="text-base font-extrabold text-brand-primary mt-1">85%</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] text-gray-500 uppercase">SLA Compliance</p>
                  <p className="text-base font-extrabold text-emerald-400 mt-1">98%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-20 md:pt-24 pb-8 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative my-auto w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-2xl p-6"
          >
            <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-4">
              <h2 className="text-lg font-extrabold text-brand-charcoal">
                {editingEmployee ? `Modify profile for ${editingEmployee.id}` : 'Register New Employee'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-brand-gray hover:text-brand-charcoal hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 bg-transparent outline-none focus:outline-none"
              >
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-brand-gray uppercase tracking-wider mb-2">Employee Name</label>
                  <input
                    type="text"
                    maxLength={50}
                    {...register('name', {
                      required: 'Name is required',
                      minLength: { value: 3, message: 'Name must be at least 3 characters' },
                      maxLength: { value: 50, message: 'Name cannot exceed 50 characters' },
                      pattern: {
                        value: /^[a-zA-Z]+[a-zA-Z\s.'-]*$/,
                        message: 'Name must start with a letter and contain only alphabets/spaces/dots'
                      },
                      onChange: (e) => {
                        const val = e.target.value.replace(/[^a-zA-Z\s.'-]/g, '')
                        e.target.value = val
                        setValue('name', val, { shouldValidate: true })
                      }
                    })}
                    className={`w-full bg-slate-50 border outline-none rounded-xl px-4 py-2.5 text-xs text-brand-charcoal transition-all ${errors.name
                      ? 'border-red-500 focus:ring-2 focus:ring-red-500/25 focus:border-red-500'
                      : 'border-slate-200 focus:border-brand-primary/60'
                      }`}
                    placeholder="Ananya Deshmukh"
                  />
                  {errors.name && (
                    <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 mt-1">
                      <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-brand-gray uppercase tracking-wider mb-2">Work Email</label>
                  <input
                    type="email"
                    {...register('email', {
                      required: 'Email address is required.',
                      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Please enter a valid email address.' }
                    })}
                    className={`w-full bg-slate-50 border outline-none rounded-xl px-4 py-2.5 text-xs text-brand-charcoal transition-all ${errors.email
                      ? 'border-red-500 focus:ring-2 focus:ring-red-500/25 focus:border-red-500'
                      : 'border-slate-200 focus:border-brand-primary/60'
                      }`}
                    placeholder="email@sundaramarchitects.com"
                  />
                  {errors.email && (
                    <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 mt-1">
                      <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-brand-gray uppercase tracking-wider mb-2">Mobile Phone</label>
                  <input
                    type="tel"
                    maxLength={10}
                    {...register('phone', {
                      required: 'Phone is required',
                      pattern: {
                        value: /^[6-9]\d{9}$/,
                        message: 'Enter a valid 10-digit mobile number'
                      },
                      onChange: (e) => {
                        const val = e.target.value.substring(0, 10).replace(/\D/g, '')
                        e.target.value = val
                        setValue('phone', val, { shouldValidate: true })
                      }
                    })}
                    className={`w-full bg-slate-50 border outline-none rounded-xl px-4 py-2.5 text-xs text-brand-charcoal transition-all ${errors.phone
                      ? 'border-red-500 focus:ring-2 focus:ring-red-500/25 focus:border-red-500'
                      : 'border-slate-200 focus:border-brand-primary/60'
                      }`}
                    placeholder="9876543210"
                  />
                  {errors.phone && (
                    <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 mt-1">
                      <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                {/* Department */}
                <div>
                  <label className="block text-xs font-semibold text-brand-gray uppercase tracking-wider mb-2">Department</label>
                  <select
                    {...register('department', { required: 'Department is required' })}
                    className={`w-full bg-slate-50 border outline-none rounded-xl px-4 py-2.5 text-xs text-brand-charcoal transition-all ${errors.department
                      ? 'border-red-500 focus:ring-2 focus:ring-red-500/25 focus:border-red-500'
                      : 'border-slate-200 focus:border-brand-primary/60'
                      }`}
                  >
                    <option value="">Select Department</option>
                    <option value="Executive Office">Executive Office</option>
                    <option value="Studio A">Studio A (Commercial)</option>
                    <option value="Studio B">Studio B (Residential)</option>
                    <option value="Structural Engineering">Structural Engineering</option>
                    <option value="MEP Services">MEP Services</option>
                    <option value="BIM & Rendering">BIM & Rendering</option>
                    <option value="Site Operations">Site Operations</option>
                  </select>
                  {errors.department && (
                    <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 mt-1">
                      <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.department.message}
                    </p>
                  )}
                </div>

                {/* Designation */}
                <div>
                  <label className="block text-xs font-semibold text-brand-gray uppercase tracking-wider mb-2">Designation</label>
                  <select
                    {...register('designation', { required: 'Designation is required' })}
                    className={`w-full bg-slate-50 border outline-none rounded-xl px-4 py-2.5 text-xs text-brand-charcoal transition-all ${errors.designation
                      ? 'border-red-500 focus:ring-2 focus:ring-red-500/25 focus:border-red-500'
                      : 'border-slate-200 focus:border-brand-primary/60'
                      }`}
                  >
                    <option value="">Select Designation</option>
                    <option value="Principal Architect">Principal Architect</option>
                    <option value="Studio Director">Studio Director</option>
                    <option value="Technical Director">Technical Director</option>
                    <option value="Project Architect">Project Architect</option>
                    <option value="Architect">Architect</option>
                    <option value="Junior Architect">Junior Architect</option>
                    <option value="Intern">Intern</option>
                    <option value="Consultant">Consultant</option>
                    <option value="Site Engineer">Site Engineer</option>
                  </select>
                  {errors.designation && (
                    <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 mt-1">
                      <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.designation.message}
                    </p>
                  )}
                </div>

                {/* Manager */}
                <div>
                  <label className="block text-xs font-semibold text-brand-gray uppercase tracking-wider mb-2">Reporting Manager</label>
                  <select
                    {...register('manager', { required: 'Reporting Manager is required' })}
                    className={`w-full bg-slate-50 border outline-none rounded-xl px-4 py-2.5 text-xs text-brand-charcoal transition-all ${errors.manager
                      ? 'border-red-500 focus:ring-2 focus:ring-red-500/25 focus:border-red-500'
                      : 'border-slate-200 focus:border-brand-primary/60'
                      }`}
                  >
                    <option value="">Select Reporting Manager</option>
                    <option value="Sundar Sundram">Sundar Sundram</option>
                    <option value="Rajeev Mehta">Rajeev Mehta</option>
                    <option value="Priya Ranganathan">Priya Ranganathan</option>
                    <option value="Ananya Deshmukh">Ananya Deshmukh</option>
                    <option value="Vikram Malhotra">Vikram Malhotra</option>
                    <option value="None">None</option>
                  </select>
                  {errors.manager && (
                    <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 mt-1">
                      <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.manager.message}
                    </p>
                  )}
                </div>

                {/* Joining Date */}
                <div>
                  <label className="block text-xs font-semibold text-brand-gray uppercase tracking-wider mb-2">Joining Date</label>
                  <input
                    type="date"
                    {...register('joiningDate', { required: 'Date is required' })}
                    className={`w-full bg-slate-50 border outline-none rounded-xl px-4 py-2.5 text-xs text-brand-charcoal transition-all ${errors.joiningDate
                      ? 'border-red-500 focus:ring-2 focus:ring-red-500/25 focus:border-red-500'
                      : 'border-slate-200 focus:border-brand-primary/60'
                      }`}
                  />
                  {errors.joiningDate && (
                    <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 mt-1">
                      <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.joiningDate.message}
                    </p>
                  )}
                </div>

                {/* Branch / Division */}
                <div>
                  <label className="block text-xs font-semibold text-brand-gray uppercase tracking-wider mb-2">Branch / Division</label>
                  <select
                    disabled={user?.role === 'Branch'}
                    {...register('branch', { required: user?.role !== 'Branch' ? 'Branch / Division is required' : false })}
                    className={`w-full bg-slate-50 border outline-none rounded-xl px-4 py-2.5 text-xs text-brand-charcoal transition-all ${errors.branch
                      ? 'border-red-500 focus:ring-2 focus:ring-red-500/25 focus:border-red-500'
                      : 'border-slate-200 focus:border-brand-primary/60'
                      } ${user?.role === 'Branch' ? 'opacity-65 cursor-not-allowed bg-slate-100' : ''}`}
                  >
                    <option value="">Select Branch / Division</option>
                    <option value="Headquarters">Headquarters</option>
                    {branchesList.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.code})
                      </option>
                    ))}
                  </select>
                  {errors.branch && (
                    <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 mt-1">
                      <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.branch.message}
                    </p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold text-brand-gray uppercase tracking-wider mb-2">Operational Status</label>
                  <select
                    {...register('status', { required: 'Operational Status is required' })}
                    className={`w-full bg-slate-50 border outline-none rounded-xl px-4 py-2.5 text-xs text-brand-charcoal transition-all ${errors.status
                      ? 'border-red-500 focus:ring-2 focus:ring-red-500/25 focus:border-red-500'
                      : 'border-slate-200 focus:border-brand-primary/60'
                      }`}
                  >
                    <option value="">Select Operational Status</option>
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  {errors.status && (
                    <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 mt-1">
                      <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.status.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-brand-gray hover:text-brand-charcoal cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/95 text-xs font-bold text-white shadow-md shadow-brand-primary/10 cursor-pointer transition-colors"
                >
                  {editingEmployee ? 'Save Profile' : 'Register Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
