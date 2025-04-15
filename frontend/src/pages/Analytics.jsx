function Analytics() {
    return (
      <div className="analytics-page">
        <div className="dashboard-card">
          <h2 className="card-title">Аналітика користувачів</h2>
          <p className="card-description">Перегляд та аналіз даних про активність користувачів бібліотеки.</p>
  
          <div className="filters-container">
            <div className="filter-group">
              <label htmlFor="date-range" className="filter-label">
                Період:
              </label>
              <select id="date-range" className="filter-select">
                <option value="7days">Останні 7 днів</option>
                <option value="30days">Останні 30 днів</option>
                <option value="90days">Останні 90 днів</option>
                <option value="year">Цей рік</option>
              </select>
            </div>
  
            <div className="filter-group">
              <label htmlFor="activity-type" className="filter-label">
                Тип активності:
              </label>
              <select id="activity-type" className="filter-select">
                <option value="all">Всі типи</option>
                <option value="read">Читання</option>
                <option value="download">Завантаження</option>
                <option value="rate">Оцінювання</option>
              </select>
            </div>
  
            <div className="filter-group">
              <label htmlFor="genre" className="filter-label">
                Жанр:
              </label>
              <select id="genre" className="filter-select">
                <option value="all">Всі жанри</option>
                <option value="fiction">Художня література</option>
                <option value="science">Наукова література</option>
                <option value="history">Історія</option>
              </select>
            </div>
          </div>
        </div>
  
        <div className="charts-grid">
          <div className="dashboard-card">
            <h3 className="card-title">Активність користувачів</h3>
            <div className="chart-placeholder">
              <div className="chart-bars">
                <div className="chart-bar" style={{ height: "65%" }}></div>
                <div className="chart-bar" style={{ height: "40%" }}></div>
                <div className="chart-bar" style={{ height: "80%" }}></div>
                <div className="chart-bar" style={{ height: "55%" }}></div>
                <div className="chart-bar" style={{ height: "70%" }}></div>
                <div className="chart-bar" style={{ height: "45%" }}></div>
                <div className="chart-bar" style={{ height: "60%" }}></div>
              </div>
              <p className="chart-note">Графік активності користувачів за вибраний період</p>
            </div>
          </div>
  
          <div className="dashboard-card">
            <h3 className="card-title">Популярні книги</h3>
            <div className="chart-placeholder">
              <div className="chart-pie">
                <div className="pie-segment segment-1"></div>
                <div className="pie-segment segment-2"></div>
                <div className="pie-segment segment-3"></div>
                <div className="pie-segment segment-4"></div>
              </div>
              <p className="chart-note">Розподіл популярності книг за жанрами</p>
            </div>
          </div>
        </div>
  
        <div className="dashboard-card">
          <h3 className="card-title">Детальна статистика</h3>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Книга</th>
                  <th>Автор</th>
                  <th>Жанр</th>
                  <th>Переглядів</th>
                  <th>Завантажень</th>
                  <th>Рейтинг</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1984</td>
                  <td>Джордж Орвелл</td>
                  <td>Антиутопія</td>
                  <td>1,245</td>
                  <td>867</td>
                  <td>4.7</td>
                </tr>
                <tr>
                  <td>Гаррі Поттер і філософський камінь</td>
                  <td>Дж. К. Роулінг</td>
                  <td>Фентезі</td>
                  <td>2,367</td>
                  <td>1,532</td>
                  <td>4.9</td>
                </tr>
                <tr>
                  <td>Майстер і Маргарита</td>
                  <td>Михайло Булгаков</td>
                  <td>Фантастика</td>
                  <td>1,876</td>
                  <td>1,043</td>
                  <td>4.8</td>
                </tr>
                <tr>
                  <td>Кобзар</td>
                  <td>Тарас Шевченко</td>
                  <td>Поезія</td>
                  <td>1,543</td>
                  <td>987</td>
                  <td>4.9</td>
                </tr>
                <tr>
                  <td>Тигролови</td>
                  <td>Іван Багряний</td>
                  <td>Пригоди</td>
                  <td>876</td>
                  <td>543</td>
                  <td>4.5</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }
  
  export default Analytics
  