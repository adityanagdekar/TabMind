import "./ResultsList.css";

export default function ResultsList({ results }) {
  if (results.length === 0) return null;

  return (
    <div className="results-container">
      {results.map((entry) => (
        <a
          key={entry.url}
          href={entry.url}
          target="_blank"
          rel="noreferrer"
          className="result-card"
        >
          <div className="result-content">
            <div className="result-info">
              <h3 className="result-title">
                {entry.title || entry.url}
              </h3>
              <p className="result-url">
                {entry.url}
              </p>
            </div>
            <div className="result-score">
              {(entry.score * 100).toFixed(0)}%
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}