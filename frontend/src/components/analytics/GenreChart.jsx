import React, { useEffect, useRef } from 'react';

function GenreChart({ genrePopularity = {} }) {
  const chartRef = useRef(null);

  // Process data for display
  const genreData = Object.entries(genrePopularity || {}).map(([genre, count], index) => ({
    genre,
    count,
    color: getColorForIndex(index)
  }));

  // Total for percentage calculation
  const total = genreData.reduce((sum, item) => sum + item.count, 0);

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

  // Draw the pie chart using CSS conic gradient
  useEffect(() => {
    if (!chartRef.current || genreData.length === 0) return;

    let cumulativePercentage = 0;
    let gradientString = '';

    genreData.forEach((item, index) => {
      const percentage = (item.count / total) * 100;
      const startPercentage = cumulativePercentage;
      cumulativePercentage += percentage;
      
      gradientString += `${item.color} ${startPercentage}% ${cumulativePercentage}%`;
      if (index < genreData.length - 1) {
        gradientString += ', ';
      }
    });

    chartRef.current.style.background = `conic-gradient(${gradientString})`;
  }, [genreData, total]);

  return (
    <div className="genre-chart-container">
      <div className="genre-chart-flex-container">
        <div className="pie-chart-wrapper">
          <div ref={chartRef} className="pie-chart"></div>
        </div>
        
        <div className="chart-legend">
          {genreData.length > 0 ? (
            genreData.map((item, index) => (
              <div key={index} className="legend-item">
                <span 
                  className="legend-color" 
                  style={{ backgroundColor: item.color }}
                ></span>
                <span className="legend-label">
                  {item.genre}: {((item.count / total) * 100).toFixed(1)}% ({item.count})
                </span>
              </div>
            ))
          ) : (
            // Placeholder legend items if no data
            ['Fiction', 'Science', 'History', 'Biography'].map((genre, index) => (
              <div key={index} className="legend-item">
                <span 
                  className="legend-color" 
                  style={{ backgroundColor: getColorForIndex(index) }}
                ></span>
                <span className="legend-label">
                  {genre}: {(Math.random() * 30 + 5).toFixed(1)}%
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default GenreChart;