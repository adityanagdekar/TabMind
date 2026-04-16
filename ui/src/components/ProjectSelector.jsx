import { useState, useEffect } from "react";
import { getAllProjects } from "../db";
import "../../style/ProjectSelector.css";

export default function ProjectSelector({ activeProjectId, onProjectChange, onNewProject, onManageProjects, refreshTrigger }) {
  const [projects, setProjects] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadProjects();
  }, [refreshTrigger]);

  function handleToggleDropdown() {
    if (!isOpen) {
      loadProjects(); // Fresh data when opening
    }
    setIsOpen(!isOpen);
  }

  async function loadProjects() {
    const allProjects = await getAllProjects();
    setProjects(allProjects);
  }

  const activeProject = projects.find((p) => p.id === activeProjectId);

  function handleSelect(projectId) {
    onProjectChange(projectId);
    setIsOpen(false);
  }

  function handleNewProject() {
    setIsOpen(false);
    onNewProject();
  }

  function handleManage() {
    setIsOpen(false);
    onManageProjects();
  }

  return (
    <div className="project-selector">
      <button
        // onClick={() => setIsOpen(!isOpen)}
        onClick={handleToggleDropdown}
        className="project-selector-button"
        title="Switch project"
      >
        <svg
          className="project-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
          />
        </svg>
        <span className="project-name">
          {activeProject?.name || "Select Project"}
        </span>
        <svg
          className="chevron-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="project-dropdown">
          <button onClick={handleNewProject} className="project-option special">
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>New Project</span>
          </button>

          <div className="dropdown-divider"></div>

          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => handleSelect(project.id)}
              className={`project-option ${project.id === activeProjectId ? "active" : ""}`}
            >
              <span>{project.name}</span>
              {project.id === activeProjectId && (
                <svg
                  className="check-icon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </button>
          ))}

          <div className="dropdown-divider"></div>

          <button onClick={handleManage} className="project-option special">
            <svg
              width="16"
              height="16"
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
            </svg>
            <span>Manage Projects</span>
          </button>
        </div>
      )}
    </div>
  );
}
