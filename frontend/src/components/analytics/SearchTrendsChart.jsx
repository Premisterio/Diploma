import React from 'react';

function SearchTrendsChart({ searchTerms = {}, searchesByHour = {} }) {
  // Process top search terms
  const topTerms = Object.entries(searchTerms || {})
    .slice(0, 10)
    .map(([term, count]) => ({ term, count }))
    .sort((a, b) => b.count - a.count);
  
  // Calculate max count for scaling
  const maxTermCount = Math.max(...topTerms.map(item => item.count), 1);
  
  // Process hourly search data
  const hourlyData = Object.entries(searchesByHour || {})
    .map(([hour, count]) => ({ hour: parseInt(hour), count }))
    .sort((a, b) => a.hour - b.hour);
  
  return (
    <div className="search-trends-container">
      <div className="search-terms-chart">
        <h4>Top Search Terms</h4>
        <div className="search-terms-cloud">
          {topTerms.map((item, index) => (
            <div 
              key={index} 
              className="search-term-item"
              style={{ 
                fontSize: `${Math.max(0.8, (item.count / maxTermCount) * 1.5 + 0.5)}em`,
                opacity: Math.max(0.6, (item.count / maxTermCount) * 0.4 + 0.6)
              }}
            >
              {item.term}
            </div>
          ))}
        </div>
      </div>
      
      <div className="hourly-search-chart">
        <h4>Searches by Hour</h4>
        <div className="chart-bars hourly-search-bars">
          {hourlyData.map((item, index) => {
            // Calculate relative height
            const maxCount = Math.max(...hourlyData.map(d => d.count));
            const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
            
            return (
              <div key={index} className="chart-bar-container">
                <div 
                  className="chart-bar search-bar" 
                  style={{ height: `${height}%` }}
                  title={`Hour ${item.hour}: ${item.count} searches`}
                ></div>
                <div className="chart-label">{item.hour}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default SearchTrendsChart;