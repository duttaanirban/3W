import { useEffect, useRef, useState } from "react";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import Logout from "@mui/icons-material/Logout";

function TopBar({ user, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const username = user?.username || "User";
  const initial = username.charAt(0).toUpperCase();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="navbar-shell">
      <nav className="navbar-pill">
        <span className="navbar-brand">Social</span>

        <div className="navbar-profile" ref={menuRef}>
          <button
            className="navbar-profile-trigger"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            title="Open account menu"
          >
            <span className="navbar-avatar">{initial}</span>
            <span className="navbar-username">{username}</span>
            <KeyboardArrowDown
              className={`navbar-chevron ${menuOpen ? "open" : ""}`}
              aria-hidden="true"
            />
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

              <button
                className="navbar-dropdown-item logout"
                onClick={onLogout}
              >
                <Logout aria-hidden="true" />
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}

export default TopBar;