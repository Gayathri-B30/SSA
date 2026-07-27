import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { initialTasks, type Task } from '../../data/mockData'
import { Plus, ArrowRight, ArrowLeft, Sparkles, Calendar, User } from 'lucide-react'

interface TaskFormInputs {
  taskName: string
  assignedTo: string
  priority: 'High' | 'Medium' | 'Low'
  startDate: string
  dueDate: string
  projectCode: string
}

export const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [isAddOpen, setIsAddOpen] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TaskFormInputs>()

  // Columns specification
  const columns: { id: Task['status']; label: string; bg: string; text: string }[] = [
    { id: 'Backlog', label: 'Backlog / To-Do', bg: 'bg-slate-50 border-slate-200', text: 'text-brand-gray' },
    { id: 'In Progress', label: 'In Design / Progress', bg: 'bg-brand-primary/5 border-brand-primary/10', text: 'text-brand-primary' },
    { id: 'Under Review', label: 'QA / Under Review', bg: 'bg-amber-500/5 border-amber-500/10', text: 'text-amber-500' },
    { id: 'Done', label: 'Completed / GFC Issued', bg: 'bg-emerald-500/5 border-emerald-500/10', text: 'text-emerald-400' },
  ]

  // Move task status forward/backward
  const moveTask = (id: string, direction: 'forward' | 'backward') => {
    const statuses: Task['status'][] = ['Backlog', 'In Progress', 'Under Review', 'Done']
    
    setTasks(prev =>
      prev.map(t => {
        if (t.id === id) {
          const currentIdx = statuses.indexOf(t.status)
          let nextIdx = currentIdx
          if (direction === 'forward' && currentIdx < statuses.length - 1) {
            nextIdx = currentIdx + 1
          } else if (direction === 'backward' && currentIdx > 0) {
            nextIdx = currentIdx - 1
          }

          const nextStatus = statuses[nextIdx]
          const progress = nextStatus === 'Done' ? 100 : nextStatus === 'Under Review' ? 90 : nextStatus === 'In Progress' ? 50 : 0
          
          return {
            ...t,
            status: nextStatus,
            progress
          }
        }
        return t
      })
    )
  }

  // Delete task
  const deleteTask = (id: string) => {
    if (confirm('Delete this task?')) {
      setTasks(tasks.filter(t => t.id !== id))
    }
  }

  // Submit new task
  const onSubmit = (data: TaskFormInputs) => {
    const newT: Task = {
      id: `TSK-${Math.floor(1000 + Math.random() * 9000)}`,
      ...data,
      status: 'Backlog',
      progress: 0,
      assignedToId: 'EMP-006' // Mock default
    }
    setTasks([...tasks, newT])
    setIsAddOpen(false)
    reset()
  }

  const getPriorityStyle = (priority: Task['priority']) => {
    switch (priority) {
      case 'High': return 'bg-red-500/10 text-red-400 border border-red-500/20'
      case 'Medium': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
      case 'Low': return 'bg-slate-100 text-slate-600 border border-slate-200'
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-charcoal tracking-tight sm:text-3xl font-extrabold">Task Workspace (Kanban)</h1>
          <p className="text-sm text-brand-gray mt-1">Visualize drawings workflows, coordinate BIM tasks, and monitor design checklist compliance.</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/95 text-xs font-bold text-white shadow-md shadow-brand-primary/10 transition-all duration-200 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Task
        </button>
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-start">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id)
          return (
            <div
              key={col.id}
              className={`rounded-2xl border p-4 flex flex-col min-h-[500px] h-full ${col.bg}`}
            >
              {/* Header column title */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 mb-4">
                <span className={`text-xs font-bold uppercase tracking-wider ${col.text}`}>
                  {col.label}
                </span>
                <span className="text-xs bg-slate-50 font-bold px-2 py-0.5 rounded-full border border-slate-200 text-brand-gray">
                  {colTasks.length}
                </span>
              </div>

              {/* Tasks List Container */}
              <div className="space-y-3 flex-1 overflow-y-auto no-scrollbar">
                {colTasks.length === 0 ? (
                  <p className="text-[10px] text-gray-600 text-center py-12 border border-dashed border-slate-200/60 rounded-xl">
                    No tasks in this stage
                  </p>
                ) : (
                  colTasks.map((task) => (
                    <div
                      key={task.id}
                      className="glass-card p-4 rounded-xl border border-slate-200/80 hover:border-brand-primary/20 transition-all duration-200 group"
                    >
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <span className="font-mono text-[9px] text-brand-primary bg-brand-primary/10 px-1.5 py-0.5 rounded">
                          {task.projectCode}
                        </span>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${getPriorityStyle(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>

                      <h4 className="text-xs font-extrabold text-brand-charcoal leading-relaxed mb-3">
                        {task.taskName}
                      </h4>

                      {/* Detail row */}
                      <div className="space-y-2 border-t border-slate-200/60 pt-2.5 text-[10px] text-brand-gray">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3 h-3 text-brand-primary" />
                          <span className="truncate">Assignee: <strong className="text-brand-charcoal">{task.assignedTo}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-brand-primary" />
                          <span>Due: <span className="text-brand-charcoal font-medium">{task.dueDate}</span></span>
                        </div>
                      </div>

                      {/* Control Panel Actions */}
                      <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-slate-200/60 text-[10px]">
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Delete
                        </button>
                        <div className="flex items-center gap-1">
                          <button
                            disabled={col.id === 'Backlog'}
                            onClick={() => moveTask(task.id, 'backward')}
                            className="p-1 rounded bg-slate-50 border border-slate-200 hover:bg-white text-brand-gray hover:text-brand-charcoal disabled:opacity-40"
                            title="Move Backward"
                          >
                            <ArrowLeft className="w-3 h-3" />
                          </button>
                          <button
                            disabled={col.id === 'Done'}
                            onClick={() => moveTask(task.id, 'forward')}
                            className="p-1 rounded bg-slate-50 border border-slate-200 hover:bg-white text-brand-gray hover:text-brand-charcoal disabled:opacity-40"
                            title="Move Forward"
                          >
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Add Task Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl p-6">
            <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-4">
              <h2 className="text-lg font-extrabold text-brand-charcoal flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-primary" /> Draft New Project Task
              </h2>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1 rounded-lg text-brand-gray hover:text-brand-charcoal hover:bg-slate-100"
              >
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Task Name */}
              <div>
                <label className="block text-xs font-semibold text-brand-gray uppercase tracking-wider mb-2">Task Title</label>
                <input
                  type="text"
                  {...register('taskName', { required: 'Task Name is required' })}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary/60 outline-none rounded-xl px-4 py-2.5 text-xs text-brand-charcoal"
                  placeholder="e.g. Draft HVAC coordinate drawing"
                />
                {errors.taskName && <p className="text-red-500 text-[10px] mt-1">{errors.taskName.message}</p>}
              </div>

              {/* Project Code selection */}
              <div>
                <label className="block text-xs font-semibold text-brand-gray uppercase tracking-wider mb-2">Associated Project</label>
                <select
                  {...register('projectCode', { required: true })}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary/60 outline-none rounded-xl px-4 py-2.5 text-xs text-brand-charcoal"
                >
                  <option value="SSA-CH-GR01">GR Heights IT Tech Park (SSA-CH-GR01)</option>
                  <option value="SSA-BLR-FH02">Fortis Oncology Wing (SSA-BLR-FH02)</option>
                  <option value="SSA-MUM-ZS03">Zoya Office Complex (SSA-MUM-ZS03)</option>
                </select>
              </div>

              {/* Assigned To */}
              <div>
                <label className="block text-xs font-semibold text-brand-gray uppercase tracking-wider mb-2">Assignee</label>
                <select
                  {...register('assignedTo', { required: true })}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary/60 outline-none rounded-xl px-4 py-2.5 text-xs text-brand-charcoal"
                >
                  <option value="Siddharth Sen">Siddharth Sen (Architect)</option>
                  <option value="Rahul Sharma">Rahul Sharma (MEP Consultant)</option>
                  <option value="Ananya Deshmukh">Ananya Deshmukh (Project Architect)</option>
                  <option value="Kunal Kapoor">Kunal Kapoor (Site Engineer)</option>
                  <option value="Aditi Rao">Aditi Rao (Intern)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Priority */}
                <div>
                  <label className="block text-xs font-semibold text-brand-gray uppercase tracking-wider mb-2">Priority</label>
                  <select
                    {...register('priority', { required: true })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary/60 outline-none rounded-xl px-4 py-2.5 text-xs text-brand-charcoal"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-xs font-semibold text-brand-gray uppercase tracking-wider mb-2">Due Date</label>
                  <input
                    type="date"
                    {...register('dueDate', { required: 'Due date is required' })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary/60 outline-none rounded-xl px-4 py-2.5 text-xs text-brand-charcoal"
                  />
                  {errors.dueDate && <p className="text-red-500 text-[10px] mt-1">{errors.dueDate.message}</p>}
                </div>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-xs font-semibold text-brand-gray uppercase tracking-wider mb-2">Start Date</label>
                <input
                  type="date"
                  {...register('startDate', { required: 'Start date is required' })}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary/60 outline-none rounded-xl px-4 py-2.5 text-xs text-brand-charcoal"
                  defaultValue={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-brand-gray hover:text-brand-charcoal"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/95 text-xs font-bold text-white shadow-md shadow-brand-primary/10 cursor-pointer transition-colors"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
