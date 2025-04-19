"use client"

import { useState, useEffect } from "react"
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom"
import { useTheme } from "../context/ThemeContext"
import { useAuth } from "../context/AuthContext"
import ThemeToggle from "../components/ThemeToggle"

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const { theme } = useTheme()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Check if screen is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setSidebarOpen(false)
      } else {
        setSidebarOpen(true)
      }
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)

    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebarOnMobile = () => {
    if (isMobile) {
      setSidebarOpen(false)
    }
  }

  const navItems = [
    { path: "/dashboard", icon: "📊", label: "Дашборд" },
    { path: "/dashboard/upload", icon: "📁", label: "Завантажити файл" },
    { path: "/dashboard/analytics", icon: "📈", label: "Аналітика" },
    { path: "/dashboard/export", icon: "📋", label: "Експорт звіту" },
    { path: "/dashboard/settings", icon: "⚙️", label: "Налаштування" },
  ]

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">Library Analytics</h2>
          {isMobile && (
            <button className="sidebar-close" onClick={toggleSidebar}>
              ✕
            </button>
          )}
        </div>

        <div className="sidebar-user">
          <div className="user-avatar">{user?.email?.charAt(0).toUpperCase() || "U"}</div>
          <div className="user-info">
            <p className="user-name">{user?.name || "Користувач"}</p>
            <p className="user-role">Аналітик</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
              onClick={closeSidebarOnMobile}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-button" onClick={logout}>
            <span className="nav-icon">🚪</span>
            <span className="nav-label">Вийти</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="dashboard-main">
        <header className="dashboard-header">
          <button className="menu-toggle" onClick={toggleSidebar}>
            {sidebarOpen ? "≡" : "≡"}
          </button>
          <h1 className="page-title">{navItems.find((item) => item.path === location.pathname)?.label || "Дашборд"}</h1>
          <div className="header-actions">
            <ThemeToggle />
            <div className="mobile-user-info">
              <div className="user-avatar">{user?.email?.charAt(0).toUpperCase() || "U"}</div>
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          <Outlet />
        </div>
      </main>

      {/* Mobile overlay */}
      {isMobile && sidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}
    </div>
  )
}

export default DashboardLayout
