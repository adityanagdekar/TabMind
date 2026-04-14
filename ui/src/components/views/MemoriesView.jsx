import { useState, useEffect } from "react";
import MemoryCard from "../MemoryCard";
import { getEntriesByProject } from "../../db";
import "../../../style/MemoriesView.css";

export default function MemoriesView({ activeProjectId }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEntries();
  }, [activeProjectId]);

  async function loadEntries() {
    setLoading(true);
    try {
      const projectEntries = await getEntriesByProject(activeProjectId);
      // Sort by timestamp (newest first)
      const sorted = projectEntries.sort((a, b) => b.timestamp - a.timestamp);
      setEntries(sorted);
    } catch (err) {
      console.error("Failed to load entries:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="memories-loading">Loading memories...</div>;
  }

  if (entries.length === 0) {
    return (
      <div className="memories-empty">
        <p>No memories yet. Browse some pages to get started!</p>
      </div>
    );
  }

  return (
    <div className="memories-view">
      <div className="memories-grid">
        {entries.map((entry) => (
          <MemoryCard key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}
