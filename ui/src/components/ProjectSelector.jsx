import { useState, useEffect } from "react";
import { getAllProjects } from "../db";
import "../../style/ProjectSelector.css";

export default function ProjectSelector({ activeProjectId, onProjectChange }) {
  const [projects, setProjects] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    const allProjects = await getAllProjects();
    setProjects(allProjects);
  }

  const activeProject = projects.find((p) => p.id === activeProjectId);

  function handleSelect(projectId) {
    onProjectChange(projectId);
    setIsOpen(false);
  }

  return (
    <div className="project-selector">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="project-selector-button"
        title="Switch project"
      >
        <svg className="project-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
        <span className="project-name">{activeProject?.name || "Select Project"}</span>
        <svg className="chevron-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="project-dropdown">
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => handleSelect(project.id)}
              className={`project-option ${project.id === activeProjectId ? "active" : ""}`}
            >
              <span>{project.name}</span>
              {project.id === activeProjectId && (
                <svg className="check-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
