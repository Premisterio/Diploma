import { useState, useEffect } from "react";
import AnalyticsFilter from "../components/analytics/AnalyticsFilter";
import ActivityChart from "../components/analytics/ActivityChart";
import GenreChart from "../components/analytics/GenreChart";
import BooksTable from "../components/analytics/BooksTable";
import LoadingSpinner from "../components/LoadingSpinner";

function Analytics() {
  const [filters, setFilters] = useState({
    dateRange: "30days",
    activityType: "all",
    genre: "all",
  });
  const [loading, setLoading] = useState(false);
  const [booksData, setBooksData] = useState([
    {
      title: "1984",
      author: "Джордж Орвелл",
      genre: "Антиутопія",
      views: 1245,
      downloads: 867,
      rating: 4.7,
    },
    {
      title: "Гаррі Поттер і філософський камінь",
      author: "Дж. К. Роулінг",
      genre: "Фентезі",
      views: 2367,
      downloads: 1532,
      rating: 4.9,
    },
    {
      title: "Майстер і Маргарита",
      author: "Михайло Булгаков",
      genre: "Фантастика",
      views: 1876,
      downloads: 1043,
      rating: 4.8,
    },
    {
      title: "Кобзар",
      author: "Тарас Шевченко",
      genre: "Поезія",
      views: 1543,
      downloads: 987,
      rating: 4.9,
    },
    {
      title: "Тигролови",
      author: "Іван Багряний",
      genre: "Пригоди",
      views: 876,
      downloads: 543,
      rating: 4.5,
    },
  ]);

  const handleFilterChange = (filterName, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterName]: value,
    }));
  };

  // Simulate data fetching when filters change
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // In a real app, this would be an API call with the filters
      // For now, we're just using the mock data
      
      setLoading(false);
    };

    fetchData();
  }, [filters]);

  return (
    <div className="analytics-page">
      <div className="dashboard-card">
        <h2 className="card-title">Аналітика користувачів</h2>
        <p className="card-description">
          Перегляд та аналіз даних про активність користувачів бібліотеки.
        </p>

        <AnalyticsFilter onFilterChange={handleFilterChange} />
      </div>

      {loading ? (
        <div className="loading-container">
          <LoadingSpinner size="large" text="Завантаження даних..." />
        </div>
      ) : (
        <>
          <div className="charts-grid">
            <div className="dashboard-card">
              <h3 className="card-title">Активність користувачів</h3>
              <ActivityChart />
            </div>

            <div className="dashboard-card">
              <h3 className="card-title">Популярні книги</h3>
              <GenreChart />
            </div>
          </div>

          <div className="dashboard-card">
            <h3 className="card-title">Детальна статистика</h3>
            <BooksTable data={booksData} />
          </div>
        </>
      )}
    </div>
  );
}

export default Analytics;