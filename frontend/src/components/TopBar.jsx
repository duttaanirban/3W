import { useEffect, useRef, useState } from "react";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import NotificationsNone from "@mui/icons-material/NotificationsNone";
import Search from "@mui/icons-material/Search";
import Logout from "@mui/icons-material/Logout";

function TopBar({
  user,
  onLogout,
  notifications,
  onMarkNotificationRead,
  searchQuery,
  onSearchChange,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const menuRef = useRef(null);
  const notifRef = useRef(null);

  const username = user?.username || "User";
  const initial = username.charAt(0).toUpperCase();
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="topbar">
      <span className="navbar-brand">Social</span>

      <div className="topbar-search">
        <Search aria-hidden="true" />
        <input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search for people, posts, or topics..."
        />
      </div>

      <div className="topbar-right">
        <div className="notif-wrap" ref={notifRef}>
          <button
            className="icon-btn"
            onClick={() => setNotifOpen((prev) => !prev)}
          >
            <NotificationsNone aria-hidden="true" />
            {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
          </button>

          {notifOpen && (
            <div className="notif-dropdown">
              <div className="notif-dropdown-heading">Notifications</div>

              {notifications.length === 0 ? (
                <p className="sidebar-empty">You're all caught up.</p>
              ) : (
                notifications.slice(0, 8).map((n) => (
                  <div key={n._id} className={`notif-item ${n.read ? "" : "unread"}`}>
                    <span>{n.text}</span>
                    {!n.read && (
                      <button
                        type="button"
                        className="notif-read-button"
                        onClick={() => onMarkNotificationRead(n._id)}
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="navbar-profile" ref={menuRef}>
          <button
            className="navbar-profile-trigger"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <span className="navbar-avatar">{initial}</span>
            <span className="navbar-username">{username}</span>
            <KeyboardArrowDown className={`navbar-chevron ${menuOpen ? "open" : ""}`} aria-hidden="true" />
          </button>

          {menuOpen && (
            <div className="navbar-dropdown">
              <div className="navbar-dropdown-header">
                <span className="navbar-avatar">{initial}</span>
                <div>
                  <strong>{username}</strong>
                  {user?.email && <span>{user.email}</span>}
                </div>
              </div>

              <button className="navbar-dropdown-item logout" onClick={onLogout}>
                <Logout aria-hidden="true" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default TopBar;