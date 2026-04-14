import { useState } from "react";
import "./SearchBar.css";

export default function SearchBar({ onSearch, loading }) {
  const [query, setQuery] = useState("");

  function handleKeyDown(e) {
    if (e.key === "Enter" && query.trim()) {
      onSearch(query.trim());
    }
  }

  return (
    <div className="search-container">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search your browsing history..."
        className="search-input"
      />
      <button
        onClick={() => query.trim() && onSearch(query.trim())}
        disabled={loading}
        className="search-button"
      >
        {loading ? "..." : "Search"}
      </button>
    </div>
  );
}
