"use client"

import { useState } from "react"
import Alert from "../components/Alert"

function Settings() {
  const [settings, setSettings] = useState({
    email: "user@example.com",
    notifications: true,
    dataRetention: 90,
    defaultReportFormat: "pdf",
    language: "uk",
  })

  const [isLoading, setIsLoading] = useState(false)
  const [alert, setAlert] = useState({ show: false, message: "", type: "" })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setSettings({
      ...settings,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate saving settings
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setAlert({
        show: true,
        message: "Налаштування успішно збережено",
        type: "success",
      })
    } catch (error) {
      console.error(error)
      setAlert({
        show: true,
        message: "Помилка при збереженні налаштувань",
        type: "error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="settings-page">
      <div className="dashboard-card">
        <h2 className="card-title">Налаштування профілю</h2>
        <p className="card-description">Керуйте своїми налаштуваннями та параметрами облікового запису.</p>

        <form onSubmit={handleSubmit} className="settings-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              value={settings.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input type="checkbox" name="notifications" checked={settings.notifications} onChange={handleChange} />
              Отримувати сповіщення на email
            </label>
          </div>

          <div className="form-group">
            <label htmlFor="dataRetention" className="form-label">
              Зберігання даних (днів)
            </label>
            <select
              id="dataRetention"
              name="dataRetention"
              className="form-select"
              value={settings.dataRetention}
              onChange={handleChange}
            >
              <option value="30">30 днів</option>
              <option value="60">60 днів</option>
              <option value="90">90 днів</option>
              <option value="180">180 днів</option>
              <option value="365">1 рік</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="defaultReportFormat" className="form-label">
              Формат звітів за замовчуванням
            </label>
            <select
              id="defaultReportFormat"
              name="defaultReportFormat"
              className="form-select"
              value={settings.defaultReportFormat}
              onChange={handleChange}
            >
              <option value="pdf">PDF</option>
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
              <option value="xlsx">Excel (XLSX)</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="language" className="form-label">
              Мова інтерфейсу
            </label>
            <select
              id="language"
              name="language"
              className="form-select"
              value={settings.language}
              onChange={handleChange}
            >
              <option value="uk">Українська</option>
              <option value="en">English</option>
            </select>
          </div>

          {alert.show && <Alert message={alert.message} type={alert.type} />}

          <button type="submit" className="form-button" disabled={isLoading}>
            {isLoading ? "Збереження..." : "Зберегти налаштування"}
          </button>
        </form>
      </div>

      <div className="dashboard-card danger-zone">
        <h3 className="card-title">Небезпечна зона</h3>
        <p className="card-description">Дії в цьому розділі можуть призвести до незворотних змін.</p>

        <div className="danger-actions">
          <div className="danger-action">
            <div>
              <h4>Видалити всі дані</h4>
              <p>Видалити всі завантажені файли та згенеровані звіти.</p>
            </div>
            <button className="danger-button">Видалити дані</button>
          </div>

          <div className="danger-action">
            <div>
              <h4>Видалити обліковий запис</h4>
              <p>Видалити ваш обліковий запис та всі пов'язані з ним дані.</p>
            </div>
            <button className="danger-button">Видалити акаунт</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
