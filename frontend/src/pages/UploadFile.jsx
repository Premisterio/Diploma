import { useState, useEffect } from "react"
import Alert from "../components/Alert"
import { fileAPI } from "../services/api"

function UploadFile() {
  const [file, setFile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [alert, setAlert] = useState({ show: false, message: "", type: "" })
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [isLoadingFiles, setIsLoadingFiles] = useState(false)

  // Fetch uploaded files when component mounts
  useEffect(() => {
    fetchUploadedFiles()
  }, [])

  const fetchUploadedFiles = async () => {
    setIsLoadingFiles(true)
    try {
      const response = await fileAPI.getUploadedFiles()
      if (response.success) {
        setUploadedFiles(response.data)
      } else {
        console.error("Failed to fetch files:", response.error)
      }
    } catch (error) {
      console.error("Error fetching files:", error)
    } finally {
      setIsLoadingFiles(false)
    }
  }

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

    // Check if file is JSON
    if (!file.name.endsWith('.json')) {
      setAlert({
        show: true,
        message: "Підтримуються лише файли формату JSON",
        type: "error",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fileAPI.uploadFile(file)
      
      if (response.success) {
        setAlert({
          show: true,
          message: `Файл "${file.name}" успішно завантажено`,
          type: "success",
        })
        
        // Refresh the file list
        fetchUploadedFiles()
        
        // Reset file input
        setFile(null)
        e.target.reset()
      } else {
        throw new Error(response.error)
      }
    } catch (error) {
      console.error(error)
      setAlert({
        show: true,
        message: `Помилка при завантаженні файлу: ${error.message}`,
        type: "error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Format date string to local format
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('uk-UA')
  }

  return (
    <div className="upload-file">
      <div className="dashboard-card">
        <h2 className="card-title">Завантажити файл</h2>
        <p className="card-description">Завантажте файл з даними користувачів у форматі JSON.</p>

        <form onSubmit={handleSubmit} className="upload-form">
          <div className="file-upload-container">
            <label htmlFor="file-upload" className="file-upload-label">
              {file ? file.name : "Виберіть файл або перетягніть його сюди"}
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".json"
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
                <strong>Тип:</strong> {file.type || "application/json"}
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
          {isLoadingFiles ? (
            <p>Завантаження списку файлів...</p>
          ) : uploadedFiles.length === 0 ? (
            <p>Немає завантажених файлів</p>
          ) : (
            <table className="files-table">
              <thead>
                <tr>
                  <th>Назва файлу</th>
                  <th>Дата завантаження</th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                {uploadedFiles.map((file) => (
                  <tr key={file.id}>
                    <td>{file.filename}</td>
                    <td>{formatDate(file.upload_date)}</td>
                    <td>
                      <span className="status success">Готовий до аналізу</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

export default UploadFile