import React from 'react';

function BookCompletionChart({ completionRates = {} }) {
  const completionData = Object.entries(completionRates || {})
    .map(([genre, rate]) => ({
      genre,
      rate: parseFloat(rate),
      percentage: parseFloat(rate) * 100
    }))
    .sort((a, b) => b.rate - a.rate);

  return (
    <div className="completion-chart-container">
      <h4>Book Completion Rates by Genre</h4>
      
      <div className="completion-bars">
        {completionData.map((item, index) => (
          <div key={index} className="completion-bar-item">
            <div className="genre-label">{item.genre}</div>
            <div className="progress-bar-container">
              <div className="progress-bar-background">
                <div 
                  className="progress-bar-fill"
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
              <div className="progress-value">{item.percentage.toFixed(1)}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BookCompletionChart;