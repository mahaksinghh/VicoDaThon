function ProgressBar({ current }) {
  const total = 7;

  const percentage = Math.min(
    Math.round((current / total) * 100),
    100
  );

  return (
    <div className="progress-wrapper">

      <div className="progress-label">
        <span>Interview Progress</span>
        <span>{percentage}%</span>
      </div>

      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>

    </div>
  );
}

export default ProgressBar;