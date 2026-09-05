function FeedTabs({ active, onChange }) {
  const tabs = [
    { id: "all", label: "All Posts" },
    { id: "following", label: "Following" },
    { id: "popular", label: "Popular" },
    { id: "latest", label: "Latest" },
  ];

  return (
    <div className="feed-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`feed-tab ${active === tab.id ? "active" : ""}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export default FeedTabs;