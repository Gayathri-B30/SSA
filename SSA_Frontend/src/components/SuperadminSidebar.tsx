import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../utils/useAuth'
import {
  LayoutDashboard,
  Building2,
  LogOut,
  AlertCircle,
  ChevronLeft
} from 'lucide-react'

interface SuperadminSidebarProps {
  activeMenu: 'dashboard' | 'company'
  onMenuChange?: (menu: 'dashboard' | 'company') => void
  isOpen?: boolean
  onClose?: () => void
  isCollapsed?: boolean
  onToggleCollapse?: (collapsed: boolean) => void
}

export const SuperadminSidebar: React.FC<SuperadminSidebarProps> = ({
  activeMenu,
  onMenuChange,
  isOpen = false,
  onClose,
  isCollapsed = false,
  onToggleCollapse
}) => {
  const { logout } = useAuth()
  const navigate = useNavigate()

  // State for custom logout confirmation modal
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const handleMenuClick = (menu: 'dashboard' | 'company') => {
    if (onMenuChange) {
      onMenuChange(menu)
    } else {
      if (menu === 'dashboard') {
        navigate('/superadmin/dashboard')
      } else {
        navigate(`/superadmin/dashboard?tab=${menu}`)
      }
    }
    // Automatically close sidebar on mobile when navigating
    if (onClose) {
      onClose()
    }
  }

  const handleLogout = () => {
    setShowLogoutConfirm(true)
  }

  return (
    <>
      {/* Mobile Sidebar Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Custom Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop overlay (no blur) */}
          <div
            className="fixed inset-0 bg-black/60 transition-opacity"
            onClick={() => setShowLogoutConfirm(false)}
          />

          {/* Modal box */}
          <div className="bg-white rounded-2xl max-w-sm w-full border border-zinc-200 shadow-2xl p-6 relative z-10 text-center animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4 text-brand-primary">
              <AlertCircle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-black text-zinc-900 tracking-tight">Confirm Logout</h3>
            <p className="text-xs text-zinc-500 mt-2 leading-relaxed font-bold">
              Are you sure you want to log out of the SSA Superadmin Panel?
            </p>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2.5 bg-brand-cancel hover:bg-brand-cancel-hover text-black text-xs font-black rounded-xl uppercase transition-colors tracking-wide cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutConfirm(false)
                  logout()
                  navigate('/superadmin-login')
                }}
                className="px-4 py-2.5 bg-brand-primary hover:bg-primary-600 text-white text-xs font-black rounded-xl uppercase transition-colors tracking-wide cursor-pointer shadow-md shadow-brand-primary/10"
              >
                Yes, Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      <aside
        className={`h-screen fixed top-0 left-0 bg-brand-sidebar border-r border-border-base text-white flex flex-col justify-between z-50 shrink-0 select-none transition-all duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
          } ${isCollapsed ? 'w-64 md:w-20' : 'w-64'}`}
      >
        {/* Sidebar Header */}
        <div className={`h-16 border-b border-border-base flex items-center shrink-0 bg-brand-sidebar transition-all duration-300 relative ${isCollapsed ? 'md:justify-center md:px-4 px-6 justify-between' : 'justify-between px-6'
          }`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
              <img src="/logo.png" alt="SSA Logo" className="w-full h-full object-contain" />
            </div>
            <div className={`leading-none text-left transition-opacity duration-300 ${isCollapsed ? 'md:hidden opacity-0' : 'opacity-100'}`}>
              <div className="font-bold text-sm tracking-tight text-white whitespace-nowrap">
                SSA
              </div>
              <div className="text-[7px] tracking-widest text-brand-gold mt-0.5 uppercase whitespace-nowrap font-bold">
                SUPERADMIN PANEL
              </div>
            </div>
          </div>

          {/* Collapse Button - only visible on desktop screen size */}
          <button
            onClick={() => onToggleCollapse?.(!isCollapsed)}
            className={`hidden md:block p-1 rounded-lg text-gray-400 hover:text-white hover:bg-slate-800 transition-colors ${isCollapsed
              ? 'absolute -right-3 top-1/2 -translate-y-1/2 bg-brand-sidebar border border-slate-800/80 shadow-md z-50'
              : ''
              }`}
          >
            <ChevronLeft className={`w-5 h-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Sidebar Body Navigation */}
        <div className={`flex-grow py-6 overflow-y-auto text-left transition-all duration-300 ${isCollapsed ? 'md:px-2 px-4' : 'px-4'}`}>
          <nav className="space-y-1 select-none">
            <button
              onClick={() => handleMenuClick('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${activeMenu === 'dashboard'
                ? 'text-white bg-brand-primary shadow-md shadow-brand-primary/25'
                : 'text-gray-400 hover:text-white hover:bg-slate-800/60'
                } ${isCollapsed ? 'md:justify-center' : ''}`}
              title="Dashboard"
            >
              <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
              <span className={`transition-opacity duration-300 ${isCollapsed ? 'md:hidden opacity-0' : 'opacity-100'}`}>Dashboard</span>
            </button>
            <button
              onClick={() => handleMenuClick('company')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${activeMenu === 'company'
                ? 'text-white bg-brand-primary shadow-md shadow-brand-primary/25'
                : 'text-gray-400 hover:text-white hover:bg-slate-800/60'
                } ${isCollapsed ? 'md:justify-center' : ''}`}
              title="Company"
            >
              <Building2 className="w-5 h-5 flex-shrink-0" />
              <span className={`transition-opacity duration-300 ${isCollapsed ? 'md:hidden opacity-0' : 'opacity-100'}`}>Company</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer User Details */}
        <div className="p-4 border-t border-slate-800/80 flex flex-col gap-2 bg-slate-900/40">
          <div className={`flex items-center gap-3 mb-1 text-left ${isCollapsed ? 'md:justify-center' : ''}`}>
            <div className="w-9 h-9 rounded-full bg-brand-primary flex items-center justify-center text-white font-semibold border border-brand-gold/30 flex-shrink-0">
              SA
            </div>
            <div className={`flex-1 overflow-hidden leading-tight ${isCollapsed ? 'md:hidden' : ''}`}>
              <p className="text-xs font-semibold text-white truncate">Super Admin</p>
              <p className="text-[10px] text-gray-400 truncate">superadmin@example.com</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-red-400 hover:bg-red-950/20 transition-all duration-200 cursor-pointer text-left ${isCollapsed ? 'md:justify-center' : ''}`}
            title="Logout"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className={`${isCollapsed ? 'md:hidden' : ''}`}>Logout</span>
          </button>
        </div>
      </aside >
    </>
  )
}
