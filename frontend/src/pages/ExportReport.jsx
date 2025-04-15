"use client"

import { useState } from "react"
import Alert from "../components/Alert"

function ExportReport() {
  const [reportType, setReportType] = useState("user_activity")
  const [dateRange, setDateRange] = useState("30days")
  const [format, setFormat] = useState("pdf")
  const [isLoading, setIsLoading] = useState(false)
  const [alert, setAlert] = useState({ show: false, message: "", type: "" })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate report generation
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setAlert({
        show: true,
        message: `Звіт успішно згенеровано у форматі ${format.toUpperCase()}`,
        type: "success",
      })
    } catch (error) {
      console.error(error)
      setAlert({
        show: true,
        message: "Помилка при генерації звіту",
        type: "error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="export-report">
      <div className="dashboard-card">
        <h2 className="card-title">Експорт звіту</h2>
        <p className="card-description">Створіть та завантажте звіт на основі даних користувачів бібліотеки.</p>

        <form onSubmit={handleSubmit} className="report-form">
          <div className="form-group">
            <label htmlFor="report-type" className="form-label">
              Тип звіту
            </label>
            <select
              id="report-type"
              className="form-select"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="user_activity">Активність користувачів</option>
              <option value="popular_books">Популярні книги</option>
              <option value="user_demographics">Демографія користувачів</option>
              <option value="reading_habits">Звички читання</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="date-range" className="form-label">
              Період
            </label>
            <select
              id="date-range"
              className="form-select"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="7days">Останні 7 днів</option>
              <option value="30days">Останні 30 днів</option>
              <option value="90days">Останні 90 днів</option>
              <option value="year">Цей рік</option>
              <option value="custom">Власний період</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="format" className="form-label">
              Формат звіту
            </label>
            <select id="format" className="form-select" value={format} onChange={(e) => setFormat(e.target.value)}>
              <option value="pdf">PDF</option>
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
              <option value="xlsx">Excel (XLSX)</option>
            </select>
          </div>

          {alert.show && <Alert message={alert.message} type={alert.type} />}

          <button type="submit" className="form-button" disabled={isLoading}>
            {isLoading ? "Генерація звіту..." : "Згенерувати звіт"}
          </button>
        </form>
      </div>

      <div className="dashboard-card">
        <h3 className="card-title">Останні звіти</h3>
        <div className="reports-table-container">
          <table className="reports-table">
            <thead>
              <tr>
                <th>Назва звіту</th>
                <th>Тип</th>
                <th>Дата створення</th>
                <th>Формат</th>
                <th>Дії</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Активність користувачів - Січень 2024</td>
                <td>Активність користувачів</td>
                <td>15.01.2024</td>
                <td>PDF</td>
                <td>
                  <button className="action-button">Завантажити</button>
                </td>
              </tr>
              <tr>
                <td>Популярні книги - Q4 2023</td>
                <td>Популярні книги</td>
                <td>28.12.2023</td>
                <td>CSV</td>
                <td>
                  <button className="action-button">Завантажити</button>
                </td>
              </tr>
              <tr>
                <td>Демографія користувачів - 2023</td>
                <td>Демографія користувачів</td>
                <td>15.12.2023</td>
                <td>JSON</td>
                <td>
                  <button className="action-button">Завантажити</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ExportReport
