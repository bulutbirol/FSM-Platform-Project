import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../api/client'

const AuthContext = createContext(null)

const accounts = {
  ADMIN: 'admin@serviceflow.demo',
  TECHNICIAN: 'technician@serviceflow.demo',
  CUSTOMER: 'customer@serviceflow.demo'
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('serviceflow_user')
    return stored ? JSON.parse(stored) : null
  })
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('serviceflow_token')))

  const storeSession = (data) => {
    localStorage.setItem('serviceflow_token', data.token)
    localStorage.setItem('serviceflow_user', JSON.stringify(data.user))
    setUser(data.user)
  }

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    storeSession(data)
    return data.user
  }

  const switchRole = (role) => login(accounts[role], 'password')

  const logout = () => {
    localStorage.removeItem('serviceflow_token')
    localStorage.removeItem('serviceflow_user')
    setUser(null)
  }

  useEffect(() => {
    const restore = async () => {
      if (!localStorage.getItem('serviceflow_token')) return setLoading(false)
      try {
        const { data } = await api.get('/auth/me')
        localStorage.setItem('serviceflow_user', JSON.stringify(data))
        setUser(data)
      } catch {
        logout()
      } finally {
        setLoading(false)
      }
    }
    restore()
    const handleUnauthorized = () => logout()
    window.addEventListener('serviceflow:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('serviceflow:unauthorized', handleUnauthorized)
  }, [])

  const value = useMemo(() => ({ user, loading, login, logout, switchRole }), [user, loading])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}

