import { Routes, Route, Navigate } from "react-router-dom"
import AuthPage from "./pages/AuthPage"
import DashboardLayout from "./layouts/DashboardLayout"
import DashboardHome from "./pages/DashboardHome"
import UploadFile from "./pages/UploadFile"
import Analytics from "./pages/Analytics"
import ExportReport from "./pages/ExportReport"
import Settings from "./pages/Settings"

function App() {
  // In a real app, you would check authentication status here
  // For demo purposes, we'll assume the user is authenticated if there's a token
  const isAuthenticated = localStorage.getItem("token") !== null

  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />

      {/* Protected dashboard routes */}
      <Route path="/dashboard" element={isAuthenticated ? <DashboardLayout /> : <Navigate to="/auth" replace />}>
        <Route index element={<DashboardHome />} />
        <Route path="upload" element={<UploadFile />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="export" element={<ExportReport />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Redirect root to dashboard or auth based on authentication */}
      <Route
        path="/"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/auth" replace />}
      />
    </Routes>
  )
}

export default App
