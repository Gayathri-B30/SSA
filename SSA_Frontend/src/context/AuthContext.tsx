import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

export interface User {
  id: string
  userId?: string
  name: string
  email?: string
  role: string
  avatar?: string
  code?: string
  manager?: string
  companyId?: string
  contactPerson?: string
  status?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (username: string, password: string) => Promise<boolean>
  superadminLogin: (username: string, password: string) => Promise<boolean>
  branchLogin: (username: string, password: string) => Promise<boolean>
  logout: () => void
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('ssa_auth_user') || localStorage.getItem('user')
    if (savedUser) {
      try {
        return JSON.parse(savedUser)
      } catch {
        // Fallback
      }
    }
    return null
  })

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('ssa_auth_token') || localStorage.getItem('token') || null
  })

  const [isLoading, setIsLoading] = useState(false)
  const [loadingInitial, setLoadingInitial] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem('ssa_auth_token') || localStorage.getItem('token')

      if (savedToken) {
        try {
          console.log('[AuthContext] Active token found in storage. Verifying session via GET /api/auth/me...');
          setToken(savedToken)

          const response = await api.get('/auth/me', {
            headers: {
              Authorization: `Bearer ${savedToken}`
            }
          })
          const freshUser = response.data
          console.log('[AuthContext] Session validated. Logged in user profile:', freshUser);

          localStorage.setItem('ssa_auth_user', JSON.stringify(freshUser))
          localStorage.setItem('user', JSON.stringify(freshUser))
          setUser(freshUser)
        } catch (e: any) {
          console.error('[AuthContext] Persistent session validation failed:', e.response?.data || e.message)
          logout()
        }
      }
      setLoadingInitial(false)
    }

    initializeAuth()
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    setError(null)
    setIsLoading(true)
    console.log('[AuthContext] Initiating POST /api/auth/login for username:', username);

    try {
      const response = await api.post('/auth/login', { username, password })
      const { user: loggedInUser, token: authToken } = response.data
      console.log('[AuthContext] Company login successful! Token issued. Company profile:', loggedInUser);

      localStorage.setItem('ssa_auth_token', authToken)
      localStorage.setItem('ssa_auth_user', JSON.stringify(loggedInUser))
      localStorage.setItem('token', authToken)
      localStorage.setItem('user', JSON.stringify(loggedInUser))

      setToken(authToken)
      setUser(loggedInUser)
      setIsLoading(false)
      return true
    } catch (err: any) {
      console.error('[AuthContext] Company login failed:', err.response?.data || err.message);
      const errMsg = err.response?.data?.message || 'Invalid Username or Password. Please try again.'
      setError(errMsg)
      setIsLoading(false)
      return false
    }
  }

  const superadminLogin = async (username: string, password: string): Promise<boolean> => {
    setError(null)
    setIsLoading(true)
    console.log('[AuthContext] Initiating POST /api/auth/login for superadmin:', username);

    try {
      const response = await api.post('/auth/login', { userId: username, password })
      const { user: loggedInUser, token: authToken } = response.data
      console.log('[AuthContext] Superadmin login successful! Token issued. User profile:', loggedInUser);

      localStorage.setItem('ssa_auth_token', authToken)
      localStorage.setItem('ssa_auth_user', JSON.stringify(loggedInUser))
      localStorage.setItem('token', authToken)
      localStorage.setItem('user', JSON.stringify(loggedInUser))

      setToken(authToken)
      setUser(loggedInUser)
      setIsLoading(false)
      return true
    } catch (err: any) {
      console.error('[AuthContext] Superadmin login failed:', err.response?.data || err.message);
      const errMsg = err.response?.data?.message || 'Invalid Username or Password. Please try again.'
      setError(errMsg)
      setIsLoading(false)
      return false
    }
  }

  const branchLogin = async (username: string, password: string): Promise<boolean> => {
    setError(null)
    setIsLoading(true)
    console.log('[AuthContext] Initiating POST /api/auth/branch-login for branch:', username);

    try {
      const response = await api.post('/auth/branch-login', { username, password })
      const { user: loggedInUser, token: authToken } = response.data
      console.log('[AuthContext] Branch login successful! Token issued. Branch profile:', loggedInUser);

      localStorage.setItem('ssa_auth_token', authToken)
      localStorage.setItem('ssa_auth_user', JSON.stringify(loggedInUser))
      localStorage.setItem('token', authToken)
      localStorage.setItem('user', JSON.stringify(loggedInUser))

      setToken(authToken)
      setUser(loggedInUser)
      setIsLoading(false)
      return true
    } catch (err: any) {
      console.error('[AuthContext] Branch login failed:', err.response?.data || err.message);
      const errMsg = err.response?.data?.message || 'Invalid Username or Password. Please try again.'
      setError(errMsg)
      setIsLoading(false)
      return false
    }
  }

  const logout = () => {
    console.log('[AuthContext] Logging out. Clearing token and profile from localStorage...');
    setToken(null)
    setUser(null)
    localStorage.removeItem('ssa_auth_token')
    localStorage.removeItem('ssa_auth_user')
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const clearError = () => setError(null)

  const isAuthenticated = !!token

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        error,
        login,
        superadminLogin,
        branchLogin,
        logout,
        clearError,
      }}
    >
      {!loadingInitial && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
