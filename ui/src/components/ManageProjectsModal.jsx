import { useState, useEffect } from "react";
import { getAllProjects, updateProject, deleteProject, getProjectEntryCount } from "../db";
import "../../style/ManageProjectsModal.css";

export default function ManageProjectsModal({ isOpen, onClose, activeProjectId, onProjectChange, onProjectsChanged }) {
  const [projects, setProjects] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadProjects();
    }
  }, [isOpen]);

  async function loadProjects() {
    console.log("[ManageProjectsModal] Loading projects...");
    const allProjects = await getAllProjects();
    const projectsWithCounts = await Promise.all(
      allProjects.map(async (p) => ({
        ...p,
        entryCount: await getProjectEntryCount(p.id),
      }))
    );
    console.log("[ManageProjectsModal] Loaded projects with counts:", projectsWithCounts);
    setProjects(projectsWithCounts);
  }

  function startEdit(project) {
    setEditingId(project.id);
    setEditName(project.name);
  }

  async function saveEdit(projectId) {
    if (!editName.trim()) return;
    setLoading(true);
    await updateProject(projectId, editName.trim());
    setEditingId(null);
    await loadProjects();
    onProjectsChanged();
    setLoading(false);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
  }

  async function handleDelete(project) {
    if (projects.length === 1) {
      alert("Cannot delete the last project");
      return;
    }

    if (!confirm(`Delete "${project.name}"? This will delete ${project.entryCount} memories.`)) {
      return;
    }

    setLoading(true);
    await deleteProject(project.id);

    // If deleting active project, switch to first remaining project
    if (project.id === activeProjectId) {
      const remaining = projects.filter((p) => p.id !== project.id);
      if (remaining.length > 0) {
        onProjectChange(remaining[0].id);
      }
    }

    await loadProjects();
    onProjectsChanged();
    setLoading(false);
  }

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="manage-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Manage Projects</h2>
          <button onClick={onClose} className="modal-close-button">
            <svg className="modal-close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="projects-list">
          { projects.map((project) => (
            <div key={project.id} className="project-item">
              {editingId === project.id ? (
                <div className="project-edit">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit(project.id);
                      if (e.key === "Escape") cancelEdit();
                    }}
                    className="project-edit-input"
                    autoFocus
                  />
                  <button onClick={() => saveEdit(project.id)} className="project-action-button save">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <button onClick={cancelEdit} className="project-action-button cancel">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="project-info">
                  <div className="project-details">
                    <span className="project-name">{project.name}</span>
                    <span className="project-count">{project.entryCount} memories</span>
                  </div>
                  <div className="project-actions">
                    <button onClick={() => startEdit(project)} className="project-action-button" disabled={loading}>
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button onClick={() => handleDelete(project)} className="project-action-button delete" disabled={loading || projects.length === 1}>
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
