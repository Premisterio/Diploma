import React from 'react';

function UserDemographicsChart({ ageDistribution = {}, educationDistribution = {} }) {
  // Стандартні дані, якщо немає наданих
  const defaultAgeData = {
    '18-24': 0,
    '25-34': 0,
    '35-44': 0,
    '45-54': 0,
    '55+': 0
  };
  
  const defaultEduData = {
    'Середня освіта': 0,
    'Бакалавр': 0,
    'Магістр': 0,
    'Доктор наук (PhD)': 0
  };
  
  // Використовуємо надані дані або стандартні
  const ageData = Object.keys(ageDistribution).length > 0 ? ageDistribution : defaultAgeData;
  const educationData = Object.keys(educationDistribution).length > 0 ? educationDistribution : defaultEduData;

  // Розрахунок максимального значення для масштабування
  const maxAgeCount = Math.max(...Object.values(ageData), 1);
  const maxEduCount = Math.max(...Object.values(educationData), 1);

  // Кольори з CSS змінних
  function getColorForIndex(index) {
    const colors = [
      'var(--chart-color-1, #3b82f6)',
      'var(--chart-color-2, #10b981)',
      'var(--chart-color-3, #f59e0b)',
      'var(--chart-color-4, #ef4444)',
      '#8b5cf6',
      '#ec4899',
      '#06b6d4',
      '#84cc16'
    ];
    return colors[index % colors.length];
  }

  return (
    <div className="demographics-chart-container">
      <div className="horizontal-bar-chart">
        <h4>Розподіл за віком</h4>
        {Object.entries(ageData).map((item, index) => (
          <div key={index} className="horizontal-bar-item">
            <div className="bar-label">{item[0]}</div>
            <div className="bar-wrapper">
              <div 
                className="horizontal-bar" 
                style={{ 
                  width: `${(item[1] / maxAgeCount) * 100}%`,
                  backgroundColor: getColorForIndex(index) 
                }}
              ></div>
              <span className="bar-value">{item[1]}</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="horizontal-bar-chart">
        <h4>Розподіл за освітою</h4>
        {Object.entries(educationData).map((item, index) => (
          <div key={index} className="horizontal-bar-item">
            <div className="bar-label">{item[0]}</div>
            <div className="bar-wrapper">
              <div 
                className="horizontal-bar" 
                style={{ 
                  width: `${(item[1] / maxEduCount) * 100}%`,
                  backgroundColor: getColorForIndex(index + 4) 
                }}
              ></div>
              <span className="bar-value">{item[1]}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserDemographicsChart;
