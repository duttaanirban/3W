function BottomNav({ active, onChange }) {
  const items = [
    { id: "home", icon: "⌂", label: "Home" },
    { id: "discover", icon: "◈", label: "Discover" },
    { id: "create", icon: "+", label: "Create" },
    { id: "people", icon: "🏆", label: "Board" },
    { id: "profile", icon: "A", label: "Profile" },
  ];

  return (
    <nav className="bottom-nav">
      {items.map((item) => (
        <button
          key={item.id}
          className={active === item.id ? "active" : ""}
          onClick={() => onChange(item.id)}
        >
          <span className={item.id === "profile" ? "nav-avatar" : ""}>
            {item.icon}
          </span>
          <small>{item.label}</small>
        </button>
      ))}
    </nav>
  );
}

export default BottomNav;