import { useState, useEffect } from "react";
import ActivityChart from "../components/analytics/ActivityChart";
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
      // Apply filters to the data
      const filteredData = applyFilters(currentReport.report_data, filters);
      setAnalysisData(filteredData);
    }
  }, [currentReport, filters]);

  const applyFilters = (data, filters) => {
    // Clone the data to avoid mutating the original
    const filteredData = JSON.parse(JSON.stringify(data));
    
    // Apply date range filter
    // Note: This is a simplified example. In a real implementation,
    // you would need to filter the actual date fields in your data.
    
    // Apply activity type filter
    if (filters.activityType !== "all" && filteredData.usage_patterns) {
      // Filter activity data based on type
      // This is a placeholder - implement based on your data structure
    }
    
    // Apply genre filter
    if (filters.genre !== "all" && filteredData.content_performance) {
      // Filter content data based on genre
      // This is a placeholder - implement based on your data structure
    }
    
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

  const handleReportSelect = async (e) => {
    const reportId = parseInt(e.target.value);
    if (reportId) {
      setLoading(true);
      try {
        const response = await analysisAPI.getReportById(reportId);
        if (response.success) {
          setCurrentReport(response.data);
          setAnalysisData(response.data.report_data);
          // Set the report name for consistency
          setNewReportName(response.data.report_name);
        } else {
          showAlert(response.error, "error");
        }
      } catch (error) {
        console.error("Error fetching report:", error);
        showAlert("Failed to load report", "error");
      } finally {
        setLoading(false);
      }
    } else {
      // Clear selection
      setCurrentReport(null);
      setAnalysisData(null);
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
    
    // Map authors to books more intelligently
    const authors = Object.keys(top_authors || {});
    
    // Create a combined dataset
    const bookData = Object.entries(top_borrowed_books || {}).map(([title, count], index) => {
      // Find the genre for this book (we'll try to be smarter than random assignment)
      const genres = Object.keys(genre_popularity || {});
      const genre = genres[index % genres.length];
      
      // Assign an author - in a real app you'd have this mapping in your data
      const author = authors[index % authors.length] || "Unknown";
      
      return {
        title,
        author,
        genre,
        views: count,
        downloads: Math.floor(count * 0.7), // Just for demonstration
        rating: (avg_ratings_by_genre && genre && avg_ratings_by_genre[genre]) || 4.0
      };
    }).slice(0, 10);
    
    return bookData;
  };

  return (
    <div className="analytics-page">
      <div className="dashboard-card">
        <h2 className="card-title">Library Analytics</h2>
        <p className="card-description">
          Analyze user data and reader activity
        </p>

        {alertMessage && <Alert message={alertMessage} type={alertType} />}

        <div className="analytics-controls">
          <div className="control-group">
            <label>Select Data File:</label>
            <select 
              onChange={handleFileSelect} 
              value={selectedFile || ""}
              disabled={loading || isAnalyzing}
            >
              <option value="">-- Select File --</option>
              {files.map(file => (
                <option key={file.id} value={file.id}>
                  {file.filename} ({new Date(file.upload_date).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <label>Report Name:</label>
            <input 
              type="text" 
              value={newReportName}
              onChange={(e) => setNewReportName(e.target.value)}
              placeholder="Enter name for new report"
              disabled={loading || isAnalyzing}
            />
          </div>

          <div className="control-button-group">
            <button 
              className="analyze-button" 
              onClick={handleAnalyze}
              disabled={!selectedFile || isAnalyzing || !newReportName.trim()}
            >
              {isAnalyzing ? "Analyzing..." : "Analyze Data"}
            </button>
          </div>

          <div className="control-group">
            <label>Saved Reports:</label>
            <select 
              onChange={handleReportSelect}
              disabled={loading || isAnalyzing}
            >
              <option value="">-- Select Report --</option>
              {reports.map(report => (
                <option key={report.id} value={report.id}>
                  {report.report_name} ({new Date(report.created_at).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tab navigation */}
        {analysisData && (
          <div className="analytics-tabs">
            <button 
              className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button 
              className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              User Analysis
            </button>
            <button 
              className={`tab-button ${activeTab === 'content' ? 'active' : ''}`}
              onClick={() => setActiveTab('content')}
            >
              Content Analysis
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="loading-container">
          <LoadingSpinner size="large" text="Loading data..." />
        </div>
      ) : isAnalyzing ? (
        <div className="loading-container">
          <LoadingSpinner size="large" text="Analyzing data..." />
        </div>
      ) : analysisData ? (
        <>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              <div className="dashboard-card">
                <h3 className="card-title">Library Overview</h3>
                <div className="stats-highlights">
                  <div className="stat-highlight-item">
                    <div className="stat-value">{analysisData.total_users}</div>
                    <div className="stat-label">Total Users</div>
                  </div>
                  <div className="stat-highlight-item">
                    <div className="stat-value">
                      {Object.keys(analysisData.content_performance.top_borrowed_books || {}).length}
                    </div>
                    <div className="stat-label">Unique Books</div>
                  </div>
                  <div className="stat-highlight-item">
                    <div className="stat-value">
                      {Object.values(analysisData.content_performance.top_borrowed_books || {}).reduce((a, b) => a + b, 0)}
                    </div>
                    <div className="stat-label">Total Borrowings</div>
                  </div>
                  <div className="stat-highlight-item">
                    <div className="stat-value">
                      {Object.values(analysisData.content_performance.avg_ratings_by_genre || {}).length > 0 
                        ? (Object.values(analysisData.content_performance.avg_ratings_by_genre).reduce((a, b) => a + b, 0) / 
                           Object.values(analysisData.content_performance.avg_ratings_by_genre).length).toFixed(1)
                        : "N/A"}
                    </div>
                    <div className="stat-label">Avg Rating</div>
                  </div>
                </div>
              </div>

              <div className="charts-grid">
                <div className="dashboard-card">
                  <h3 className="card-title">User Activity</h3>
                  <ActivityChart
                    hourlyActivity={analysisData.usage_patterns.hourly_activity}
                    weeklyActivity={analysisData.usage_patterns.weekly_activity}
                  />
                </div>

                <div className="dashboard-card">
                  <h3 className="card-title">Genre Popularity</h3>
                  <GenreChart
                    genrePopularity={analysisData.content_performance.genre_popularity}
                  />
                </div>
              </div>

              <div className="dashboard-card">
                <h3 className="card-title">Top Borrowed Books</h3>
                <BooksTable data={transformBooksData()} />
              </div>
            </>
          )}

          {/* User Analysis Tab */}
          {activeTab === 'users' && (
            <>
              <div className="dashboard-card">
                <h3 className="card-title">User Demographics</h3>
                <UserDemographicsChart 
                  ageDistribution={analysisData.user_segments.age_distribution}
                  educationDistribution={analysisData.user_segments.education_distribution}
                />
                
                <div className="stats-grid">
                  <div className="stat-item">
                    <h4>Top Professions</h4>
                    <ul>
                      {analysisData.user_segments.top_professions && 
                        Object.entries(analysisData.user_segments.top_professions)
                          .map(([profession, count]) => (
                            <li key={profession}>
                              <span>{profession}</span>
                              <span>{count} users</span>
                            </li>
                          ))
                      }
                    </ul>
                  </div>
                  <div className="stat-item">
                    <h4>Account Types</h4>
                    <ul>
                      {analysisData.user_segments.account_type_distribution && 
                        Object.entries(analysisData.user_segments.account_type_distribution)
                          .map(([type, count]) => (
                            <li key={type}>
                              <span>{type}</span>
                              <span>{count} users</span>
                            </li>
                          ))
                      }
                    </ul>
                  </div>
                </div>
              </div>

              <div className="dashboard-card">
                <h3 className="card-title">User Retention & Activity</h3>
                <RetentionChart 
                  userTenure={analysisData.retention_metrics.user_tenure_distribution}
                  activityByTenure={analysisData.retention_metrics.avg_activity_by_tenure}
                />
              </div>

              <div className="dashboard-card">
                <h3 className="card-title">Device Usage</h3>
                <div className="stats-grid">
                  <div className="stat-item">
                    <h4>Average Session Duration</h4>
                    <ul>
                      {analysisData.usage_patterns.avg_duration_by_device && 
                        Object.entries(analysisData.usage_patterns.avg_duration_by_device)
                          .map(([device, duration]) => (
                            <li key={device}>
                              <span>{device}</span>
                              <span>{duration.toFixed(1)} minutes</span>
                            </li>
                          ))
                      }
                    </ul>
                  </div>
                  <div className="stat-item">
                    <h4>Average Pages Read</h4>
                    <ul>
                      {analysisData.usage_patterns.avg_pages_by_device && 
                        Object.entries(analysisData.usage_patterns.avg_pages_by_device)
                          .map(([device, pages]) => (
                            <li key={device}>
                              <span>{device}</span>
                              <span>{pages.toFixed(0)} pages</span>
                            </li>
                          ))
                      }
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Content Analysis Tab */}
          {activeTab === 'content' && (
            <>
              <div className="dashboard-card">
                <h3 className="card-title">Content Performance</h3>
                <div className="charts-grid">
                  <div className="chart-container">
                    <h4>Top Authors</h4>
                    <div className="ranking-list">
                      {analysisData.content_performance.top_authors && 
                        Object.entries(analysisData.content_performance.top_authors)
                          .slice(0, 10)
                          .map(([author, count], index) => (
                            <div key={author} className="ranking-item">
                              <span className="rank">{index + 1}</span>
                              <span className="name">{author}</span>
                              <span className="value">{count} borrowings</span>
                            </div>
                          ))
                      }
                    </div>
                  </div>
                  
                  <div className="chart-container">
                    <BookCompletionChart 
                      completionRates={analysisData.content_performance.completion_rates} 
                    />
                  </div>
                </div>
              </div>

              <div className="dashboard-card">
                <h3 className="card-title">Content Ratings by Genre</h3>
                <div className="ratings-chart">
                  {analysisData.content_performance.avg_ratings_by_genre && 
                    Object.entries(analysisData.content_performance.avg_ratings_by_genre)
                      .map(([genre, rating]) => (
                        <div key={genre} className="rating-bar">
                          <span className="genre-name">{genre}</span>
                          <div className="rating-bar-container">
                            <div 
                              className="rating-bar-fill" 
                              style={{ width: `${(rating / 5) * 100}%` }}
                            ></div>
                          </div>
                          <span className="rating-value">{rating.toFixed(1)}</span>
                        </div>
                      ))
                  }
                </div>
              </div>
            </>
          )}
        </>
      ) : (
        <div className="empty-state">
          <p>Select a data file and generate a report to view analytics</p>
        </div>
      )}
    </div>
  );
}

export default Analytics;