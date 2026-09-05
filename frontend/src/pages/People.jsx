import { useState } from "react";
import CheckCircle from "@mui/icons-material/CheckCircle";
import Close from "@mui/icons-material/Close";
import PeopleAltOutlined from "@mui/icons-material/PeopleAltOutlined";
import PersonAddAlt1 from "@mui/icons-material/PersonAddAlt1";
import Search from "@mui/icons-material/Search";
import { getUserProfile } from "../api";

function People({ suggestions, onFollow }) {
  const [query, setQuery] = useState("");
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");
  const filteredPeople = suggestions.filter((person) =>
    person.username.toLowerCase().includes(query.trim().toLowerCase())
  );

  const openProfile = async (personId) => {
    setLoadingProfile(true);
    setProfileError("");
    try {
      setSelectedPerson(await getUserProfile(personId));
    } catch (error) {
      setProfileError(error.response?.data?.message || "Could not load profile.");
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleProfileFollow = async () => {
    if (!selectedPerson) return;
    await onFollow(selectedPerson._id);
    setSelectedPerson((profile) => ({
      ...profile,
      isFollowing: !profile.isFollowing,
      followersCount: profile.followersCount + (profile.isFollowing ? -1 : 1),
    }));
  };

  return (
    <section className="people-page" aria-labelledby="people-title">
      <div className="people-hero">
        <div className="people-hero-icon" aria-hidden="true">
          <PeopleAltOutlined />
        </div>
        <div>
          <p className="eyebrow">YOUR NETWORK</p>
          <h1 id="people-title">Find your people</h1>
          <p>Follow creators and friends who make your feed worth opening.</p>
        </div>
        <div className="people-count">
          <strong>{suggestions.length}</strong>
          <span>suggestions</span>
        </div>
      </div>

      <label className="people-search">
        <Search aria-hidden="true" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search people"
          aria-label="Search people"
        />
      </label>

      {filteredPeople.length === 0 ? (
        <div className="people-empty">
          <PeopleAltOutlined aria-hidden="true" />
          <h2>{query ? "No people found" : "No suggestions yet"}</h2>
          <p>{query ? "Try a different name." : "New people will appear here as the community grows."}</p>
        </div>
      ) : (
        <div className="people-grid">
          {filteredPeople.map((person) => (
            <article
              className="person-card"
              key={person._id}
              onClick={() => openProfile(person._id)}
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") openProfile(person._id);
              }}
            >
              <div className="person-card-top">
                <div className="avatar avatar-large">
                  {(person.username || "U").charAt(0).toUpperCase()}
                </div>
                <span className="person-status">{person.isFollowing ? "Connected" : "Suggested"}</span>
              </div>
              <h2>{person.username}</h2>
              <p>@{person.username}</p>
              <button
                type="button"
                className={`person-follow-button ${person.isFollowing ? "following" : ""}`}
                onClick={(event) => {
                  event.stopPropagation();
                  onFollow(person._id);
                }}
              >
                {person.isFollowing ? (
                  <>
                    <CheckCircle aria-hidden="true" />
                    Following
                  </>
                ) : (
                  <>
                    <PersonAddAlt1 aria-hidden="true" />
                    Follow
                  </>
                )}
              </button>
            </article>
          ))}
        </div>
      )}

      {(loadingProfile || selectedPerson || profileError) && (
        <div className="profile-dialog-backdrop" role="presentation">
          <div className="profile-dialog" role="dialog" aria-modal="true" aria-labelledby="profile-dialog-title">
            <button
              type="button"
              className="profile-dialog-close"
              onClick={() => {
                setSelectedPerson(null);
                setProfileError("");
              }}
              aria-label="Close profile"
            >
              <Close aria-hidden="true" />
            </button>

            {loadingProfile ? (
              <p className="profile-dialog-loading">Loading profile...</p>
            ) : profileError ? (
              <p className="profile-dialog-error">{profileError}</p>
            ) : (
              <>
                <div className="profile-dialog-avatar avatar avatar-large">
                  {selectedPerson.username.charAt(0).toUpperCase()}
                </div>
                <h2 id="profile-dialog-title">{selectedPerson.username}</h2>
                <p className="profile-dialog-handle">@{selectedPerson.username}</p>
                <p className="profile-dialog-bio">
                  {selectedPerson.bio || "This person has not added a bio yet."}
                </p>
                <div className="profile-dialog-stats">
                  <div><strong>{selectedPerson.postsCount}</strong><span>Posts</span></div>
                  <div><strong>{selectedPerson.followersCount}</strong><span>Followers</span></div>
                  <div><strong>{selectedPerson.followingCount}</strong><span>Following</span></div>
                </div>
                <div className="profile-posts">
                  <div className="profile-posts-heading">
                    <strong>Posts</strong>
                    <span>{selectedPerson.postsCount}</span>
                  </div>
                  {selectedPerson.posts?.length ? (
                    <div className="profile-posts-list">
                      {selectedPerson.posts.map((post) => (
                        <article className="profile-post-preview" key={post._id}>
                          {post.text && <p>{post.text}</p>}
                          {post.image && <img src={post.image} alt="" />}
                          {post.video && <video src={post.video} controls preload="metadata" />}
                          {post.poll?.options?.length > 0 && (
                            <div className="profile-poll-preview">
                              {post.poll.options.map((option) => (
                                <span key={option._id}>{option.text}</span>
                              ))}
                            </div>
                          )}
                        </article>
                      ))}
                    </div>
                  ) : (
                    <p className="profile-posts-empty">No posts yet.</p>
                  )}
                </div>
                <button
                  type="button"
                  className={`profile-dialog-follow ${selectedPerson.isFollowing ? "following" : ""}`}
                  onClick={handleProfileFollow}
                >
                  {selectedPerson.isFollowing ? "Following" : "Follow"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export default People;
