function TopBar({ user, onLogout }) {
  const initial = (user?.username || "U").charAt(0).toUpperCase();

  return (
    <header className="topbar">
      <div className="topbar-brand">Social</div>

      <div className="topbar-actions">
        <div className="avatar avatar-small" title={user?.username}>
          {initial}
        </div>
        <span className="topbar-username">{user?.username}</span>

        <button className="logout-button" onClick={onLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}

export default TopBar;