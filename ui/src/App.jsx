import { useState } from "react";
import SearchBar from "./components/SearchBar";
import ResultsList from "./components/ResultsList";
import SettingsModal from "./components/SettingsModal";
import { searchHistory } from "./embeddings";
import { getAllEntries } from "./db";
import "./App.css";

export default function App() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

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
    <div className="app-container">
      <div className="app-header">
        <h1 className="app-title">TabMind</h1>
        <button
          onClick={() => setShowSettings(true)}
          className="settings-button"
          title="Settings"
        >
          <svg
            className="settings-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
      </div>

      <div className="content-wrapper">
        <SearchBar onSearch={handleSearch} loading={loading} />

        {error && <div className="error-message">{error}</div>}

        <ResultsList results={results} />
      </div>

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
}
