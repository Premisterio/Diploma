"use client"

import { useState } from "react"
import LoginForm from "./components/LoginForm"
import RegisterForm from "./components/RegisterForm"
import ThemeToggle from "./components/ThemeToggle"
import { ThemeProvider } from "./context/ThemeContext"

function App() {
  const [activeTab, setActiveTab] = useState("login")

  return (
    <ThemeProvider>
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="header-top">
              <h1 className="auth-title">Авторизація</h1>
              <ThemeToggle />
            </div>
            <p className="auth-description">Увійдіть або створіть новий обліковий запис</p>
          </div>
          <div className="auth-content">
            <div className="tabs">
              <div className="tabs-list">
                <button
                  className={`tab-trigger ${activeTab === "login" ? "active" : ""}`}
                  onClick={() => setActiveTab("login")}
                >
                  Вхід
                </button>
                <button
                  className={`tab-trigger ${activeTab === "register" ? "active" : ""}`}
                  onClick={() => setActiveTab("register")}
                >
                  Реєстрація
                </button>
              </div>
              {activeTab === "login" ? <LoginForm /> : <RegisterForm />}
            </div>
          </div>
          <div className="auth-footer">
            <p>© 2024 Онлайн Бібліотека. Всі права захищені.</p>
          </div>
        </div>
      </div>
    </ThemeProvider>
  )
}

export default App
