import { useState, useEffect } from "react";
import { fileAPI, analysisAPI } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import Alert from "../components/Alert";

function DashboardHome() {
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalUsers: 0,
    activeUsers: 0,
    popularGenres: [],
    recentActivity: [],
    recentReports: []
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch dashboard data when component mounts
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");
    
    try {
      // Fetch files
      const filesResponse = await fileAPI.getUploadedFiles();
      
      // Fetch reports
      const reportsResponse = await analysisAPI.getReports();
      
      if (filesResponse.success && reportsResponse.success) {
        const files = filesResponse.data;
        const reports = reportsResponse.success ? reportsResponse.data : [];
        
        // Get the latest report to extract genre data
        let popularGenres = [];
        let userCount = 0;
        let activeUsers = 0;
        
        if (reports.length > 0) {
          // Fetch the latest report's data
          const latestReportResponse = await analysisAPI.getReportById(reports[0].id);
          
          if (latestReportResponse.success && latestReportResponse.data.report_data) {
            const reportData = latestReportResponse.data.report_data;
            
            // Extract popular genres
            if (reportData.content_performance && reportData.content_performance.genre_popularity) {
              popularGenres = Object.entries(reportData.content_performance.genre_popularity)
                .map(([name, count]) => ({ name, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 3);
            }
            
            // Extract user data
            // if (reportData.total_users) {
            //   userCount = reportData.total_users;
            //   // Estimate active users as ~60% of total -> Instead we can account for the last 90 days
            //   activeUsers = Math.round(userCount * 0.6); 
            // }
          }
        }
        
        // Create recent activity list from files and reports
        const recentActivity = [
          // Add recent file uploads
          ...files.slice(0, 3).map(file => ({
            user: file.uploader_email || "user@example.com",
            action: "Завантажив файл",
            time: formatTimeAgo(new Date(file.upload_date)),
            detail: file.filename
          })),
          
          // Add recent reports
          ...reports.slice(0, 3).map(report => ({
            user: report.analyst_email || "analyst@example.com",
            action: "Створив звіт",
            time: formatTimeAgo(new Date(report.created_at)),
            detail: report.report_name
          }))
        ].sort((a, b) => {
          // Convert relative time strings to sort order
          return getTimeWeight(a.time) - getTimeWeight(b.time);
        }).slice(0, 3);
        
        setStats({
          totalFiles: files.length,
          totalUsers: userCount,
          activeUsers: activeUsers,
          popularGenres: popularGenres,
          recentActivity: recentActivity,
          recentReports: reports.slice(0, 5)
        });
      } else {
        setError(filesResponse.error || reportsResponse.error || "Не вдалося завантажити дані");
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Помилка при завантаженні даних дашборду");
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to format time ago
  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHour = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHour / 24);
    
    if (diffDay > 0) {
      return `${diffDay} ${pluralize(diffDay, 'день', 'дні', 'днів')} тому`;
    } else if (diffHour > 0) {
      return `${diffHour} ${pluralize(diffHour, 'година', 'години', 'годин')} тому`;
    } else if (diffMin > 0) {
      return `${diffMin} ${pluralize(diffMin, 'хвилина', 'хвилини', 'хвилин')} тому`;
    }
    return 'Щойно';
  };
  
  // Helper function for Ukrainian pluralization
  const pluralize = (count, one, few, many) => {
    if (count % 10 === 1 && count % 100 !== 11) {
      return one;
    } else if (
      [2, 3, 4].includes(count % 10) &&
      ![12, 13, 14].includes(count % 100)
    ) {
      return few;
    } else {
      return many;
    }
  };
  
  // Helper function to assign a weight to time strings for sorting
  const getTimeWeight = (timeStr) => {
    if (timeStr === 'Щойно') return 0;
    
    const match = timeStr.match(/(\d+)\s+(.+)\s+тому/);
    if (!match) return 999;
    
    const num = parseInt(match[1]);
    const unit = match[2];
    
    if (unit.includes('хвилин')) return num;
    if (unit.includes('годин')) return num * 60;
    if (unit.includes('д')) return num * 60 * 24;
    return 999;
  };

  return (
    <div className="dashboard-home">
      {error && <Alert message={error} type="error" />}
      
      {loading ? (
        <div className="loading-container">
          <LoadingSpinner size="large" text="Завантаження даних..." />
        </div>
      ) : (
        <>
          <div className="dashboard-card">
            <div className="stat-card">
              <h3 className="stat-title">Всього файлів: {stats.totalFiles}</h3>
            </div>
            <div className="stat-card">
              <h3 className="stat-title">Всього користувачів: {stats.totalUsers}</h3>
            </div>
          </div>
          
          <div className="dashboard-card">
            <h3 className="card-title">Останні звіти</h3>
            {stats.recentReports.length > 0 ? (
              <div className="reports-list">
                {stats.recentReports.map((report, index) => (
                  <div key={index} className="report-item">
                    <div className="report-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-clipboard2-data" viewBox="0 0 16 16">
                        <path d="M9.5 0a.5.5 0 0 1 .5.5.5.5 0 0 0 .5.5.5.5 0 0 1 .5.5V2a.5.5 0 0 1-.5.5h-5A.5.5 0 0 1 5 2v-.5a.5.5 0 0 1 .5-.5.5.5 0 0 0 .5-.5.5.5 0 0 1 .5-.5z"/>
                        <path d="M3 2.5a.5.5 0 0 1 .5-.5H4a.5.5 0 0 0 0-1h-.5A1.5 1.5 0 0 0 2 2.5v12A1.5 1.5 0 0 0 3.5 16h9a1.5 1.5 0 0 0 1.5-1.5v-12A1.5 1.5 0 0 0 12.5 1H12a.5.5 0 0 0 0 1h.5a.5.5 0 0 1 .5.5v12a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5z"/>
                        <path d="M10 7a1 1 0 1 1 2 0v5a1 1 0 1 1-2 0zm-6 4a1 1 0 1 1 2 0v1a1 1 0 1 1-2 0zm4-3a1 1 0 0 0-1 1v3a1 1 0 1 0 2 0V9a1 1 0 0 0-1-1"/>
                      </svg>
                    </div>
                    <div className="report-content">
                      <div className="report-name">{report.report_name}</div>
                      <div className="report-date">{new Date(report.created_at).toLocaleDateString('uk-UA')}</div>
                    </div>
                    <div className="report-actions">
                      <a href={`/dashboard/analytics?report=${report.id}`} className="report-link">Переглянути</a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data-message">Немає створених звітів</p>
            )}
          </div>
        </>
      )}
      
      <button 
        className="refresh-button"
        onClick={fetchDashboardData}
        disabled={loading}
      >
        {loading ? "Updating" : "Оновити дані"}
      </button>
    </div>
  );
}

export default DashboardHome;