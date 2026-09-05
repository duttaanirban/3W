import { useState } from "react";
import DarkModeOutlined from "@mui/icons-material/DarkModeOutlined";
import DeleteForeverOutlined from "@mui/icons-material/DeleteForeverOutlined";
import Logout from "@mui/icons-material/Logout";
import NotificationsNone from "@mui/icons-material/NotificationsNone";
import Person from "@mui/icons-material/Person";
import SaveOutlined from "@mui/icons-material/SaveOutlined";
import SettingsOutlined from "@mui/icons-material/SettingsOutlined";
import WbSunnyOutlined from "@mui/icons-material/WbSunnyOutlined";

function Settings({ profile, theme, onThemeChange, onSaveBio, onDeleteAccount, onLogout }) {
  const [bio, setBio] = useState(profile?.bio || "");
  const [savingBio, setSavingBio] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [notifications, setNotifications] = useState(() => ({
    likes: localStorage.getItem("setting-notifications-likes") !== "false",
    comments: localStorage.getItem("setting-notifications-comments") !== "false",
    follows: localStorage.getItem("setting-notifications-follows") !== "false",
  }));

  const saveBio = async () => {
    setSavingBio(true);
    setSavedMessage("");
    try {
      await onSaveBio(bio.trim());
      setSavedMessage("Profile saved");
    } finally {
      setSavingBio(false);
    }
  };

  const updateNotification = (key, value) => {
    setNotifications((current) => ({ ...current, [key]: value }));
    localStorage.setItem(`setting-notifications-${key}`, String(value));
  };

  const deleteAccount = async () => {
    setDeletingAccount(true);
    setDeleteError("");

    try {
      await onDeleteAccount();
    } catch (error) {
      setDeleteError(error.response?.data?.message || "Couldn't delete your account. Try again.");
      setDeletingAccount(false);
    }
  };

  return (
    <section className="settings-page" aria-labelledby="settings-title">
      <div className="settings-heading">
        <div className="settings-heading-icon" aria-hidden="true">
          <SettingsOutlined />
        </div>
        <div>
          <p className="eyebrow">CONTROL CENTER</p>
          <h1 id="settings-title">Settings</h1>
          <p>Shape your Social experience and profile.</p>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-heading">
          <Person aria-hidden="true" />
          <div>
            <h2>Profile</h2>
            <p>How people see you.</p>
          </div>
        </div>
        <div className="settings-profile-row">
          <div className="avatar avatar-large">{(profile?.username || "U").charAt(0).toUpperCase()}</div>
          <div>
            <strong>{profile?.username || "User"}</strong>
            <span>{profile?.email || ""}</span>
          </div>
        </div>
        <label className="settings-field">
          Bio
          <textarea value={bio} onChange={(event) => setBio(event.target.value)} maxLength={140} rows={3} placeholder="Tell people about yourself" />
          <small>{bio.length}/140</small>
        </label>
        <div className="settings-action-row">
          <button type="button" className="settings-primary-button" onClick={saveBio} disabled={savingBio}>
            <SaveOutlined aria-hidden="true" />
            {savingBio ? "Saving..." : "Save profile"}
          </button>
          {savedMessage && <span className="settings-success">{savedMessage}</span>}
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-heading">
          {theme === "light" ? <WbSunnyOutlined aria-hidden="true" /> : <DarkModeOutlined aria-hidden="true" />}
          <div>
            <h2>Appearance</h2>
            <p>Choose the look that feels right.</p>
          </div>
        </div>
        <div className="theme-options">
          <button type="button" className={theme === "dark" ? "theme-option active" : "theme-option"} onClick={() => onThemeChange("dark")}>
            <DarkModeOutlined aria-hidden="true" />
            Dark
          </button>
          <button type="button" className={theme === "light" ? "theme-option active" : "theme-option"} onClick={() => onThemeChange("light")}>
            <WbSunnyOutlined aria-hidden="true" />
            Light
          </button>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-heading">
          <NotificationsNone aria-hidden="true" />
          <div>
            <h2>Notifications</h2>
            <p>Choose what appears in your notification feed.</p>
          </div>
        </div>
        <div className="settings-toggles">
          {[
            ["likes", "Likes", "When someone likes your post"],
            ["comments", "Comments", "When someone comments on your post"],
            ["follows", "New followers", "When someone follows you"],
          ].map(([key, label, description]) => (
            <label className="settings-toggle" key={key}>
              <span><strong>{label}</strong><small>{description}</small></span>
              <input type="checkbox" checked={notifications[key]} onChange={(event) => updateNotification(key, event.target.checked)} />
            </label>
          ))}
        </div>
      </div>

      <div className="settings-account-actions">
        <button type="button" className="settings-logout" onClick={onLogout}>
          <Logout aria-hidden="true" />
          Log out
        </button>

        <button
          type="button"
          className="settings-delete-account"
          onClick={() => {
            setDeleteError("");
            setConfirmDelete(true);
          }}
        >
          <DeleteForeverOutlined aria-hidden="true" />
          Delete account
        </button>
      </div>

      {confirmDelete && (
        <div className="dialog-backdrop" role="presentation">
          <div className="delete-dialog" role="alertdialog" aria-modal="true" aria-labelledby="delete-account-title">
            <div className="delete-dialog-icon">
              <DeleteForeverOutlined aria-hidden="true" />
            </div>
            <h3 id="delete-account-title">Delete your account?</h3>
            <p>This permanently removes your profile, posts, likes, comments, and notifications.</p>
            {deleteError && <p className="post-action-error">{deleteError}</p>}
            <div className="delete-dialog-actions">
              <button type="button" onClick={() => setConfirmDelete(false)} disabled={deletingAccount}>
                Cancel
              </button>
              <button type="button" className="delete-account-confirm" onClick={deleteAccount} disabled={deletingAccount}>
                {deletingAccount ? "Deleting..." : "Delete account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Settings;
