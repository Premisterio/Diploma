import React from 'react';

function UserDemographicsChart({ ageDistribution = {}, educationDistribution = {} }) {
  // Process age data for display
  const ageData = Object.entries(ageDistribution || {}).map(([age, count], index) => ({
    label: age,
    count,
    color: getColorForIndex(index)
  }));

  // Process education data for display
  const educationData = Object.entries(educationDistribution || {}).map(([education, count], index) => ({
    label: education,
    count,
    color: getColorForIndex(index + 4) // Use different colors than age
  }));

  // Colors based on the CSS variables
  function getColorForIndex(index) {
    const colors = [
      'var(--chart-color-1)',
      'var(--chart-color-2)',
      'var(--chart-color-3)',
      'var(--chart-color-4)',
      '#8b5cf6',
      '#ec4899',
      '#06b6d4',
      '#84cc16'
    ];
    return colors[index % colors.length];
  }

  // Calculate max value for scaling bars
  const maxAgeCount = Math.max(...Object.values(ageDistribution || {}), 1);
  const maxEduCount = Math.max(...Object.values(educationDistribution || {}), 1);

  return (
    <div className="demographics-chart-container">
      <div className="horizontal-bar-chart">
        <h4>Age Distribution</h4>
        {ageData.map((item, index) => (
          <div key={index} className="horizontal-bar-item">
            <div className="bar-label">{item.label}</div>
            <div className="bar-wrapper">
              <div 
                className="horizontal-bar" 
                style={{ 
                  width: `${(item.count / maxAgeCount) * 100}%`,
                  backgroundColor: item.color 
                }}
              ></div>
              <span className="bar-value">{item.count}</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="horizontal-bar-chart">
        <h4>Education Distribution</h4>
        {educationData.map((item, index) => (
          <div key={index} className="horizontal-bar-item">
            <div className="bar-label">{item.label}</div>
            <div className="bar-wrapper">
              <div 
                className="horizontal-bar" 
                style={{ 
                  width: `${(item.count / maxEduCount) * 100}%`,
                  backgroundColor: item.color 
                }}
              ></div>
              <span className="bar-value">{item.count}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserDemographicsChart;