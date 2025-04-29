import { useState, useEffect } from "react";
import { fileAPI, analysisAPI } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import Alert from "../components/Alert";
import { Link } from "react-router-dom";

function DashboardHome() {
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalUsers: 0,
    popularGenres: [],
    recentActivity: [],
    recentReports: [],
    latestFile: null,
    totalBooks: 0,
    totalBorrows: 0,
    topBooks: []
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

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
        const reports = reportsResponse.data || [];
        
        // Get the latest report to extract data
        let popularGenres = [];
        let userCount = 0;
        let totalBooks = 0;
        let totalBorrows = 0;
        let topBooks = [];
        
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
                .slice(0, 5);
            }
            
            // Extract user data
            if (reportData.total_users) {
              userCount = reportData.total_users;
            }

            // Extract book data
            if (reportData.content_performance) {
              const topBorrowedBooks = reportData.content_performance.top_borrowed_books || {};
              totalBooks = Object.keys(topBorrowedBooks).length;
              totalBorrows = Object.values(topBorrowedBooks).reduce((a, b) => a + b, 0);
              
              // Get top books
              topBooks = Object.entries(topBorrowedBooks)
                .map(([title, count]) => ({ title, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);
            }
          }
        }
        
        // Create recent activity list from files and reports
        const recentActivity = [
          // Add recent file uploads
          ...files.slice(0, 5).map(file => ({
            user: file.uploader_email || "",
            action: "Користувач завантажив файл",
            time: formatTimeAgo(new Date(file.upload_date)),
            detail: file.filename
          })),
          
          // Add recent reports
          ...reports.slice(0, 5).map(report => ({
            user: report.analyst_email || "",
            action: "Користувач створив звіт",
            time: formatTimeAgo(new Date(report.created_at)),
            detail: report.report_name
          }))
        ].sort((a, b) => {
          // Convert relative time strings to sort order
          return getTimeWeight(a.time) - getTimeWeight(b.time);
        }).slice(0, 8);
        
        setStats({
          totalFiles: files.length,
          totalUsers: userCount,
          popularGenres: popularGenres,
          recentActivity: recentActivity,
          recentReports: reports.slice(0, 5),
          latestFile: files.length > 0 ? files[0] : null,
          totalBooks: totalBooks,
          totalBorrows: totalBorrows,
          topBooks: topBooks
        });
        
        setLastUpdated(new Date());
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
    <div>
      {error && <Alert message={error} type="error" />}
      
      {loading ? (
        <div className="loading-container">
          <LoadingSpinner size="large" text="Завантаження даних..." />
        </div>
      ) : (
        <>
          <div className="dashboard-header-bottom dashboard-card">
            <h2>Панель керування бібліотекою</h2>
            {lastUpdated && (
              <p className="last-updated">
                Останнє оновлення: {lastUpdated.toLocaleTimeString('uk-UA')}
              </p>
            )}
          </div>
          
          <div className="stats-cards-grid">
            <div className="dashboard-card stat-card">
              <div className="stat-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-person" viewBox="0 0 16 16">
              <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z"/>
              </svg>
              </div>
              <div className="stat-content">
                <h3 className="stat-title">Всього користувачів</h3>
                <p className="stat-value">{stats.totalUsers}</p>
              </div>
            </div>
            
            <div className="dashboard-card stat-card">
              <div className="stat-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-book" viewBox="0 0 16 16">
              <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783"/>
              </svg>
              </div>
              <div className="stat-content">
                <h3 className="stat-title">Всього книг</h3>
                <p className="stat-value">{stats.totalBooks}</p>
                <p className="stat-subtitle">Позичень: {stats.totalBorrows}</p>
              </div>
            </div>
            
            <div className="dashboard-card stat-card">
              <div className="stat-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-file-earmark-bar-graph" viewBox="0 0 16 16"><path d="M10 13.5a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-6a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5zm-2.5.5a.5.5 0 0 1-.5-.5v-4a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5zm-3 0a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5z"/><path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2M9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z"/>
              </svg>
              </div>
              <div className="stat-content">
                <h3 className="stat-title">Всього файлів</h3>
                <p className="stat-value">{stats.totalFiles}</p>
                <p className="stat-subtitle">Звітів: {stats.recentReports.length}</p>
              </div>
            </div>
          </div>
          
          <div className="dashboard-grid">
            <div className="dashboard-card latest-data-card">
              <h3 className="card-title">Останні завантажені дані</h3>
              {stats.latestFile ? (
                <div className="latest-file-info">
                  <div className="file-header">
                    <div className="file-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M5 4a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1H5zm-.5 2.5A.5.5 0 0 1 5 6h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5zM5 8a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1H5zm0 2a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1H5z"/>
                        <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2zm10-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1z"/>
                      </svg>
                    </div>
                    <div className="file-name">{stats.latestFile.filename}</div>
                  </div>
                  <div className="file-details">
                    <div className="file-detail-item">
                      <span className="detail-label">Дата завантаження:</span>
                      <span className="detail-value">{new Date(stats.latestFile.upload_date).toLocaleDateString('uk-UA')}</span>
                    </div>
                    <div className="file-detail-item">
                      <span className="detail-label">Завантажив:</span>
                      <span className="detail-value">{stats.latestFile.uploader_email || "Користувач системи"}</span>
                    </div>
                    <div className="file-detail-item">
                      <span className="detail-label">Статус:</span>
                      <span className="detail-value status-ready">Готовий до аналізу</span>
                    </div>
                  </div>
                  <div className="file-actions">
                    <Link to="/dashboard/analytics" className="action-button primary">
                      Аналізувати дані
                    </Link>
                    <Link to="/dashboard/upload" className="action-button secondary">
                      Завантажити новий файл
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <p className="empty-state-p">Немає завантажених файлів даних</p>
                  <Link to="/dashboard/upload" className="action-button primary">
                    Завантажити файл
                  </Link>
                </div>
              )}
            </div>
            
            <div className="dashboard-card popular-genres-card">
              <h3 className="card-title">Популярні жанри</h3>
              {stats.popularGenres.length > 0 ? (
                <div className="genres-chart">
                  {stats.popularGenres.map((genre, index) => {
                    const maxCount = Math.max(...stats.popularGenres.map(g => g.count));
                    const percentage = (genre.count / maxCount) * 100;
                    
                    return (
                      <div key={index} className="genre-bar">
                        <span className="genre-name">{genre.name}</span>
                        <div className="genre-bar-container">
                          <div 
                            className="genre-bar-fill"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="genre-count">{genre.count}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-state">
                  <p className="empty-state-p">Немає даних про жанри</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="dashboard-grid">
            <div className="dashboard-card">
              <h3 className="card-title">Популярні книги</h3>
              {stats.topBooks.length > 0 ? (
                <div className="top-books-list">
                  {stats.topBooks.map((book, index) => (
                    <div key={index} className="top-book-item">
                      <div className="book-rank">{index + 1}</div>
                      <div className="book-title">{book.title}</div>
                      <div className="book-borrows">{book.count} позичень</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p className="empty-state-p">Немає даних про книги</p>
                </div>
              )}
            </div>
            
            <div className="dashboard-card">
              <h3 className="card-title">Останні звіти</h3>
              {stats.recentReports.length > 0 ? (
                <div className="reports-list">
                  {stats.recentReports.map((report, index) => (
                    <div key={index} className="report-item">
                      <div className="report-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
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
                        <Link to={`/dashboard/analytics?report=${report.id}`} className="report-link">
                          Переглянути
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p className="empty-state-p">Немає створених звітів</p>
                  <Link to="/dashboard/analytics" className="action-button primary">
                    Створити звіт
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
      
      <button 
        className="refresh-button"
        onClick={fetchDashboardData}
        disabled={loading}
      >
        {loading ? <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-clock" viewBox="0 0 16 16">
  <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71z"/>
  <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0"/>
</svg> : <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-arrow-clockwise" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z"/>
  <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466"/>
</svg>}
      </button>
    </div>
  );
}

export default DashboardHome;