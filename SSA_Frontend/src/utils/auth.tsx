import React, { createContext, useState, useEffect } from 'react'

export interface User {
  userId: string
  role: string
  name: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (userId: string, password: string) => Promise<boolean>
  logout: () => void
  clearError: () => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize auth state from local storage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')

    if (savedToken && savedUser) {
      setToken(savedToken)
      try {
        setUser(JSON.parse(savedUser))
      } catch (e) {
        // Clear corrupt storage
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (userId: string, password: string): Promise<boolean> => {
    setError(null)
    setIsLoading(true)

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Dummy verification for superadmin
    if (userId.trim().toLowerCase() === 'superadmin' && password === 'Admin@123') {
      const dummyUser: User = {
        userId: 'superadmin',
        role: 'Super Administrator',
        name: 'Super Admin',
      }
      const dummyToken = 'dummy-superadmin-jwt-token'

      setToken(dummyToken)
      setUser(dummyUser)
      localStorage.setItem('token', dummyToken)
      localStorage.setItem('user', JSON.stringify(dummyUser))
      setIsLoading(false)
      return true
    } else {
      setError('Invalid User ID or Password. Please try again.')
      setIsLoading(false)
      return false
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
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
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
