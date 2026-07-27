import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    const isSuperadminPath = location.pathname.startsWith('/superadmin')
    const loginRedirectPath = isSuperadminPath ? '/superadmin-login' : '/login'
    return <Navigate to={loginRedirectPath} state={{ from: location }} replace />
  }

  // If a branch user tries to access a non-branch route
  if (user && user.role === 'Branch' && (!allowedRoles || !allowedRoles.includes('Branch'))) {
    return <Navigate to="/branch/dashboard" replace />
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    if (user.role === 'Super Admin') {
      return <Navigate to="/superadmin/dashboard" replace />
    }
    if (user.role === 'Branch') {
      return <Navigate to="/branch/dashboard" replace />
    }
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
