"use client"

import { useState } from "react"
import Alert from "../components/Alert"

function UploadFile() {
  const [file, setFile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [alert, setAlert] = useState({ show: false, message: "", type: "" })

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    setFile(selectedFile)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!file) {
      setAlert({
        show: true,
        message: "Будь ласка, виберіть файл",
        type: "error",
      })
      return
    }

    setIsLoading(true)

    try {
      // Simulate file upload
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setAlert({
        show: true,
        message: `Файл "${file.name}" успішно завантажено`,
        type: "success",
      })

      // Reset file input
      setFile(null)
      e.target.reset()
    } catch (error) {
      console.error(error)
      setAlert({
        show: true,
        message: "Помилка при завантаженні файлу",
        type: "error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="upload-file">
      <div className="dashboard-card">
        <h2 className="card-title">Завантажити файл</h2>
        <p className="card-description">Завантажте файл з даними користувачів у форматі CSV або JSON.</p>

        <form onSubmit={handleSubmit} className="upload-form">
          <div className="file-upload-container">
            <label htmlFor="file-upload" className="file-upload-label">
              {file ? file.name : "Виберіть файл або перетягніть його сюди"}
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".csv,.json"
              onChange={handleFileChange}
              className="file-upload-input"
            />
          </div>

          {file && (
            <div className="file-info">
              <p>
                <strong>Назва файлу:</strong> {file.name}
              </p>
              <p>
                <strong>Розмір:</strong> {(file.size / 1024).toFixed(2)} KB
              </p>
              <p>
                <strong>Тип:</strong> {file.type || "Невідомий"}
              </p>
            </div>
          )}

          {alert.show && <Alert message={alert.message} type={alert.type} />}

          <button type="submit" className="form-button" disabled={isLoading || !file}>
            {isLoading ? "Завантаження..." : "Завантажити файл"}
          </button>
        </form>
      </div>

      <div className="dashboard-card">
        <h3 className="card-title">Останні завантажені файли</h3>
        <div className="files-table-container">
          <table className="files-table">
            <thead>
              <tr>
                <th>Назва файлу</th>
                <th>Дата завантаження</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>users_activity_jan.csv</td>
                <td>15.01.2024</td>
                <td>
                  <span className="status success">Оброблено</span>
                </td>
              </tr>
              <tr>
                <td>library_stats_q4.json</td>
                <td>28.12.2023</td>
                <td>
                  <span className="status success">Оброблено</span>
                </td>
              </tr>
              <tr>
                <td>user_feedback.csv</td>
                <td>15.12.2023</td>
                <td>
                  <span className="status error">Помилка</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default UploadFile
