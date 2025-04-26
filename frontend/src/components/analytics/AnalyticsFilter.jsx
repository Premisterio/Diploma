function AnalyticsFilter({ onFilterChange }) {
  return (
    <div className="filters-container">
      <div className="filter-group">
        <label htmlFor="date-range" className="filter-label">
          Період:
        </label>
        <select 
          id="date-range" 
          className="filter-select"
          onChange={(e) => onFilterChange('dateRange', e.target.value)}
        >
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
        <select 
          id="activity-type" 
          className="filter-select"
          onChange={(e) => onFilterChange('activityType', e.target.value)}
        >
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
        <select 
          id="genre" 
          className="filter-select"
          onChange={(e) => onFilterChange('genre', e.target.value)}
        >
          <option value="all">Всі жанри</option>
          <option value="fiction">Художня література</option>
          <option value="science">Наукова література</option>
          <option value="history">Історія</option>
        </select>
      </div>
    </div>
  );
}

export default AnalyticsFilter;