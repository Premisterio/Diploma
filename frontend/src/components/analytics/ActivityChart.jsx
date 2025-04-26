function ActivityChart({ hourlyActivity }) {
  return (
    <div className="chart-placeholder">
      <div className="chart-bars">
        {hourlyActivity && Object.entries(hourlyActivity).map(([hour, count], index) => {
          // Calculate relative height based on the maximum value
          const maxCount = Math.max(...Object.values(hourlyActivity));
          const height = (count / maxCount) * 100;
          
          return (
            <div key={index} className="chart-bar-container">
              <div 
                className="chart-bar" 
                style={{ height: `${height}%` }}
                title={`Година ${hour}: ${count} сеансів`}
              ></div>
              <div className="chart-label">{hour}</div>
            </div>
          );
        })}
      </div>
      <p className="chart-note">Графік активності користувачів за вибраний період</p>
    </div>
  );
}

export default ActivityChart;