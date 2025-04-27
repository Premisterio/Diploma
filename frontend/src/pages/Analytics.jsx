import { useState, useEffect } from "react";
import GenreChart from "../components/analytics/GenreChart";
import BooksTable from "../components/analytics/BooksTable";
import UserDemographicsChart from "../components/analytics/UserDemographicsChart";
import RetentionChart from "../components/analytics/RetentionChart";
import BookCompletionChart from "../components/analytics/BookCompletionChart";
import LoadingSpinner from "../components/LoadingSpinner";
import Alert from "../components/Alert";
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
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch uploaded files when component mounts
  useEffect(() => {
    fetchFiles();
    fetchReports();
  }, []);

  // Filter the analyzed data based on user filters
  useEffect(() => {
    if (currentReport && currentReport.report_data) {
      const filteredData = applyFilters(currentReport.report_data, filters);
      setAnalysisData(filteredData);
    }
  }, [currentReport, filters]);

  const applyFilters = (data, filters) => {
    const filteredData = JSON.parse(JSON.stringify(data));
    // TODO: apply dateRange, activityType, genre filters to filteredData
    return filteredData;
  };

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
      showAlert("Не вдалося завантажити файли даних", "error");
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
    setAnalysisData(null);
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
          setNewReportName(response.data.report_name);
        } else {
          showAlert(response.error, "error");
        }
      } catch (error) {
        console.error("Error fetching report:", error);
        showAlert("Не вдалося завантажити звіт", "error");
      } finally {
        setLoading(false);
      }
    } else {
      setCurrentReport(null);
      setAnalysisData(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      showAlert("Будь ласка, оберіть файл для аналізу", "error");
      return;
    }
    if (!newReportName.trim()) {
      showAlert("Будь ласка, введіть назву звіту", "error");
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await analysisAPI.generateReport(selectedFile, newReportName);
      if (response.success) {
        showAlert("Аналіз успішно завершено", "success");
        await fetchReports();
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
      showAlert("Не вдалося проаналізувати дані", "error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const showAlert = (message, type) => {
    setAlertMessage(message);
    setAlertType(type);
    setTimeout(() => setAlertMessage(""), 5000);
  };

  const transformBooksData = () => {
    if (!analysisData?.content_performance) return [];
    const {
      top_borrowed_books = {},
      genre_popularity = {},
      avg_ratings_by_genre = {},
      top_authors = {},
    } = analysisData.content_performance;

    const authors = Object.keys(top_authors);
    return Object.entries(top_borrowed_books)
      .map(([title, count], index) => {
        const genres = Object.keys(genre_popularity);
        const genre = genres[index % genres.length] || "";
        const author = authors[index % authors.length] || "Невідомо";
        return {
          title,
          author,
          genre,
          views: count,
          downloads: Math.floor(count * 0.7),
          rating: avg_ratings_by_genre[genre] || 4.0,
        };
      })
      .slice(0, 10);
  };

  return (
    <div className="analytics-page">
      <div className="dashboard-card">
        <h2 className="card-title">Аналітика даних користувачів</h2>
        <p className="card-description">
          Проведення аналітики даних користувачів онлайн-бібліотеки
        </p>

        {alertMessage && <Alert message={alertMessage} type={alertType} />}

        <div className="analytics-controls">
          <div className="control-group">
            <label>Виберіть файл з даними:</label>
            <select
              onChange={handleFileSelect}
              value={selectedFile || ""}
              disabled={loading || isAnalyzing}
            >
              <option value="">-- Виберіть файл --</option>
              {files.map(file => (
                <option key={file.id} value={file.id}>
                  {file.filename} (
                  {new Date(file.upload_date).toLocaleDateString('uk-UA')})
                </option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <label>Назва звіту:</label>
            <input
              type="text"
              value={newReportName}
              onChange={e => setNewReportName(e.target.value)}
              placeholder="Введіть назву звіту"
              disabled={loading || isAnalyzing}
            />
          </div>

          <div className="control-button-group">
            <button
              className="analyze-button"
              onClick={handleAnalyze}
              disabled={!selectedFile || isAnalyzing || !newReportName.trim()}
            >
              {isAnalyzing ? "Аналізую..." : "Аналізувати дані"}
            </button>
          </div>

          <div className="control-group">
            <label>Збережені звіти:</label>
            <select
              onChange={handleReportSelect}
              disabled={loading || isAnalyzing}
            >
              <option value="">-- Виберіть звіт --</option>
              {reports.map(report => (
                <option key={report.id} value={report.id}>
                  {report.report_name} (
                  {new Date(report.created_at).toLocaleDateString('uk-UA')})
                </option>
              ))}
            </select>
          </div>
        </div>

        {analysisData && (
          <div className="analytics-tabs">
            <button
              className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Огляд
            </button>
            <button
              className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              Аналіз користувачів
            </button>
            <button
              className={`tab-button ${activeTab === 'content' ? 'active' : ''}`}
              onClick={() => setActiveTab('content')}
            >
              Аналіз контенту
            </button>
          </div>
        )}
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
          {/* Огляд */}
          {activeTab === 'overview' && (
            <>
              <div className="dashboard-card">
                <h3 className="card-title">Огляд бібліотеки</h3>
                <div className="stats-highlights">
                  <div className="stat-highlight-item">
                    <div className="stat-value">{analysisData.total_users}</div>
                    <div className="stat-label">Усього користувачів</div>
                  </div>
                  <div className="stat-highlight-item">
                    <div className="stat-value">
                      {Object.keys(analysisData.content_performance.top_borrowed_books || {}).length}
                    </div>
                    <div className="stat-label">Унікальних книг</div>
                  </div>
                  <div className="stat-highlight-item">
                    <div className="stat-value">
                      {Object.values(analysisData.content_performance.top_borrowed_books || {}).reduce((a, b) => a + b, 0)}
                    </div>
                    <div className="stat-label">Всього позичень</div>
                  </div>
                  <div className="stat-highlight-item">
                    <div className="stat-value">
                      {Object.values(analysisData.content_performance.avg_ratings_by_genre || {}).length > 0
                        ? (
                            Object.values(analysisData.content_performance.avg_ratings_by_genre)
                              .reduce((a, b) => a + b, 0) /
                            Object.values(analysisData.content_performance.avg_ratings_by_genre).length
                          ).toFixed(1)
                        : "N/A"
                      }
                    </div>
                    <div className="stat-label">Середній рейтинг</div>
                  </div>
                </div>
              </div>

              <div className="dashboard-card">
                <h3 className="card-title">Популярність жанрів</h3>
                <p className="card-description">
                  Розподіл жанрів у вашій бібліотеці
                </p>
                <GenreChart genrePopularity={analysisData.content_performance.genre_popularity} />
              </div>

              <div className="dashboard-card">
                <h3 className="card-title">Топ позичених книг</h3>
                <BooksTable data={transformBooksData()} />
              </div>
            </>
          )}

          {/* Аналіз користувачів */}
          {activeTab === 'users' && (
            <>
              <div className="dashboard-card">
                <h3 className="card-title">Демографія користувачів</h3>
                <UserDemographicsChart 
                  ageDistribution={analysisData.user_segments.age_distribution}
                  educationDistribution={analysisData.user_segments.education_distribution}
                />
                <div className="stats-grid">
                  <div className="stat-item">
                    <h4>Найпопулярніші професії</h4>
                    <ul>
                      {analysisData.user_segments.top_professions &&
                        Object.entries(analysisData.user_segments.top_professions).map(
                          ([profession, count]) => (
                            <li key={profession}>
                              <span>{profession}</span>
                              <span>{count} користувачів</span>
                            </li>
                          )
                        )}
                    </ul>
                  </div>
                  <div className="stat-item">
                    <h4>Типи акаунтів</h4>
                    <ul>
                      {analysisData.user_segments.account_type_distribution &&
                        Object.entries(analysisData.user_segments.account_type_distribution).map(
                          ([type, count]) => (
                            <li key={type}>
                              <span>{type}</span>
                              <span>{count} користувачів</span>
                            </li>
                          )
                        )}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="dashboard-card">
                <h3 className="card-title">Утримання та активність користувачів</h3>
                <RetentionChart 
                  userTenure={analysisData.retention_metrics.user_tenure_distribution}
                  activityByTenure={analysisData.retention_metrics.avg_activity_by_tenure}
                />
              </div>

              <div className="dashboard-card">
                <h3 className="card-title">Використання пристроїв</h3>
                <div className="stats-grid">
                  <div className="stat-item">
                    <h4>Середня тривалість сесії</h4>
                    <ul>
                      {analysisData.usage_patterns.avg_duration_by_device &&
                        Object.entries(analysisData.usage_patterns.avg_duration_by_device).map(
                          ([device, duration]) => (
                            <li key={device}>
                              <span>{device}</span>
                              <span>{duration.toFixed(1)} хв.</span>
                            </li>
                          )
                        )}
                    </ul>
                  </div>
                  <div className="stat-item">
                    <h4>Середня кількість сторінок</h4>
                    <ul>
                      {analysisData.usage_patterns.avg_pages_by_device &&
                        Object.entries(analysisData.usage_patterns.avg_pages_by_device).map(
                          ([device, pages]) => (
                            <li key={device}>
                              <span>{device}</span>
                              <span>{pages.toFixed(0)} стор.</span>
                            </li>
                          )
                        )}
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Аналіз контенту */}
          {activeTab === 'content' && (
            <>
              <div className="dashboard-card">
                <h3 className="card-title">Продуктивність контенту</h3>
                <div className="charts-grid">
                  <div className="chart-container">
                    <h4>Найпопулярніші автори</h4>
                    <div className="ranking-list">
                      {analysisData.content_performance.top_authors &&
                        Object.entries(analysisData.content_performance.top_authors)
                          .slice(0, 10)
                          .map(([author, count], index) => (
                            <div key={author} className="ranking-item">
                              <span className="rank">{index + 1}</span>
                              <span className="name">{author}</span>
                              <span className="value">{count} позичень</span>
                            </div>
                          ))}
                    </div>
                  </div>
                </div>
              </div>

              <BookCompletionChart 
                completionRates={analysisData.content_performance.completion_rates}
              />

              <div className="dashboard-card">
                <h3 className="card-title">Рейтинги контенту за жанрами</h3>
                <div className="ratings-chart">
                  {analysisData.content_performance.avg_ratings_by_genre &&
                    Object.entries(analysisData.content_performance.avg_ratings_by_genre).map(
                      ([genre, rating]) => (
                        <div key={genre} className="rating-bar">
                          <span className="genre-name">{genre}</span>
                          <div className="rating-bar-container">
                            <div
                              className="rating-bar-fill"
                              style={{ width: `${(rating / 5) * 100}%` }}
                            />
                          </div>
                          <span className="rating-value">
                            {rating.toFixed(1)}
                          </span>
                        </div>
                      )
                    )}
                </div>
              </div>
            </>
          )}
        </>
      ) : (
        <div className="empty-state">
          <p>
            Оберіть файл даних та створіть звіт, щоб переглянути аналітику
          </p>
        </div>
      )}
    </div>
  );
}

export default Analytics;
