import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { initialNotifications, type AppNotification } from '../data/mockData'
import { useTheme } from '../utils/theme'
import type { ThemeMode } from '../utils/themeConfig'
import {
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Bell,
  LogOut,
  Search,
  LayoutDashboard,
  Building2,
  Users,
  Compass,
  ChevronLeft,
  AlertCircle
} from 'lucide-react'

// Define the Menu Structure
interface SubMenuItem {
  label: string
  path: string
}

interface MenuItem {
  label: string
  path?: string
  icon: React.ComponentType<any>
  subItems?: SubMenuItem[]
}

export const CompanyLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications)
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    Foundation: false,
    RBAC: false,
    Employees: false,
    CRM: false,
    Projects: false,
    Vendors: false,
    Inventory: false,
    Documents: false,
  })

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  // Close overlays on route change and auto expand active menus
  useEffect(() => {
    setIsMobileOpen(false)
    setIsNotifOpen(false)
    setIsProfileOpen(false)

    if (location.pathname.startsWith('/employees/')) {
      setExpandedMenus((prev) => ({ ...prev, Employees: true }))
    }
    if (location.pathname.startsWith('/organization/')) {
      setExpandedMenus((prev) => ({ ...prev, Foundation: true }))
    }
    if (location.pathname.startsWith('/crm/')) {
      setExpandedMenus((prev) => ({ ...prev, CRM: true }))
    }
  }, [location.pathname])

  const toggleSubMenu = (label: string) => {
    setExpandedMenus((prev) => ({ ...prev, [label]: !prev[label] }))
  }

  const handleLogout = () => {
    setShowLogoutConfirm(true)
  }

  // Count unread notifications
  const unreadCount = notifications.filter((n) => n.unread).length

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)))
  }

  // Sidebar Menu Configuration
  const menuItems: MenuItem[] = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    {
      label: 'Foundation',
      icon: Building2,
      subItems: [
        // { label: 'Company Setup', path: '/organization/company-setup' },
        // { label: 'Departments', path: '/organization/departments' },
        { label: 'Branch / Division', path: '/organization/branches' },
        // { label: 'Roles', path: '/rbac/roles' },
        // { label: 'Permissions', path: '/rbac/permissions' },
      ],
    },
    {
      label: 'Employees',
      icon: Users,
      subItems: [
        { label: 'Employees List', path: '/employees/list' },
        { label: 'Attendance', path: '/employees/attendance' },
        { label: 'Leave Management', path: '/employees/leaves' },
        { label: 'Performance', path: '/employees/performance' },
      ],
    },
    {
      label: 'CRM',
      icon: Compass,
      subItems: [
        { label: 'Leads', path: '/crm/leads' },
        // { label: 'Opportunities', path: '/crm/opportunities' },
        { label: 'Clients', path: '/crm/clients' },
      ],
    },
    // {
    //   label: 'Projects',
    //   icon: Layers,
    //   subItems: [
    //     { label: 'Projects', path: '/projects/list' },
    //     { label: 'Milestones', path: '/projects/milestones' },
    //     { label: 'Tasks', path: '/projects/tasks' },
    //     { label: 'Resources', path: '/projects/resources' },
    //   ],
    // },
    // {
    //   label: 'Vendors',
    //   icon: Truck,
    //   subItems: [
    //     { label: 'Vendors', path: '/vendors/list' },
    //     { label: 'Contractors', path: '/vendors/contractors' },
    //     { label: 'Approvals', path: '/vendors/approvals' },
    //   ],
    // },
    // {
    //   label: 'Inventory',
    //   icon: Box,
    //   subItems: [
    //     { label: 'Assets', path: '/inventory/assets' },
    //     { label: 'Materials', path: '/inventory/materials' },
    //     { label: 'Stock', path: '/inventory/stock' },
    //   ],
    // },
    // {
    //   label: 'Documents',
    //   icon: FileText,
    //   subItems: [
    //     { label: 'Drawings', path: '/documents/drawings' },
    //     { label: 'RFI', path: '/documents/rfi' },
    //     { label: 'MOM', path: '/documents/mom' },
    //     { label: 'Site Reports', path: '/documents/site' },
    //     { label: 'Material Approvals', path: '/documents/material' },
    //   ],
    // },
    // { label: 'Templates', path: '/templates', icon: Bookmark },
    // { label: 'SOP Library', path: '/sop-library', icon: Library },
    // { label: 'Analytics', path: '/reports', icon: BarChart3 },
    // { label: 'Settings', path: '/settings', icon: Settings },
  ]

  // Render Sidebar Links
  const renderNavLinks = (isMobile: boolean = false) => {
    const filteredMenuItems = menuItems.filter(item => {
      if (user?.role === 'Branch') {
        return item.label === 'Dashboard' || item.label === 'Employees' || item.label === 'CRM';
      }
      return true;
    }).map(item => {
      if (user?.role === 'Branch' && item.label === 'Dashboard') {
        return { ...item, path: '/branch/dashboard' };
      }
      return item;
    });

    return (
      <nav className="space-y-1 px-3 py-4 select-none">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon
          const hasSubItems = !!item.subItems
          const isExpanded = expandedMenus[item.label]
          const isItemActive = (() => {
            if (item.label === 'Employees') {
              return location.pathname.startsWith('/employees/')
            }
            if (item.label === 'CRM') {
              return location.pathname.startsWith('/crm/')
            }
            if (item.path) {
              return location.pathname === item.path
            }
            return !!item.subItems?.some((sub) => location.pathname === sub.path)
          })()

          return (
            <div key={item.label} className="mb-1">
              {hasSubItems ? (
                <div>
                  <button
                    onClick={() => toggleSubMenu(item.label)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${isItemActive
                      ? 'text-white bg-slate-800'
                      : 'text-gray-400 hover:text-white hover:bg-slate-800/60'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      {(!isSidebarCollapsed || isMobile) && <span>{item.label}</span>}
                    </div>
                    {(!isSidebarCollapsed || isMobile) && (
                      isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                  {isExpanded && (!isSidebarCollapsed || isMobile) && (
                    <div className="mt-1 ml-6 pl-2 border-l border-slate-800 space-y-1">
                      {item.subItems?.map((sub) => {
                        const isSubActive = location.pathname === sub.path
                        return (
                          <Link
                            key={sub.label}
                            to={sub.path}
                            className={`block px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${isSubActive
                              ? 'text-white bg-brand-primary shadow-sm shadow-brand-primary/25 border-l-2 border-brand-gold'
                              : 'text-gray-400 hover:text-white hover:bg-slate-800/40'
                              }`}
                          >
                            {sub.label}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to={item.path || '#'}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${isItemActive
                    ? 'text-white bg-brand-primary shadow-md shadow-brand-primary/25'
                    : 'text-gray-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {(!isSidebarCollapsed || isMobile) && <span>{item.label}</span>}
                </Link>
              )}
            </div>
          )
        })}
        {/* Logout Link */}
        {/* <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-950/20 transition-all duration-200"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {(!isSidebarCollapsed || isMobile) && <span>Logout</span>}
        </button> */}
      </nav>
    )
  }

  // Get Breadcrumbs from URL
  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean)
    if (paths.length === 0) return ['Dashboard']
    return paths.map((path) =>
      path
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase())
    )
  }

  const resolveBreadcrumbPath = (index: number) => {
    const paths = location.pathname.split('/').filter(Boolean)
    const constructedPath = '/' + paths.slice(0, index + 1).join('/')

    // Check if this exact path is in menuItems or their subItems
    for (const item of menuItems) {
      if (item.path === constructedPath) return item.path
      if (item.subItems) {
        for (const sub of item.subItems) {
          if (sub.path === constructedPath) return sub.path
        }
      }
    }

    // If not found exactly, check if there's any menu item or subitem that starts with this path
    for (const item of menuItems) {
      if (item.path?.startsWith(constructedPath + '/')) return item.path
      if (item.subItems) {
        for (const sub of item.subItems) {
          if (sub.path.startsWith(constructedPath + '/')) return sub.path
        }
      }
    }

    // Default to the constructed path itself
    return constructedPath
  }

  return (
    <div className="min-h-screen bg-brand-bg text-brand-charcoal flex font-sans selection:bg-brand-primary selection:text-white">
      {/* Custom Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop overlay (no blur) */}
          <div
            className="fixed inset-0 bg-black/60 transition-opacity"
            onClick={() => setShowLogoutConfirm(false)}
          />

          {/* Modal box */}
          <div className="bg-bg-panel rounded-2xl max-w-sm w-full border border-border-base shadow-2xl p-6 relative z-10 text-center animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center mx-auto mb-4 text-brand-primary">
              <AlertCircle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-black text-text-base tracking-tight">Confirm Logout</h3>
            <p className="text-xs text-text-muted mt-2 leading-relaxed font-bold">
              Are you sure you want to log out of the SSA Portal?
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
                  navigate('/dashboard')
                }}
                className="px-4 py-2.5 bg-brand-primary hover:bg-primary-600 text-white text-xs font-black rounded-xl uppercase transition-colors tracking-wide cursor-pointer shadow-md shadow-brand-primary/10"
              >
                Yes, Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. Desktop Fixed Sidebar */}
      <aside
        className={`hidden md:flex flex-col h-screen sticky top-0 bg-brand-sidebar border-r border-border-base transition-all duration-300 z-30 ${isSidebarCollapsed ? 'w-20' : 'w-64'
          }`}
      >
        {/* Logo Area */}
        <div className={`h-16 border-b border-border-base flex items-center shrink-0 bg-brand-sidebar transition-all duration-300 relative ${isSidebarCollapsed ? 'justify-center px-4' : 'justify-between px-6'
          }`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
              <img src="/logo.png" alt="SSA Logo" className="w-full h-full object-contain" />
            </div>
            {!isSidebarCollapsed && (
              <div className="leading-none text-left">
                <div className="font-bold text-sm tracking-tight text-white whitespace-nowrap">
                  SSA ERP
                </div>
                <div className="text-[7px] tracking-widest text-brand-gold mt-0.5 uppercase whitespace-nowrap font-bold">
                  Plan. Design. Deliver.
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className={`p-1 rounded-lg text-gray-400 hover:text-white hover:bg-slate-800 transition-colors ${isSidebarCollapsed
              ? 'absolute -right-3 top-1/2 -translate-y-1/2 bg-brand-sidebar border border-slate-800/80 shadow-md z-50'
              : ''
              }`}
          >
            <ChevronLeft className={`w-5 h-5 transition-transform ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {renderNavLinks()}

          {/* Need Help support widget
          {!isSidebarCollapsed && (
            <div className="mx-4 my-6 p-4 rounded-2xl bg-brand-primary text-white space-y-3 relative overflow-hidden shadow-lg shadow-brand-primary/15">
              <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-white/5 rounded-full pointer-events-none" />
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/10 text-white flex-shrink-0">
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold whitespace-nowrap">Need Help?</h4>
                  <p className="text-[10px] text-white/70">We're here to support you</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/settings')}
                className="w-full py-2 px-3 bg-brand-gold hover:bg-brand-gold/90 text-[10px] font-bold text-white rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm shadow-brand-gold/20"
              >
                Contact Support <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )} */}
        </div>

        {/* Footer Profile summary / Logout button */}
        {user && (
          <div className="p-4 border-t border-white/10 flex flex-col gap-2 bg-transparent">
            {/* {!isSidebarCollapsed && (
              <div className="flex items-center gap-3 mb-1">
                <div className="w-9 h-9 rounded-full bg-brand-primary flex items-center justify-center text-white font-semibold border border-brand-gold/30 flex-shrink-0">
                  {user.name.charAt(0)}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                  <p className="text-[10px] text-gray-400 truncate">{user.role}</p>
                </div>
              </div>
            )} */}
            <button
              onClick={handleLogout}
              className={`w-5 flex items-center gap-3 px-3 py-2 rounded-xl text-0 font-medium text-red-400 hover:bg-brand-primary/0 hover:text-red-200 transition-all duration-200 ${isSidebarCollapsed ? 'justify-center' : ''
                }`}
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {!isSidebarCollapsed && <span>Logout</span>}
            </button>
          </div>
        )}
      </aside>

      {/* 2. Mobile Drawer Sidebar */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-64 bg-brand-sidebar border-r border-slate-800 flex flex-col h-full animate-slide-in relative">
            <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-brand-sidebar">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
                  <img src="/logo.png" alt="SSA Logo" className="w-full h-full object-contain" />
                </div>
                <div className="leading-none text-left">
                  <div className="font-bold text-sm tracking-tight text-white whitespace-nowrap">
                    SSA ERP
                  </div>
                  <div className="text-[7px] tracking-widest text-brand-gold mt-0.5 uppercase whitespace-nowrap font-bold">
                    Plan. Design. Deliver.
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {renderNavLinks(true)}
            </div>
            {/* {user && (
              <div className="p-4 border-t border-slate-800 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-brand-primary flex items-center justify-center text-white font-bold flex-shrink-0">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{user.name}</p>
                    <p className="text-xs text-gray-400">{user.role}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-950/20 transition-all duration-200"
                >
                  <LogOut className="w-5 h-5 flex-shrink-0" />
                  <span>Logout</span>
                </button>
              </div>
            )} */}

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-6 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-brand-primary/20 hover:text-red-300 transition-all duration-200"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              <span>Logout</span>
            </button>
          </div>
          {/* Touch overlay to close */}
          <div className="flex-1" onClick={() => setIsMobileOpen(false)} />
        </div>
      )}

      {/* 3. Main Work Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Top Header */}
        <header className="sticky top-0 z-20 h-16 bg-bg-panel border-b border-border-base shadow-sm flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-2 rounded-xl text-brand-charcoal hover:bg-slate-100 md:hidden transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Breadcrumbs */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
              <span className="hover:text-brand-primary font-medium transition-colors cursor-pointer" onClick={() => navigate('/dashboard')}>
                Home
              </span>
              {getBreadcrumbs().map((b, index) => {
                const destination = resolveBreadcrumbPath(index);
                const isLast = index === getBreadcrumbs().length - 1;
                return (
                  <React.Fragment key={index}>
                    <span className="text-slate-300">/</span>
                    <span
                      onClick={() => navigate(destination)}
                      className={`hover:text-brand-primary transition-colors cursor-pointer ${isLast ? 'text-brand-primary font-bold' : 'font-medium'
                        }`}
                    >
                      {b}
                    </span>
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="hidden lg:flex items-center gap-2 bg-bg-base border border-border-base px-3.5 py-1.5 rounded-xl w-64 text-text-muted focus-within:border-brand-primary/50 focus-within:ring-1 focus-within:ring-brand-primary/20 transition-colors">
              <Search className="w-4 h-4 text-text-muted/60" />
              <input
                type="text"
                placeholder="Search drawings, leads..."
                className="bg-transparent border-none text-xs text-brand-charcoal placeholder-text-muted/50 outline-none w-full"
              />
            </div>

            {/* Theme Toggle Button Group */}
            <div className="flex items-center gap-1 bg-bg-base border border-border-base p-1 rounded-xl">
              {[
                { mode: 'light', icon: '☀️', title: 'Light' },
                { mode: 'dark', icon: '🌙', title: 'Dark' },
                { mode: 'system', icon: '🖥️', title: 'System' },
              ].map(({ mode, icon, title }) => {
                const isActive = theme === mode
                return (
                  <button
                    key={mode}
                    onClick={() => setTheme(mode as ThemeMode)}
                    title={title}
                    className={`w-6 h-6 rounded-lg text-[10px] flex items-center justify-center transition-all cursor-pointer ${isActive
                      ? 'bg-bg-panel text-brand-primary shadow-sm border border-border-base'
                      : 'text-text-muted hover:text-text-base'
                      }`}
                  >
                    {icon}
                  </button>
                )
              })}
            </div>

            {/* Notification bell and drawer */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsNotifOpen(!isNotifOpen)
                  setIsProfileOpen(false)
                }}
                className="p-2 rounded-xl text-text-muted hover:bg-bg-base hover:text-text-base transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-brand-primary text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications panel dropdown */}
              {isNotifOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-bg-panel border border-border-base shadow-2xl p-4 z-40 animate-fade-in text-sm text-text-base">
                  <div className="flex items-center justify-between border-b border-border-base pb-2.5 mb-3">
                    <h4 className="font-bold text-text-base">Notifications</h4>
                    <div className="flex gap-2">
                      <button
                        onClick={markAllAsRead}
                        className="text-[10px] text-brand-primary hover:text-brand-primary/80 font-bold uppercase tracking-wider cursor-pointer"
                      >
                        Mark All Read
                      </button>
                      <span className="text-border-base">|</span>
                      <button
                        onClick={clearAllNotifications}
                        className="text-[10px] text-text-muted hover:text-text-base font-bold uppercase tracking-wider cursor-pointer"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-2.5 pr-1 no-scrollbar">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-text-muted text-center py-6">No new notifications</p>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => markAsRead(notif.id)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer ${notif.unread
                            ? 'bg-primary-50 dark:bg-primary-950/20 border-primary-100 dark:border-primary-900/50 hover:bg-primary-100/60 dark:hover:bg-primary-900/30'
                            : 'bg-bg-base border-border-base hover:bg-slate-100 dark:hover:bg-slate-800/60'
                            }`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <span className="font-semibold text-xs text-text-base">{notif.title}</span>
                            <span className="text-[9px] text-text-muted whitespace-nowrap">{notif.time}</span>
                          </div>
                          <p className="text-xs text-text-muted mt-1 leading-relaxed">{notif.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => {
                    setIsProfileOpen(!isProfileOpen)
                    setIsNotifOpen(false)
                  }}
                  className="flex items-center gap-2.5 focus:outline-none cursor-pointer hover:bg-bg-base p-1.5 rounded-xl transition-all duration-200"
                >
                  <div className="w-8 h-8 rounded-xl bg-primary-50 dark:bg-primary-950/30 border border-primary-200 dark:border-primary-900/50 flex items-center justify-center text-brand-primary font-bold flex-shrink-0">
                    {user.name.charAt(0)}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-semibold text-text-base truncate">{user.name}</p>
                    <p className="text-[10px] text-text-muted truncate">{user.role}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-text-muted hidden sm:block" />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-48 rounded-2xl bg-bg-panel border border-border-base shadow-2xl p-2 z-40 animate-fade-in text-text-base">
                    <div className="px-3 py-0 border-b border-border-base">
                      {/* <p className="text-xs font-semibold text-text-base truncate">{user.name}</p>
                      <p className="text-[10px] text-text-muted truncate">{user.role}</p> */}
                    </div>
                    {/* <Link
                      to="/settings"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-text-muted hover:bg-bg-base hover:text-text-base transition-colors mt-1"
                    >
                      <User className="w-4 h-4 text-text-muted" />
                      Profile Settings
                    </Link> */}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-brand-primary hover:bg-primary-50 dark:hover:bg-primary-950/30 hover:text-primary-700 transition-colors mt-1 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-brand-primary" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Content Body Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 relative">
          {/* Brand Subtle Glow Background Elements */}
          {/* <div className="absolute top-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-brand-primary/3 blur-[120px] pointer-events-none z-0" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[35%] h-[35%] rounded-full bg-brand-gold/2 blur-[120px] pointer-events-none z-0" /> */}

          <div className="relative z-10 w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
