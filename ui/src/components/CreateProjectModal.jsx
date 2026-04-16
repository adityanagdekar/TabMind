import { useState } from "react";
import "../../style/CreateProjectModal.css";

export default function CreateProjectModal({ isOpen, onClose, onCreate }) {
  const [projectName, setProjectName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleCreate() {
    if (!projectName.trim()) {
      setError("Project name is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onCreate(projectName.trim());
      setProjectName("");
      onClose();
    } catch (err) {
      setError("Failed to create project");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      handleCreate();
    }
  }

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">New Project</h2>
          <button onClick={onClose} className="modal-close-button">
            <svg className="modal-close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="modal-field">
          <label className="modal-label">Project Name</label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., Research, Work, Personal"
            className="modal-input"
            disabled={loading}
            autoFocus
          />
        </div>

        {error && <div className="modal-message error">{error}</div>}

        <div className="modal-actions">
          <button onClick={onClose} className="modal-button modal-button-secondary" disabled={loading}>
            Cancel
          </button>
          <button onClick={handleCreate} disabled={loading} className="modal-button modal-button-primary">
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
