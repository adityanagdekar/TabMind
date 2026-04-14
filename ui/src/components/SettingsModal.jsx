import { useState, useEffect } from "react";
import { saveApiKey, getApiKey, removeApiKey } from "../storage";

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-[360px]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            OpenAI API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            onFocus={handleInputFocus}
            placeholder="sk-proj-..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">
            Get your API key from{" "}
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              OpenAI Dashboard
            </a>
          </p>
        </div>

        {message && (
          <div
            className={`mb-4 p-2 rounded text-sm ${
              message.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {loading ? "Saving..." : "Save"}
          </button>
          {savedKey && (
            <button
              onClick={handleRemove}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
