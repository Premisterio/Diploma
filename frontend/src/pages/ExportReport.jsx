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
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDeleteExport = async (exportId) => {
    if (window.confirm("Ви впевнені, що хочете видалити цей експорт?")) {
      setIsDeleting(true);
      try {
        const response = await analysisAPI.deleteExport(exportId);
        
        if (response.success) {
          setAlert({
            show: true,
            message: "Експорт успішно видалено",
            type: "success",
          });

          await fetchExports();
        } else {
          throw new Error(response.error);
        }
      } catch (error) {
        console.error("Error deleting export:", error);
        setAlert({
          show: true,
          message: "Помилка при видаленні експорту",
          type: "error",
        });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (window.confirm("Ви впевнені, що хочете видалити цей звіт? Всі пов'язані експорти також будуть видалені.")) {
      setIsDeleting(true);
      try {
        const response = await analysisAPI.deleteReport(reportId);
        
        if (response.success) {
          setAlert({
            show: true,
            message: "Звіт успішно видалено",
            type: "success",
          });

          await fetchReports();
          await fetchExports();
        } else {
          throw new Error(response.error);
        }
      } catch (error) {
        console.error("Error deleting report:", error);
        setAlert({
          show: true,
          message: "Помилка при видаленні звіту",
          type: "error",
        });
      } finally {
        setIsDeleting(false);
      }
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
        <h3 className="card-title">Керування звітами</h3>
        {reports.length > 0 ? (
          <div className="reports-table-container">
            <table className="reports-table">
              <thead>
                <tr>
                  <th>Назва звіту</th>
                  <th>Тип</th>
                  <th>Дата створення</th>
                  <th>Дії</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(report => (
                  <tr key={report.id}>
                    <td>{report.report_name}</td>
                    <td>{getReportTypeName(report)}</td>
                    <td>{new Date(report.created_at).toLocaleDateString('uk-UA')}</td>
                    <td>
                      <button 
                        className="danger-button"
                        onClick={() => handleDeleteReport(report.id)}
                        disabled={isDeleting}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                          <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                        </svg>
                        Видалити
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <p>Немає звітів</p>
          </div>
        )}
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
                        <div className="button-group">
                          <button 
                            className="action-button"
                            onClick={() => handleDownload(exportItem.id)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                              <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
                            </svg>
                            Завантажити
                          </button>
                          <button 
                            className="danger-button"
                            onClick={() => handleDeleteExport(exportItem.id)}
                            disabled={isDeleting}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                              <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                            </svg>
                           Видалити
                          </button>
                        </div>
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

function getReportTypeName(report) {

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