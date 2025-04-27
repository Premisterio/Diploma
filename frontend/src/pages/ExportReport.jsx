import { useState, useEffect } from "react";
import Alert from "../components/Alert";
import { analysisAPI } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";

function ExportReport() {
  const [format, setFormat] = useState("pdf");
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState("");
  const [exports, setExports] = useState([]);
  const [loadingExports, setLoadingExports] = useState(false);

  // Fetch reports and exports when component mounts
  useEffect(() => {
    fetchReports();
    fetchExports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await analysisAPI.getReports();
      if (response.success) {
        setReports(response.data);
        if (response.data.length > 0) {
          setSelectedReport(response.data[0].id);
        }
      } else {
        console.error("Failed to fetch reports:", response.error);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  const fetchExports = async () => {
    setLoadingExports(true);
    try {
      const response = await analysisAPI.getReportExports();
      if (response.success) {
        setExports(response.data);
      } else {
        console.error("Failed to fetch exports:", response.error);
      }
    } catch (error) {
      console.error("Error fetching exports:", error);
    } finally {
      setLoadingExports(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedReport) {
      setAlert({
        show: true,
        message: "Будь ласка, виберіть звіт для експорту",
        type: "error",
      });
      return;
    }
    
    setIsLoading(true);

    try {
      const response = await analysisAPI.exportReport(selectedReport, format);
      
      if (response.success) {
        setAlert({
          show: true,
          message: `Звіт успішно експортовано у форматі ${format.toUpperCase()}`,
          type: "success",
        });
        
        // Refresh exports list
        await fetchExports();
      } else {
        setAlert({
          show: true,
          message: response.error || "Помилка при експорті звіту",
          type: "error",
        });
      }
    } catch (error) {
      console.error(error);
      setAlert({
        show: true,
        message: "Помилка при експорті звіту",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (exportId) => {
    const exportItem = exports.find(item => item.id === exportId);
    if (!exportItem) return;
    
    try {
      await analysisAPI.exportReport(exportItem.report_id, exportItem.export_format);
    } catch (error) {
      console.error("Error downloading export:", error);
      setAlert({
        show: true,
        message: "Помилка при завантаженні звіту",
        type: "error",
      });
    }
  };

  return (
    <div className="export-report">
      <div className="dashboard-card">
        <h2 className="card-title">Експорт звіту</h2>
        <p className="card-description">Створіть та завантажте звіт на основі даних користувачів бібліотеки.</p>

        <form onSubmit={handleSubmit} className="report-form">
          <div className="form-group">
            <label htmlFor="report-select" className="form-label">
              Виберіть звіт
            </label>
            <select
              id="report-select"
              className="form-select"
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
            >
              <option value="">-- Виберіть звіт --</option>
              {reports.map(report => (
                <option key={report.id} value={report.id}>
                  {report.report_name} ({new Date(report.created_at).toLocaleDateString('uk-UA')})
                </option>
              ))}
            </select>
          </div>

          <br />

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
          
          <br />

          <button type="submit" className="form-button" disabled={isLoading || !selectedReport}>
            {isLoading ? "Експорт звіту..." : "Експортувати звіт"}
          </button>
        </form>
      </div>

      <div className="dashboard-card">
        <h3 className="card-title">Останні експортовані звіти</h3>
        
        {loadingExports ? (
          <div className="loading-container">
            <LoadingSpinner size="medium" text="Завантаження звітів..." />
          </div>
        ) : exports.length > 0 ? (
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
                {exports.map(exportItem => {
                  const report = reports.find(r => r.id === exportItem.report_id);
                  return (
                    <tr key={exportItem.id}>
                      <td>{report ? report.report_name : 'Невідомий звіт'}</td>
                      <td>{report ? getReportTypeName(report) : '-'}</td>
                      <td>{new Date(exportItem.created_at).toLocaleDateString('uk-UA')}</td>
                      <td>{exportItem.export_format.toUpperCase()}</td>
                      <td>
                        <button 
                          className="action-button"
                          onClick={() => handleDownload(exportItem.id)}
                        >
                          Завантажити
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <p>Немає експортованих звітів</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to get readable report type
function getReportTypeName(report) {
  // Try to determine the report type based on its data
  if (!report.report_data) return 'Загальний звіт';
  
  if (report.report_data.usage_patterns && Object.keys(report.report_data.usage_patterns).length > 0) {
    return 'Активність користувачів';
  }
  
  if (report.report_data.content_performance && Object.keys(report.report_data.content_performance).length > 0) {
    return 'Популярні книги';
  }
  
  if (report.report_data.user_segments && Object.keys(report.report_data.user_segments).length > 0) {
    return 'Демографія користувачів';
  }
  
  return 'Загальний звіт';
}

export default ExportReport;