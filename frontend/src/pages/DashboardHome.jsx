"use client"

import { useState } from "react"

function DashboardHome() {
  const [stats] = useState({
    totalFiles: 12,
    totalUsers: 156,
    activeUsers: 87,
    popularGenres: [
      { name: "Наукова фантастика", count: 45 },
      { name: "Детективи", count: 32 },
      { name: "Історичні романи", count: 28 },
    ],
    recentActivity: [
      { user: "user123@example.com", action: "Завантажив файл", time: "2 години тому" },
      { user: "analyst@example.com", action: "Створив звіт", time: "5 годин тому" },
      { user: "admin@example.com", action: "Оновив налаштування", time: "1 день тому" },
    ],
  })

  return (
    <div className="dashboard-home">
      <div className="stats-grid">
        <div className="stat-card">
          <h3 className="stat-title">Всього файлів</h3>
          <p className="stat-value">{stats.totalFiles}</p>
        </div>
        <div className="stat-card">
          <h3 className="stat-title">Всього користувачів</h3>
          <p className="stat-value">{stats.totalUsers}</p>
        </div>
        <div className="stat-card">
          <h3 className="stat-title">Активні користувачі</h3>
          <p className="stat-value">{stats.activeUsers}</p>
        </div>
      </div>

      <div className="dashboard-row">
        <div className="dashboard-card">
          <h3 className="card-title">Популярні жанри</h3>
          <ul className="genre-list">
            {stats.popularGenres.map((genre, index) => (
              <li key={index} className="genre-item">
                <span className="genre-name">{genre.name}</span>
                <span className="genre-count">{genre.count}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="dashboard-card">
          <h3 className="card-title">Остання активність</h3>
          <ul className="activity-list">
            {stats.recentActivity.map((activity, index) => (
              <li key={index} className="activity-item">
                <div className="activity-user">{activity.user}</div>
                <div className="activity-details">
                  <span className="activity-action">{activity.action}</span>
                  <span className="activity-time">{activity.time}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default DashboardHome
