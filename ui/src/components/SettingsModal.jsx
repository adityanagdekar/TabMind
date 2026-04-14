import { useState, useEffect } from "react";
import { saveApiKey, getApiKey, removeApiKey } from "../storage";
import "../style/SettingsModal.css";

export default function SettingsModal({ isOpen, onClose }) {
  const [apiKey, setApiKey] = useState("");
  const [savedKey, setSavedKey] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadExistingKey();
    }
  }, [isOpen]);

  async function loadExistingKey() {
    try {
      const existingKey = await getApiKey();
      if (existingKey) {
        setSavedKey(existingKey);
        // Show masked version
        setApiKey(maskApiKey(existingKey));
      }
    } catch (err) {
      console.error("Failed to load API key:", err);
    }
  }

  function maskApiKey(key) {
    if (!key || key.length < 10) return key;
    return key.slice(0, 7) + "..." + key.slice(-4);
  }

  async function handleSave() {
    if (!apiKey.trim()) {
      setMessage({ type: "error", text: "Please enter an API key" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await saveApiKey(apiKey);
      setSavedKey(apiKey);
      setMessage({ type: "success", text: "API key saved successfully!" });

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setMessage({ type: "error", text: "Failed to save API key" });
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove() {
    if (!confirm("Are you sure you want to remove the API key?")) {
      return;
    }

    setLoading(true);
    try {
      await removeApiKey();
      setSavedKey(null);
      setApiKey("");
      setMessage({ type: "success", text: "API key removed" });
    } catch (err) {
      setMessage({ type: "error", text: "Failed to remove API key" });
    } finally {
      setLoading(false);
    }
  }

  function handleInputFocus() {
    // Clear the masked value when user focuses
    if (savedKey && apiKey === maskApiKey(savedKey)) {
      setApiKey("");
    }
  }

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Settings</h2>
          <button onClick={onClose} className="modal-close-button">
            <svg className="modal-close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="modal-field">
          <label className="modal-label">OpenAI API Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            onFocus={handleInputFocus}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            placeholder="sk-proj-..."
            className="modal-input"
            disabled={loading}
          />
          <p className="modal-hint">
            Get your API key from{" "}
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="modal-link"
            >
              OpenAI Dashboard
            </a>
          </p>
        </div>

        {message && (
          <div className={`modal-message ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="modal-actions">
          <button
            onClick={handleSave}
            disabled={loading}
            className="modal-button modal-button-primary"
          >
            {loading ? "Saving..." : "Save"}
          </button>
          {savedKey && (
            <button
              onClick={handleRemove}
              disabled={loading}
              className="modal-button modal-button-secondary"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
