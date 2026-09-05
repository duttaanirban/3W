import BookmarkBorder from "@mui/icons-material/BookmarkBorder";
import HomeOutlined from "@mui/icons-material/HomeOutlined";
import PeopleAltOutlined from "@mui/icons-material/PeopleAltOutlined";
import SettingsOutlined from "@mui/icons-material/SettingsOutlined";
import Tag from "@mui/icons-material/Tag";

function Sidebar({ activeView, onChangeView, communities, activeCommunity, onSelectCommunity }) {
  const navItems = [
    { id: "home", icon: HomeOutlined, label: "Home" },
    { id: "people", icon: PeopleAltOutlined, label: "People" },
    { id: "saved", icon: BookmarkBorder, label: "Saved" },
    { id: "settings", icon: SettingsOutlined, label: "Settings" },
  ];

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar-item ${activeView === item.id ? "active" : ""}`}
            onClick={() => onChangeView(item.id)}
          >
            <span><item.icon aria-hidden="true" /></span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-divider" />

      <div className="sidebar-communities">
        <div className="sidebar-communities-heading">
          <span>Communities</span>
        </div>

        {communities.length === 0 ? (
          <p className="sidebar-empty">No communities yet.</p>
        ) : (
          communities.map((c) => (
            <button
              key={c._id}
              className={`community-item ${activeCommunity === c._id ? "active" : ""}`}
              onClick={() => onSelectCommunity(c._id)}
            >
              <Tag className="community-hash" aria-hidden="true" />
              {c.name}
            </button>
          ))
        )}
      </div>

      <div className="sidebar-cta">
        <h3>Keep Building</h3>
        <p>Ideas turn into impact when shared.</p>
        <button onClick={() => onChangeView("home")}>
          Create a Post <span>→</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;