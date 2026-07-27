import React from 'react'
import { SuperadminSidebar } from '../components/SuperadminSidebar'

interface SuperadminLayoutProps {
  children: React.ReactNode
}

export const SuperadminLayout: React.FC<SuperadminLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen w-screen bg-brand-bg overflow-hidden">
      {/* Superadmin Sidebar navigation */}
      <SuperadminSidebar activeMenu="dashboard" />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <main className="flex-1 overflow-y-auto px-6 py-8 md:px-10">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
