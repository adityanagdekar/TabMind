import { useState } from "react";
import SearchBar from "../SearchBar";
import ResultsList from "../ResultsList";
import { searchHistory } from "../../embeddings";
import { getEntriesByProject } from "../../db";
import "../../../style/SearchView.css";

export default function SearchView({ activeProjectId }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSearch(query) {
    setLoading(true);
    setError(null);
    try {
      const entries = await getEntriesByProject(activeProjectId);
      if (entries.length === 0) {
        setError("No history indexed yet. Browse some pages first.");
        return;
      }
      const topResults = await searchHistory(query, entries);
      setResults(topResults);
    } catch (err) {
      setError("Something went wrong. Check your API key.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="search-view">
      <SearchBar onSearch={handleSearch} loading={loading} />
      {error && <div className="error-message">{error}</div>}
      <ResultsList results={results} />
    </div>
  );
}
