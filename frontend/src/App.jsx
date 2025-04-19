import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import AuthPage from "./pages/AuthPage";
import DashboardLayout from "./layouts/DashboardLayout";
import DashboardHome from "./pages/DashboardHome";
import UploadFile from "./pages/UploadFile";
import Analytics from "./pages/Analytics";
import ExportReport from "./pages/ExportReport";
import Settings from "./pages/Settings";
import LoadingSpinner from "./components/LoadingSpinner";


function App() {
  const { isAuthenticated, loading } = useAuth();

  // Show loading state
  if (loading) {
    return (
      <div className="full-page-loading">
        <LoadingSpinner size="large" text="Завантаження додатку..." />
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/auth"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <AuthPage />}
      />

      {/* Protected dashboard routes */}
      <Route
        path="/dashboard"
        element={isAuthenticated ? <DashboardLayout /> : <Navigate to="/auth" replace />}
      >
        <Route index element={<DashboardHome />} />
        <Route path="upload" element={<UploadFile />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="export" element={<ExportReport />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Redirect root to dashboard or auth based on authentication */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/auth" replace />
          )
        }
      />
      
      {/* 404 Not Found - Catch all route */}
      <Route path="*" element={
        <div className="not-found">
          <h1>404</h1>
          <p>Сторінку не знайдено</p>
          <button 
            className="form-button" 
            onClick={() => window.history.back()}
          >
            Повернутися назад
          </button>
        </div>
      } />
    </Routes>
  );
}

export default App;