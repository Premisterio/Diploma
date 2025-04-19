function ActivityChart() {
    return (
      <div className="chart-placeholder">
        <div className="chart-bars">
          <div className="chart-bar" style={{ height: "65%" }}></div>
          <div className="chart-bar" style={{ height: "40%" }}></div>
          <div className="chart-bar" style={{ height: "80%" }}></div>
          <div className="chart-bar" style={{ height: "55%" }}></div>
          <div className="chart-bar" style={{ height: "70%" }}></div>
          <div className="chart-bar" style={{ height: "45%" }}></div>
          <div className="chart-bar" style={{ height: "60%" }}></div>
        </div>
        <p className="chart-note">Графік активності користувачів за вибраний період</p>
      </div>
    );
  }
  
  export default ActivityChart;