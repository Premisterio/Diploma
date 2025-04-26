import { useState, useEffect, useRef } from "react"
import Alert from "../components/Alert"
import { fileAPI } from "../services/api"

function UploadFile() {
  const [file, setFile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [alert, setAlert] = useState({ show: false, message: "", type: "" })
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [isLoadingFiles, setIsLoadingFiles] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

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
    if (selectedFile) {
      validateAndSetFile(selectedFile)
    }
  }

  const validateAndSetFile = (selectedFile) => {
    // Check if file is JSON
    if (!selectedFile.name.endsWith('.json')) {
      setAlert({
        show: true,
        message: "Підтримуються лише файли формату JSON",
        type: "error",
      })
      return false
    }
    
    setFile(selectedFile)
    setAlert({ show: false, message: "", type: "" })
    return true
  }

  // Drag and drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      validateAndSetFile(droppedFile)
    }
  }

  const handleDropAreaClick = () => {
    fileInputRef.current.click()
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
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
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
        <h2 className="card-title">Завантаження</h2>
        <p className="card-description">Завантажте файл даних користувачів для подальшого аналізу.</p>

        <form onSubmit={handleSubmit} className="upload-form">
          <div 
            className={`file-upload-container ${isDragging ? 'dragging' : ''}`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleDropAreaClick}
          >
            <div className="file-upload-content">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" className="upload-icon" viewBox="0 0 16 16">
                <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5"/>
                <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708z"/>
              </svg>
              <p className="upload-text">
                {file 
                  ? file.name 
                  : isDragging 
                    ? "Відпустіть файл тут" 
                    : "Перетягніть JSON файл сюди або клацніть для вибору"
                }
              </p>
              <p className="upload-hint">Підтримується лише формат JSON</p>
            </div>
            <input
              ref={fileInputRef}
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