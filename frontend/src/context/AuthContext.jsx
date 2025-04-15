"use client"

import { createContext, useState, useContext, useEffect } from "react"
import { useNavigate } from "react-router-dom"

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  // Check if user is authenticated on initial load
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      setIsAuthenticated(true)
      // In a real app, you would decode the token or fetch user data
      setUser({ email: "user@example.com" })
    }
  }, [])

  // Login function
  const login = (token, userData) => {
    localStorage.setItem("token", token)
    setIsAuthenticated(true)
    setUser(userData)
    navigate("/dashboard")
  }

  // Logout function
  const logout = () => {
    localStorage.removeItem("token")
    setIsAuthenticated(false)
    setUser(null)
    navigate("/auth")
  }

  return <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
