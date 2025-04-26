import React from 'react';

function ActivityChart({ hourlyActivity = {}, weeklyActivity = {} }) {
  return (
    <div className="activity-charts">
      <div className="chart-container">
        <h4 className="chart-title">Hourly Activity</h4>
        <div className="chart-bars hourly-chart">
          {Object.entries(hourlyActivity).map(([hour, count], index) => {
            // Calculate relative height based on the maximum value
            const maxCount = Math.max(...Object.values(hourlyActivity));
            const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
            
            return (
              <div key={index} className="chart-bar-container">
                <div 
                  className="chart-bar" 
                  style={{ height: `${height}%` }}
                  title={`Hour ${hour}: ${count} sessions`}
                ></div>
                <div className="chart-label">{hour}</div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="chart-container">
        <h4 className="chart-title">Weekly Activity</h4>
        <div className="chart-bars weekly-chart">
          {Object.entries(weeklyActivity).map(([day, count], index) => {
            // Calculate relative height based on the maximum value
            const maxCount = Math.max(...Object.values(weeklyActivity));
            const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
            
            // Convert day to shortened format
            const shortDay = day.substring(0, 3);
            
            return (
              <div key={index} className="chart-bar-container">
                <div 
                  className="chart-bar" 
                  style={{ height: `${height}%` }}
                  title={`${day}: ${count} sessions`}
                ></div>
                <div className="chart-label">{shortDay}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ActivityChart;