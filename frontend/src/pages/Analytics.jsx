import { useState, useEffect } from "react";
import AnalyticsFilter from "../components/analytics/AnalyticsFilter";
import ActivityChart from "../components/analytics/ActivityChart";
import GenreChart from "../components/analytics/GenreChart";
import BooksTable from "../components/analytics/BooksTable";
import LoadingSpinner from "../components/LoadingSpinner";
import { fileAPI, analysisAPI } from "../services/api";

function Analytics() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [reports, setReports] = useState([]);
  const [currentReport, setCurrentReport] = useState(null);
  const [filters, setFilters] = useState({
    dateRange: "30days",
    activityType: "all",
    genre: "all",
  });
  const [loading, setLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("");
  const [newReportName, setNewReportName] = useState("");

  // Fetch uploaded files when component mounts
  useEffect(() => {
    fetchFiles();
    fetchReports();
  }, []);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const response = await fileAPI.getUploadedFiles();
      if (response.success) {
        setFiles(response.data);
        if (response.data.length > 0 && !selectedFile) {
          setSelectedFile(response.data[0].id);
        }
      } else {
        showAlert(response.error, "error");
      }
    } catch (error) {
      console.error("Error fetching files:", error);
      showAlert("Failed to load data files", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      const response = await analysisAPI.getReports();
      if (response.success) {
        setReports(response.data);
      } else {
        console.error("Failed to fetch reports:", response.error);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  const handleFileSelect = (e) => {
    setSelectedFile(parseInt(e.target.value));
    setAnalysisData(null);  // Clear previous analysis
  };

  const handleFilterChange = (filterName, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterName]: value,
    }));
  };

  const handleReportSelect = async (e) => {
    const reportId = parseInt(e.target.value);
    if (reportId) {
      setLoading(true);
      try {
        const response = await analysisAPI.getReportById(reportId);
        if (response.success) {
          setCurrentReport(response.data);
          setAnalysisData(response.data.report_data);
        } else {
          showAlert(response.error, "error");
        }
      } catch (error) {
        console.error("Error fetching report:", error);
        showAlert("Failed to load report", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      showAlert("Please select a file to analyze", "error");
      return;
    }
    
    if (!newReportName.trim()) {
      showAlert("Please enter a report name", "error");
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await analysisAPI.generateReport(selectedFile, newReportName);
      
      if (response.success) {
        showAlert("Analysis completed successfully", "success");
        fetchReports();
        const reportData = await analysisAPI.getReportById(response.data.id);
        if (reportData.success) {
          setCurrentReport(reportData.data);
          setAnalysisData(reportData.data.report_data);
        }
      } else {
        showAlert(response.error, "error");
      }
    } catch (error) {
      console.error("Analysis error:", error);
      showAlert("Failed to analyze data", "error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const showAlert = (message, type) => {
    setAlertMessage(message);
    setAlertType(type);
    setTimeout(() => {
      setAlertMessage("");
    }, 5000);
  };

  // Transform data for book table display
  const transformBooksData = () => {
    if (!analysisData || !analysisData.content_performance) return [];
    
    const { top_borrowed_books, genre_popularity, avg_ratings_by_genre, top_authors } = analysisData.content_performance;
    
    // Create a combined dataset
    const bookData = Object.entries(top_borrowed_books).map(([title, count]) => {
      // Find the genre for this book (assuming we can match by title)
      // This is a simplified approach since we don't have complete data matching
      const genre = Object.keys(genre_popularity)[0]; // placeholder
      
      return {
        title,
        author: "Unknown", // We don't have author mapped to title in this data
        genre,
        views: count,
        downloads: Math.floor(count * 0.7), // Just for demonstration
        rating: avg_ratings_by_genre[genre] || 4.0
      };
    }).slice(0, 5);
    
    return bookData;
  };

  return (
    <div className="analytics-page">
      <div className="dashboard-card">
        <h2 className="card-title">Аналітика бібліотеки</h2>
        <p className="card-description">
          Аналіз даних користувачів та активності читачів
        </p>

        {alertMessage && (
          <div className={`alert ${alertType}`}>
            {alertMessage}
          </div>
        )}

        <div className="analytics-controls">
          <div className="control-group">
            <label>Вибрати файл даних:</label>
            <select 
              onChange={handleFileSelect} 
              value={selectedFile || ""}
              disabled={loading || isAnalyzing}
            >
              <option value="">-- Виберіть файл --</option>
              {files.map(file => (
                <option key={file.id} value={file.id}>
                  {file.filename} ({new Date(file.upload_date).toLocaleDateString('uk-UA')})
                </option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <label>Назва звіту:</label>
            <input 
              type="text" 
              value={newReportName}
              onChange={(e) => setNewReportName(e.target.value)}
              placeholder="Введіть назву для нового звіту"
              disabled={loading || isAnalyzing}
            />
          </div>

          <button 
            className="analyze-button" 
            onClick={handleAnalyze}
            disabled={!selectedFile || isAnalyzing || !newReportName.trim()}
          >
            {isAnalyzing ? "Аналізую..." : "Аналізувати дані"}
          </button>

          <div className="control-group">
            <label>Збережені звіти:</label>
            <select 
              onChange={handleReportSelect}
              disabled={loading || isAnalyzing}
            >
              <option value="">-- Виберіть звіт --</option>
              {reports.map(report => (
                <option key={report.id} value={report.id}>
                  {report.report_name} ({new Date(report.created_at).toLocaleDateString('uk-UA')})
                </option>
              ))}
            </select>
          </div>
        </div>

        <AnalyticsFilter onFilterChange={handleFilterChange} />
      </div>

      {loading ? (
        <div className="loading-container">
          <LoadingSpinner size="large" text="Завантаження даних..." />
        </div>
      ) : isAnalyzing ? (
        <div className="loading-container">
          <LoadingSpinner size="large" text="Аналіз даних..." />
        </div>
      ) : analysisData ? (
        <>
          <div className="charts-grid">
            <div className="dashboard-card">
              <h3 className="card-title">Активність користувачів</h3>
              <p>Загальна кількість користувачів: {analysisData.total_users}</p>
              <ActivityChart
              hourlyActivity={analysisData.usage_patterns.hourly_activity}
              weeklyActivity={analysisData.usage_patterns.weekly_activity}
              />
              
              <div className="stats-grid">
                <div className="stat-item">
                  <h4>Активність за годинами</h4>
                  <ul>
                    {analysisData.usage_patterns.hourly_activity && 
                      Object.entries(analysisData.usage_patterns.hourly_activity)
                        .slice(0, 5)
                        .map(([hour, count]) => (
                          <li key={hour}>Година {hour}: {count} сеансів</li>
                        ))
                    }
                  </ul>
                </div>
                <div className="stat-item">
                  <h4>Активність за днями тижня</h4>
                  <ul>
                    {analysisData.usage_patterns.weekly_activity && 
                      Object.entries(analysisData.usage_patterns.weekly_activity)
                        .map(([day, count]) => (
                          <li key={day}>{day}: {count} сеансів</li>
                        ))
                    }
                  </ul>
                </div>
              </div>
            </div>

            <div className="dashboard-card">
              <h3 className="card-title">Популярність жанрів</h3>
              <GenreChart
              genrePopularity={analysisData.content_performance.genre_popularity}
              />
              
              <div className="stats-grid">
                <div className="stat-item">
                  <h4>Найпопулярніші жанри</h4>
                  <ul>
                    {analysisData.content_performance.genre_popularity && 
                      Object.entries(analysisData.content_performance.genre_popularity)
                        .slice(0, 5)
                        .map(([genre, count]) => (
                          <li key={genre}>{genre}: {count} запозичень</li>
                        ))
                    }
                  </ul>
                </div>
                <div className="stat-item">
                  <h4>Середній рейтинг за жанрами</h4>
                  <ul>
                    {analysisData.content_performance.avg_ratings_by_genre && 
                      Object.entries(analysisData.content_performance.avg_ratings_by_genre)
                        .slice(0, 5)
                        .map(([genre, rating]) => (
                          <li key={genre}>{genre}: {rating} / 5</li>
                        ))
                    }
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <h3 className="card-title">Популярні книги</h3>
            <BooksTable data={transformBooksData()} />
          </div>

          <div className="dashboard-card">
            <h3 className="card-title">Демографія користувачів</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <h4>Розподіл за віком</h4>
                <ul>
                  {analysisData.user_segments.age_distribution && 
                    Object.entries(analysisData.user_segments.age_distribution)
                      .map(([age, count]) => (
                        <li key={age}>{age}: {count} користувачів</li>
                      ))
                  }
                </ul>
              </div>
              <div className="stat-item">
                <h4>Розподіл за освітою</h4>
                <ul>
                  {analysisData.user_segments.education_distribution && 
                    Object.entries(analysisData.user_segments.education_distribution)
                      .map(([edu, count]) => (
                        <li key={edu}>{edu}: {count} користувачів</li>
                      ))
                  }
                </ul>
              </div>
              <div className="stat-item">
                <h4>Тенденції пошуку</h4>
                <ul>
                  {analysisData.search_patterns.top_search_terms && 
                    Object.entries(analysisData.search_patterns.top_search_terms)
                      .slice(0, 5)
                      .map(([term, count]) => (
                        <li key={term}>{term}: {count} пошуків</li>
                      ))
                  }
                </ul>
              </div>
              <div className="stat-item">
                <h4>Утримання користувачів</h4>
                <ul>
                  {analysisData.retention_metrics.user_tenure_distribution && 
                    Object.entries(analysisData.retention_metrics.user_tenure_distribution)
                      .map(([tenure, count]) => (
                        <li key={tenure}>{tenure}: {count} користувачів</li>
                      ))
                  }
                </ul>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="no-data-message">
          <p>Виберіть файл даних і натисніть "Аналізувати дані" або завантажте існуючий звіт</p>
        </div>
      )}
    </div>
  );
}

export default Analytics;