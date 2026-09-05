import { useState } from "react";

function RightPanel({ profile, trending, suggestions, onFollow, onSaveBio }) {
  const [editing, setEditing] = useState(false);
  const [bioDraft, setBioDraft] = useState(profile?.bio || "");
  const [saving, setSaving] = useState(false);

  const initial = (profile?.username || "U").charAt(0).toUpperCase();

  const startEditing = () => {
    setBioDraft(profile?.bio || "");
    setEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSaveBio(bioDraft.trim());
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <aside className="right-panel">
      <div className="panel-card profile-card">
        <div className="profile-card-top">
          <div className="avatar avatar-medium">{initial}</div>

          <div className="profile-card-names">
            <strong>{profile?.username}</strong>
            <span>@{profile?.username}</span>
          </div>

          {!editing && (
            <button className="edit-profile-btn" onClick={startEditing}>
              Edit Profile
            </button>
          )}
        </div>

        <div className="profile-stats-row">
          <div>
            <strong>{profile?.postsCount ?? 0}</strong>
            <span>Posts</span>
          </div>
          <div>
            <strong>{profile?.followersCount ?? 0}</strong>
            <span>Followers</span>
          </div>
          <div>
            <strong>{profile?.followingCount ?? 0}</strong>
            <span>Following</span>
          </div>
        </div>

        {editing ? (
          <div className="bio-edit">
            <textarea
              value={bioDraft}
              onChange={(e) => setBioDraft(e.target.value)}
              placeholder="Add a short bio..."
              rows={2}
              maxLength={140}
            />

            <div className="bio-edit-actions">
              <button
                className="bio-cancel"
                type="button"
                onClick={() => setEditing(false)}
              >
                Cancel
              </button>

              <button
                className="bio-save"
                type="button"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        ) : (
          <p className="profile-quote">
            {profile?.bio || "Add a bio to tell people about yourself."}
          </p>
        )}
      </div>

      <div className="panel-card">
        <div className="panel-card-heading">
          <span>🔥 Trending Topics</span>
        </div>

        {trending.length === 0 ? (
          <p className="sidebar-empty">Nothing trending yet.</p>
        ) : (
          <div className="trending-list">
            {trending.slice(0, 5).map((t, i) => (
              <div className="trending-row" key={t.tag}>
                <span className="trending-rank">{i + 1}</span>
                <div>
                  <strong>#{t.tag}</strong>
                  <span>{t.postsCount} posts</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="panel-card">
        <div className="panel-card-heading">
          <span>Suggestions for you</span>
        </div>

        {suggestions.length === 0 ? (
          <p className="sidebar-empty">No suggestions right now.</p>
        ) : (
          <div className="suggestions-list">
            {suggestions.slice(0, 5).map((s) => (
              <div className="suggestion-row" key={s._id}>
                <div className="avatar avatar-small">
                  {(s.username || "U").charAt(0).toUpperCase()}
                </div>

                <div className="suggestion-names">
                  <strong>{s.username}</strong>
                  <span>@{s.username}</span>
                </div>

                <button
                  className={`follow-toggle ${s.isFollowing ? "following" : ""}`}
                  onClick={() => onFollow(s._id)}
                >
                  {s.isFollowing ? "Following" : "Follow"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

export default RightPanel;