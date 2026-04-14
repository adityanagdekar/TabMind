import "../../style/MemoryCard.css";

export default function MemoryCard({ entry }) {
  const formattedDate = new Date(entry.timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const excerpt = entry.text
    ? entry.text.slice(0, 150) + (entry.text.length > 150 ? "..." : "")
    : "No content available";

  return (
    <a
      href={entry.url}
      target="_blank"
      rel="noreferrer"
      className="memory-card"
    >
      <div className="memory-header">
        <h3 className="memory-title">{entry.title || entry.url}</h3>
        <span className="memory-date">{formattedDate}</span>
      </div>
      <p className="memory-url">{entry.url}</p>
      <p className="memory-excerpt">{excerpt}</p>
    </a>
  );
}
