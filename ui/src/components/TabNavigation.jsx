import "../../style/TabNavigation.css";

export default function TabNavigation({ activeTab, onTabChange }) {
  const tabs = [
    { id: "search", label: "Search" },
    { id: "memories", label: "Memories" },
    { id: "chat", label: "Chat" },
    { id: "summary", label: "Summary" },
  ];

  return (
    <div className="tab-navigation">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
