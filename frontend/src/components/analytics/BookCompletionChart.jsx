import React from 'react';

function BookCompletionChart({ completionRates = {} }) {
  const completionData = Object.entries(completionRates)
    .map(([genre, rate]) => ({
      genre,
      rate: parseFloat(rate),
      percentage: parseFloat(rate) * 100,
    }))
    .sort((a, b) => b.rate - a.rate);

  return (
    <div className="dashboard-card">
      <h3 className="card-title">Book Completion Rates by Genre</h3>
      <div className="ratings-chart">
        {completionData.map((item, idx) => (
          <div key={idx} className="rating-bar">
            <span className="genre-name">{item.genre}</span>
            <div className="rating-bar-container">
              <div
                className="rating-bar-fill"
                style={{ width: `${item.percentage}%` }}
              />
            </div>
            <span className="rating-value">
              {item.percentage.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BookCompletionChart;
