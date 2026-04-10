import { useState } from "react";
import SearchBar from "./components/SearchBar";
import ResultsList from "./components/ResultsList";
import { searchHistory } from "./embeddings";
import { getAllEntries } from "./db";

export default function App() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSearch(query) {
    setLoading(true);
    setError(null);
    try {
      const entries = await getAllEntries();
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
    <div className="w-[400px] min-h-[300px] p-4 bg-white font-sans">
      <h1 className="text-lg font-semibold mb-3 text-gray-800">TabMind</h1>
      <SearchBar onSearch={handleSearch} loading={loading} />
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      <ResultsList results={results} />
    </div>
  );
}
