import { useState } from "react";

export default function SearchBar({ onSearch, loading }) {
  const [query, setQuery] = useState("");

  function handleKeyDown(e) {
    if (e.key === "Enter" && query.trim()) {
      onSearch(query.trim());
    }
  }

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search your browsing history..."
        className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-blue-400"
      />
      <button
        onClick={() => query.trim() && onSearch(query.trim())}
        disabled={loading}
        className="bg-blue-500 text-white px-3 py-2 rounded text-sm disabled:opacity-50"
      >
        {loading ? "..." : "Search"}
      </button>
    </div>
  );
}
