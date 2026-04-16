import { useState, useEffect } from "react";
import TabNavigation from "./components/TabNavigation";
import SearchView from "./components/views/SearchView";
import MemoriesView from "./components/views/MemoriesView";
import ChatView from "./components/views/ChatView";
import SummaryView from "./components/views/SummaryView";
import ProjectSelector from "./components/ProjectSelector";
import SettingsModal from "./components/SettingsModal";
import CreateProjectModal from "./components/CreateProjectModal";
import ManageProjectsModal from "./components/ManageProjectsModal";
import { ensureDefaultProject, createProject } from "./db";
import { saveActiveProjectId } from "./storage";
import "./App.css";

export default function App() {
  const [activeTab, setActiveTab] = useState("search");
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showManageProjects, setShowManageProjects] = useState(false);
  const [projectsRefreshTrigger, setProjectsRefreshTrigger] = useState(0);

  useEffect(() => {
    initializeProject();
  }, []);

  async function initializeProject() {
    const projectId = await ensureDefaultProject();
    setActiveProjectId(projectId);
  }

  async function handleProjectChange(projectId) {
    setActiveProjectId(projectId);
    await saveActiveProjectId(projectId);
  }

  async function handleCreateProject(name) {
    const newProjectId = await createProject(name);
    setActiveProjectId(newProjectId);
    await saveActiveProjectId(newProjectId);
    setProjectsRefreshTrigger(prev => prev + 1);
  }

  function handleProjectsChanged() {
    setProjectsRefreshTrigger(prev => prev + 1);
  }

  function renderView() {
    if (!activeProjectId) return null;

    switch (activeTab) {
      case "search":
        return <SearchView activeProjectId={activeProjectId} />;
      case "memories":
        return <MemoriesView activeProjectId={activeProjectId} />;
      case "chat":
        return <ChatView activeProjectId={activeProjectId} />;
      case "summary":
        return <SummaryView activeProjectId={activeProjectId} />;
      default:
        return <SearchView activeProjectId={activeProjectId} />;
    }
  }

  return (
    <div className="app-container">
      <div className="app-header">
        <h1 className="app-title">TabMind</h1>
        <div className="header-actions">
          <ProjectSelector
            activeProjectId={activeProjectId}
            onProjectChange={handleProjectChange}
            onNewProject={() => setShowCreateProject(true)}
            onManageProjects={() => setShowManageProjects(true)}
            refreshTrigger={projectsRefreshTrigger}
          />
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
      </div>

      <div className="content-wrapper">
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        {renderView()}
      </div>

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

      <CreateProjectModal
        isOpen={showCreateProject}
        onClose={() => setShowCreateProject(false)}
        onCreate={handleCreateProject}
      />

      <ManageProjectsModal
        isOpen={showManageProjects}
        onClose={() => setShowManageProjects(false)}
        activeProjectId={activeProjectId}
        onProjectChange={handleProjectChange}
        onProjectsChanged={handleProjectsChanged}
      />
    </div>
  );
}
