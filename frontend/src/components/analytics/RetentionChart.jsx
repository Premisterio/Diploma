import React from 'react';

function RetentionChart({ userTenure = {}, activityByTenure = {} }) {
  // Default data if empty
  const defaultTenures = {
    '< 1 month': 0,
    '1-3 months': 0,
    '3-6 months': 0,
    '6-12 months': 0,
    '> 1 year': 0
  };
  
  // Use provided data or defaults
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

  // Sort data by tenure duration
  const tenureOrder = ['< 1 month', '1-3 months', '3-6 months', '6-12 months', '> 1 year'];
  tenureData.sort((a, b) => 
    tenureOrder.indexOf(a.tenure) - tenureOrder.indexOf(b.tenure)
  );

  const maxCount = Math.max(...tenureData.map(item => item.count), 1);
  const maxActivity = Math.max(...tenureData.map(item => item.averageActivity), 1);

  return (
    <div className="retention-chart-container">
      <h4>User Retention Analysis</h4>
      
      <div className="retention-chart">
        {tenureData.map((item, index) => (
          <div key={index} className="retention-bar-group">
            <div className="tenure-label">{item.tenure}</div>
            <div className="retention-bars">
              <div className="bar-container">
                <div className="bar-label">Users</div>
                <div className="bar-wrapper">
                  <div 
                    className="horizontal-bar user-bar" 
                    style={{ width: `${(item.count / maxCount) * 100}%` }}
                    title={`${item.count} users`}
                  ></div>
                  <span className="bar-value">{item.count}</span>
                </div>
              </div>
              
              <div className="bar-container">
                <div className="bar-label">Avg Activity</div>
                <div className="bar-wrapper">
                  <div 
                    className="horizontal-bar activity-bar" 
                    style={{ width: `${(item.averageActivity / maxActivity) * 100}%` }}
                    title={`${item.averageActivity.toFixed(1)} sessions`}
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