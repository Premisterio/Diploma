import React from 'react';

function RetentionChart({ userTenure = {}, activityByTenure = {} }) {
  // Стандартні дані, якщо немає даних
  const defaultTenures = {
    '< 1 місяць': 0,
    '1-3 місяці': 0,
    '3-6 місяців': 0,
    '6-12 місяців': 0,
    '> 1 рік': 0
  };
  
  // Використовуємо надані дані або стандартні
  const tenureData = Object.keys(userTenure).length > 0 
    ? Object.entries(userTenure).map(([tenure, count]) => ({
        tenure,
        count,
        averageActivity: activityByTenure[tenure] || 0
      }))
    : Object.entries(defaultTenures).map(([tenure, count]) => ({
        tenure,
        count,
        averageActivity: 0
      }));

  // Сортування за тривалістю
  const tenureOrder = ['< 1 місяць', '1-3 місяці', '3-6 місяців', '6-12 місяців', '> 1 рік'];
  tenureData.sort((a, b) => 
    tenureOrder.indexOf(a.tenure) - tenureOrder.indexOf(b.tenure)
  );

  const maxCount = Math.max(...tenureData.map(item => item.count), 1);
  const maxActivity = Math.max(...tenureData.map(item => item.averageActivity), 1);

  return (
    <div className="retention-chart-container">
      <h4>Аналіз утримання користувачів</h4>
      
      <div className="retention-chart">
        {tenureData.map((item, index) => (
          <div key={index} className="retention-bar-group">
            <div className="tenure-label">{item.tenure}</div>
            <div className="retention-bars">
              <div className="bar-container">
                <div className="bar-label">Користувачі</div>
                <div className="bar-wrapper">
                  <div 
                    className="horizontal-bar user-bar" 
                    style={{ width: `${(item.count / maxCount) * 100}%` }}
                    title={`${item.count} користувачів`}
                  ></div>
                  <span className="bar-value">{item.count}</span>
                </div>
              </div>
              
              <div className="bar-container">
                <div className="bar-label">Сер. активність</div>
                <div className="bar-wrapper">
                  <div 
                    className="horizontal-bar activity-bar" 
                    style={{ width: `${(item.averageActivity / maxActivity) * 100}%` }}
                    title={`${item.averageActivity.toFixed(1)} сесій`}
                  ></div>
                  <span className="bar-value">{item.averageActivity.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RetentionChart;
