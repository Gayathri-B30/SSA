import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  availableRoles,
  availablePermissions,
  initialAccessMatrix,
  type AccessMatrixRow
} from '../../data/mockData'
import { Shield, Check, X, ShieldCheck, Sparkles, Plus, AlertCircle } from 'lucide-react'

interface RBACProps {
  defaultTab?: 'roles' | 'permissions' | 'matrix'
}

export const RBAC: React.FC<RBACProps> = ({ defaultTab = 'matrix' }) => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'roles' | 'permissions' | 'matrix'>(defaultTab)

  useEffect(() => {
    setActiveTab(defaultTab)
  }, [defaultTab])
  const [matrix, setMatrix] = useState<AccessMatrixRow[]>(initialAccessMatrix)
  const [roles, setRoles] = useState<string[]>(availableRoles)
  const [newRole, setNewRole] = useState('')
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false)

  // Toggle permission in the matrix
  const handleTogglePermission = (role: string, permission: string) => {
    setMatrix((prev) =>
      prev.map((row) => {
        if (row.role === role) {
          return {
            ...row,
            permissions: {
              ...row.permissions,
              [permission]: !row.permissions[permission],
            },
          };
        }
        return row
      })
    )
  }

  // Add a new role to system
  const handleAddRole = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRole.trim()) return
    const formattedRole = newRole.trim()
    
    if (roles.includes(formattedRole)) {
      alert('Role already exists!')
      return
    }

    setRoles([...roles, formattedRole])
    
    // Add default permissions entry (all read-only by default)
    const newEntry: AccessMatrixRow = {
      role: formattedRole,
      permissions: {
        Create: false,
        Read: true,
        Update: false,
        Delete: false,
        Approve: false,
        Export: false,
      },
    }
    setMatrix([...matrix, newEntry])
    setNewRole('')
    setIsAddRoleOpen(false)
  }

  return (
    <div className="space-y-6 animate-fade-in text-brand-charcoal">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-charcoal tracking-tight sm:text-3xl">RBAC Control Panel</h1>
          <p className="text-xs sm:text-sm text-brand-gray mt-1 font-medium font-sans">
            Configure Role-Based Access Control policies, permissions, and security authorization levels.
          </p>
        </div>

        {activeTab === 'roles' && (
          <button
            onClick={() => setIsAddRoleOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/95 text-xs font-bold text-white shadow-md shadow-brand-primary/10 transition-all duration-200 cursor-pointer animate-fade-in"
          >
            <Plus className="w-4 h-4" /> Define Role
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => navigate('/rbac/matrix')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === 'matrix'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-brand-gray hover:text-brand-charcoal'
          }`}
        >
          Access Matrix
        </button>
        <button
          onClick={() => navigate('/rbac/roles')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === 'roles'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-brand-gray hover:text-brand-charcoal'
          }`}
        >
          Roles
        </button>
        <button
          onClick={() => navigate('/rbac/permissions')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === 'permissions'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-brand-gray hover:text-brand-charcoal'
          }`}
        >
          Permissions Catalogue
        </button>
      </div>

      {/* Access Matrix Panel */}
      {activeTab === 'matrix' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-brand-primary flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed font-medium">
              <strong>Access Matrix Instructions:</strong> Toggle checkboxes in the grid below to instantly assign or revoke security permissions. Active changes are updated globally across the consultancy system.
            </p>
          </div>

          <div className="glass-card rounded-2xl border border-slate-200/80 overflow-hidden bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-brand-charcoal">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200/60 font-bold">
                  <tr>
                    <th className="p-4 w-56">Role</th>
                    {availablePermissions.map((perm: any) => (
                      <th key={perm} className="p-4 text-center">{perm}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {matrix.map((row) => (
                    <tr key={row.role} className="hover:bg-slate-50/40 transition-colors">
                      <td className="p-4 font-bold text-brand-charcoal flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5 text-brand-primary" />
                        {row.role}
                      </td>
                      {availablePermissions.map((perm: any) => {
                        const hasPerm = row.permissions[perm] || false
                        return (
                          <td key={perm} className="p-4 text-center">
                            <label className="inline-flex items-center justify-center cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={hasPerm}
                                onChange={() => handleTogglePermission(row.role, perm)}
                                className="sr-only peer"
                              />
                              <div className="w-8 h-8 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center transition-all peer-checked:bg-primary-50 peer-checked:border-brand-primary/50 peer-checked:text-brand-primary text-slate-300 hover:border-slate-300">
                                {hasPerm ? <Check className="w-4 h-4 text-brand-primary" /> : <X className="w-3.5 h-3.5 text-slate-300" />}
                              </div>
                            </label>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Roles List Panel */}
      {activeTab === 'roles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((role) => (
            <div
              key={role}
              className="glass-card p-5 rounded-2xl border border-slate-200/80 hover:border-brand-primary/20 transition-all duration-300 bg-white shadow-sm"
            >
              <div className="flex items-center gap-2.5 mb-3">
                <div className="p-2 rounded-xl bg-primary-50 text-brand-primary">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-brand-charcoal text-sm">{role}</h3>
              </div>
              <p className="text-xs text-brand-gray leading-relaxed mb-4">
                Authorized role mapping associated with key activities including approvals, model drafting, client communication, and site operations.
              </p>
              <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-[10px] text-slate-500 font-bold">
                <span>Access Profile: <strong className="text-brand-charcoal">Standard</strong></span>
                <span>Active Users: <strong className="text-brand-charcoal">Enabled</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Permissions Catalogue */}
      {activeTab === 'permissions' && (
        <div className="glass-card rounded-2xl border border-slate-200/80 overflow-hidden bg-white shadow-sm">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-sm font-bold text-brand-charcoal uppercase tracking-wider">System Permissions Catalogue</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {[
              { name: 'Create', desc: 'Allows the user to register new items, including new employees, drawing details, material inventory logs, and CRM leads.' },
              { name: 'Read', desc: 'Allows viewing of dashboards, reports, registers, drawings database, and general tables. Minimum baseline permission.' },
              { name: 'Update', desc: 'Enables updating files, editing company settings, modifying Kanban card columns, and adjusting project stages.' },
              { name: 'Delete', desc: 'Allows deletion of entries from database. Restricted to Super Admin access profile.' },
              { name: 'Approve', desc: 'Enables formal approval of drawings, leave requests, vendor ratings, and contract changes.' },
              { name: 'Export', desc: 'Allows generating PDF blueprints, summary lists, and exporting accounting registers to Excel files.' },
            ].map((p) => (
              <div key={p.name} className="p-4 flex items-start gap-4 hover:bg-slate-50/40 transition-colors">
                <div className="p-2.5 rounded-lg bg-primary-50 text-brand-primary font-mono font-bold text-xs w-20 text-center flex-shrink-0 border border-primary-100">
                  {p.name}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-brand-charcoal">{p.name} Policy Access</h4>
                  <p className="text-xs text-brand-gray mt-1 leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Define Role Modal */}
      {isAddRoleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 text-brand-charcoal">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
              <h2 className="text-base font-extrabold text-brand-charcoal flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-primary" />
                Define Custom System Role
              </h2>
              <button
                onClick={() => setIsAddRoleOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleAddRole} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Role Title
                </label>
                <input
                  type="text"
                  required
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 outline-none rounded-xl px-4 py-2.5 text-xs text-slate-800"
                  placeholder="e.g. Lead Project Manager"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddRoleOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/95 text-xs font-bold text-white shadow-md shadow-brand-primary/10 transition-colors cursor-pointer"
                >
                  Create Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
