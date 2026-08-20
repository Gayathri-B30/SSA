import React, { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '../components/ProtectedRoute'
import { CompanyLayout } from '../layouts/CompanyLayout'

// Lazy Loading Pages
const Login = lazy(() => import('../pages/Login').then(m => ({ default: m.Login })))
const ForgotPassword = lazy(() => import('../pages/ForgotPassword').then(m => ({ default: m.ForgotPassword })))



// Superadmin Pages
const SuperadminDashboard = lazy(() => import('../pages/superadmin/Dashboard').then(m => ({ default: m.SuperadminDashboard })))
const AddCompany = lazy(() => import('../pages/superadmin/AddCompany').then(m => ({ default: m.AddCompany })))

// Company Pages
const DashboardOverview = lazy(() => import('../pages/company/DashboardOverview').then(m => ({ default: m.DashboardOverview })))
const CompanySetup = lazy(() => import('../pages/company/CompanySetup').then(m => ({ default: m.CompanySetup })))
const RBAC = lazy(() => import('../pages/company/RBAC').then(m => ({ default: m.RBAC })))
const Employees = lazy(() => import('../pages/company/Employees').then(m => ({ default: m.Employees })))
const CRM = lazy(() => import('../pages/company/CRM').then(m => ({ default: m.CRM })))
const CreateLead = lazy(() => import('../pages/company/leads/CreateLead').then(m => ({ default: m.CreateLead })))
const CategoryQuestionManagerPage = lazy(() => import('../pages/company/leads/CategoryQuestionManagerPage').then(m => ({ default: m.CategoryQuestionManagerPage })))
const Projects = lazy(() => import('../pages/company/Projects').then(m => ({ default: m.Projects })))
const Tasks = lazy(() => import('../pages/company/Tasks').then(m => ({ default: m.Tasks })))
const Resources = lazy(() => import('../pages/company/Resources').then(m => ({ default: m.Resources })))
const Vendors = lazy(() => import('../pages/company/Vendors').then(m => ({ default: m.Vendors })))
const Inventory = lazy(() => import('../pages/company/Inventory').then(m => ({ default: m.Inventory })))
const Documents = lazy(() => import('../pages/company/Documents').then(m => ({ default: m.Documents })))
const TemplatesSOP = lazy(() => import('../pages/company/TemplatesSOP').then(m => ({ default: m.TemplatesSOP })))
const Reports = lazy(() => import('../pages/company/Reports').then(m => ({ default: m.Reports })))
const SettingsPage = lazy(() => import('../pages/company/SettingsPage').then(m => ({ default: m.SettingsPage })))

// Loading Indicator
const PageLoader = () => (
  <div className="w-screen h-screen flex items-center justify-center bg-brand-bg">
    <div className="animate-spin w-8 h-8 rounded-full border-4 border-brand-primary border-t-transparent" />
  </div>
)

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/superadmin-login" element={<Navigate to="/login" replace />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        {/* Branch Routes */}
        <Route
          path="/branch/dashboard"
          element={
            <ProtectedRoute allowedRoles={['Branch']}>
              <CompanyLayout>
                <DashboardOverview />
              </CompanyLayout>
            </ProtectedRoute>
          }
        />

        {/* Superadmin Routes */}
        <Route
          path="/superadmin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['Super Admin']}>
              <SuperadminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/add-company"
          element={
            <ProtectedRoute allowedRoles={['Super Admin']}>
              <AddCompany />
            </ProtectedRoute>
          }
        />

        {/* Protected Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <CompanyLayout>
                <DashboardOverview />
              </CompanyLayout>
            </ProtectedRoute>
          }
        />

        {/* Organization Routes */}
        <Route
          path="/organization/company-setup"
          element={
            <ProtectedRoute>
              <CompanyLayout>
                <CompanySetup />
              </CompanyLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/organization/departments"
          element={
            <ProtectedRoute>
              <CompanyLayout>
                <CompanySetup defaultTab="departments" />
              </CompanyLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/organization/branches"
          element={
            <ProtectedRoute>
              <CompanyLayout>
                <CompanySetup defaultTab="branches" />
              </CompanyLayout>
            </ProtectedRoute>
          }
        />

        {/* RBAC Routes */}
        <Route
          path="/rbac/roles"
          element={
            <ProtectedRoute>
              <CompanyLayout>
                <RBAC defaultTab="roles" />
              </CompanyLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/rbac/permissions"
          element={
            <ProtectedRoute>
              <CompanyLayout>
                <RBAC defaultTab="permissions" />
              </CompanyLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/rbac/matrix"
          element={
            <ProtectedRoute>
              <CompanyLayout>
                <RBAC defaultTab="matrix" />
              </CompanyLayout>
            </ProtectedRoute>
          }
        />

        {/* Employees Routes */}
        <Route
          path="/employees/list"
          element={
            <ProtectedRoute allowedRoles={['Company', 'Super Admin', 'Branch']}>
              <CompanyLayout>
                <Employees defaultTab="list" />
              </CompanyLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/employees/attendance"
          element={
            <ProtectedRoute>
              <CompanyLayout>
                <Employees defaultTab="attendance" />
              </CompanyLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/employees/leaves"
          element={
            <ProtectedRoute>
              <CompanyLayout>
                <Employees defaultTab="leaves" />
              </CompanyLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/employees/performance"
          element={
            <ProtectedRoute>
              <CompanyLayout>
                <Employees defaultTab="performance" />
              </CompanyLayout>
            </ProtectedRoute>
          }
        />

        {/* CRM Routes */}
        <Route
          path="/crm/leads"
          element={
            <ProtectedRoute allowedRoles={['Company', 'Branch', 'Super Admin']}>
              <CompanyLayout>
                <CRM defaultTab="leads" />
              </CompanyLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/crm/leads/create"
          element={
            <ProtectedRoute allowedRoles={['Company', 'Branch', 'Super Admin']}>
              <CompanyLayout>
                <CreateLead />
              </CompanyLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/crm/leads/edit/:id"
          element={
            <ProtectedRoute allowedRoles={['Company', 'Branch', 'Super Admin']}>
              <CompanyLayout>
                <CreateLead />
              </CompanyLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/crm/leads/categories-questions"
          element={
            <ProtectedRoute allowedRoles={['Company', 'Branch', 'Super Admin']}>
              <CompanyLayout>
                <CategoryQuestionManagerPage />
              </CompanyLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/crm/opportunities"
          element={
            <ProtectedRoute allowedRoles={['Company', 'Branch', 'Super Admin']}>
              <CompanyLayout>
                <CRM defaultTab="opportunities" />
              </CompanyLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/crm/clients"
          element={
            <ProtectedRoute allowedRoles={['Company', 'Branch', 'Super Admin']}>
              <CompanyLayout>
                <CRM defaultTab="clients" />
              </CompanyLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/crm/drawings"
          element={
            <ProtectedRoute allowedRoles={['Company', 'Branch', 'Super Admin']}>
              <CompanyLayout>
                <CRM defaultTab="drawings" />
              </CompanyLayout>
            </ProtectedRoute>
          }
        />

        {/* Projects Routes */}
        <Route
          path="/projects/list"
          element={
            <ProtectedRoute>
              <CompanyLayout>
                <Projects defaultTab="projects" />
              </CompanyLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/milestones"
          element={
            <ProtectedRoute>
              <CompanyLayout>
                <Projects defaultTab="milestones" />
              </CompanyLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/tasks"
          element={
            <ProtectedRoute>
              <CompanyLayout>
                <Tasks />
              </CompanyLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/resources"
          element={
            <ProtectedRoute>
              <CompanyLayout>
                <Resources />
              </CompanyLayout>
            </ProtectedRoute>
          }
        />

        {/* Vendor Routes */}
        <Route
          path="/vendors/list"
          element={
            <ProtectedRoute>
              <CompanyLayout>
                <Vendors defaultTab="vendors" />
              </CompanyLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendors/contractors"
          element={
            <ProtectedRoute>
              <CompanyLayout>
                <Vendors defaultTab="contractors" />
              </CompanyLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendors/approvals"
          element={
            <ProtectedRoute>
              <CompanyLayout>
                <Vendors defaultTab="approvals" />
              </CompanyLayout>
            </ProtectedRoute>
          }
        />

        {/* Inventory Routes */}
        <Route
          path="/inventory/assets"
          element={
            <ProtectedRoute>
              <CompanyLayout>
                <Inventory defaultTab="assets" />
              </CompanyLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory/materials"
          element={
            <ProtectedRoute>
              <CompanyLayout>
                <Inventory defaultTab="materials" />
              </CompanyLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory/stock"
          element={
            <ProtectedRoute>
              <CompanyLayout>
                <Inventory defaultTab="stock" />
              </CompanyLayout>
            </ProtectedRoute>
          }
        />

        {/* Document Control Routes */}
        <Route
          path="/documents/drawings"
          element={
            <ProtectedRoute>
              <CompanyLayout>
                <Documents defaultTab="drawings" />
              </CompanyLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents/brief"
          element={
            <ProtectedRoute>
              <CompanyLayout>
                <Documents defaultTab="brief" />
              </CompanyLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents/area"
          element={
            <ProtectedRoute>
              <CompanyLayout>
                <Documents defaultTab="area" />
              </CompanyLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents/mom"
          element={
            <ProtectedRoute>
              <CompanyLayout>
                <Documents defaultTab="mom" />
              </CompanyLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents/site"
          element={
            <ProtectedRoute>
              <CompanyLayout>
                <Documents defaultTab="site" />
              </CompanyLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents/rfi"
          element={
            <ProtectedRoute>
              <CompanyLayout>
                <Documents defaultTab="rfi" />
              </CompanyLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents/qaqc"
          element={
            <ProtectedRoute>
              <CompanyLayout>
                <Documents defaultTab="qaqc" />
              </CompanyLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents/material"
          element={
            <ProtectedRoute>
              <CompanyLayout>
                <Documents defaultTab="material" />
              </CompanyLayout>
            </ProtectedRoute>
          }
        />

        {/* Templates & SOPs */}
        <Route
          path="/templates"
          element={
            <ProtectedRoute>
              <CompanyLayout>
                <TemplatesSOP defaultTab="templates" />
              </CompanyLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/sop-library"
          element={
            <ProtectedRoute>
              <CompanyLayout>
                <TemplatesSOP defaultTab="sops" />
              </CompanyLayout>
            </ProtectedRoute>
          }
        />

        {/* Reports & Settings */}
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <CompanyLayout>
                <Reports />
              </CompanyLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <CompanyLayout>
                <SettingsPage />
              </CompanyLayout>
            </ProtectedRoute>
          }
        />

        {/* Fallbacks */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  )
}
