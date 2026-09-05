import { useEffect, useState } from "react";
import TopBar from "../components/TopBar";
import Sidebar from "../components/Sidebar";
import RightPanel from "../components/RightPanel";
import FeedTabs from "../components/FeedTabs";
import CreatePost from "../components/CreatePost";
import PostCard from "../components/PostCard";
import People from "./People";
import Settings from "./Settings";
import {
  getPosts,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
  addComment,
  toggleSave,
  votePoll,
  getMyProfile,
  updateMyProfile,
  getSuggestions,
  toggleFollow,
  getTrendingTopics,
  getCommunities,
  getNotifications,
  markNotificationRead,
} from "../api";

function Social({ user, onLogout }) {
  const [activeView, setActiveView] = useState("home");
  const [activeTab, setActiveTab] = useState("all");
  const [activeCommunity, setActiveCommunity] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [createPostFocusRequest, setCreatePostFocusRequest] = useState(0);

  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [postsError, setPostsError] = useState("");

  const [profile, setProfile] = useState(null);
  const [trending, setTrending] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");

  // Sidebar/right-panel data — independent of the feed, loaded once.
  useEffect(() => {
    getMyProfile().then(setProfile).catch(() => {});
    getSuggestions().then(setSuggestions).catch(() => {});
    getTrendingTopics().then(setTrending).catch(() => {});
    getCommunities().then(setCommunities).catch(() => {});

    const loadNotifications = () => {
      getNotifications().then(setNotifications).catch(() => {});
    };

    loadNotifications();
    const notificationRefresh = setInterval(loadNotifications, 15000);
    return () => clearInterval(notificationRefresh);
  }, []);

  // Feed — reloads whenever the tab or community filter changes.
  useEffect(() => {
    if (activeView !== "home" && activeView !== "saved") return;
    const loadPosts = async () => {
      setLoadingPosts(true);
      setPostsError("");

      try {
        const params = {};
        if (activeTab === "following") params.filter = "following";
        if (activeTab === "popular") params.sort = "popular";
        if (activeTab === "latest") params.sort = "latest";
        if (activeView === "saved") params.filter = "saved";
        if (activeCommunity) params.community = activeCommunity;

        const data = await getPosts(params);
        setPosts(data.posts || []);
      } catch (err) {
        setPostsError(
          err.response?.data?.message || "Couldn't load the feed. Try again."
        );
      } finally {
        setLoadingPosts(false);
      }
    };

    loadPosts();
  }, [activeTab, activeCommunity, activeView]);

  const handleCreatePost = async (text, imageFile, poll) => {
    const newPost = await createPost(text, imageFile, poll);
    setPosts((prev) => [newPost, ...prev]);
    setProfile((prev) =>
      prev ? { ...prev, postsCount: (prev.postsCount || 0) + 1 } : prev
    );
  };

  const handleToggleLike = async (postId) => {
    const updated = await toggleLike(postId);
    setPosts((prev) => prev.map((p) => (p._id === postId ? updated : p)));
  };

  const handleAddComment = async (postId, text) => {
    const updated = await addComment(postId, text);
    setPosts((prev) => prev.map((p) => (p._id === postId ? updated : p)));
  };

  const handleToggleSave = async (postId) => {
    const updated = await toggleSave(postId);
    setPosts((prev) => {
      if (activeView === "saved" && !updated.savedByMe) {
        return prev.filter((p) => p._id !== postId);
      }
      return prev.map((p) => (p._id === postId ? updated : p));
    });
  };

  const handleVotePoll = async (postId, optionId) => {
    const updated = await votePoll(postId, optionId);
    setPosts((prev) => prev.map((p) => (p._id === postId ? updated : p)));
  };

  const handleUpdatePost = async (postId, text) => {
    const updated = await updatePost(postId, text);
    setPosts((prev) => prev.map((p) => (p._id === postId ? updated : p)));
  };

  const handleDeletePost = async (postId) => {
    await deletePost(postId);
    setPosts((prev) => prev.filter((p) => p._id !== postId));
    setProfile((prev) =>
      prev ? { ...prev, postsCount: Math.max(0, (prev.postsCount || 0) - 1) } : prev
    );
  };

  const handleFollow = async (userId) => {
    const { isFollowing } = await toggleFollow(userId);
    setSuggestions((prev) =>
      prev.map((s) => (s._id === userId ? { ...s, isFollowing } : s))
    );
  };

  const handleSaveBio = async (bio) => {
    const updated = await updateMyProfile({ bio });
    setProfile(updated);
  };

  const handleThemeChange = (nextTheme) => {
    localStorage.setItem("theme", nextTheme);
    setTheme(nextTheme);
  };

  const handleMarkNotificationRead = async (notificationId) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification._id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );

    try {
      await markNotificationRead(notificationId);
    } catch {
      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === notificationId
            ? { ...notification, read: false }
            : notification
        )
      );
    }
  };

  const visiblePosts = searchQuery.trim()
    ? posts.filter((p) =>
        (p.text || "").toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
        (p.username || "").toLowerCase().includes(searchQuery.trim().toLowerCase())
      )
    : posts;

  const renderPostFeed = () => (
    <>
      {loadingPosts && <p className="feed-status">Loading posts...</p>}
      {postsError && <p className="feed-status error">{postsError}</p>}

      {!loadingPosts && !postsError && visiblePosts.length === 0 && (
        <p className="feed-status">
          {searchQuery.trim()
            ? "No posts match your search."
            : activeView === "saved"
              ? "Posts you save will appear here."
              : "No posts yet. Be the first to share something."}
        </p>
      )}

      <div className="feed">
        {visiblePosts.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            currentUsername={user?.username}
            currentUserId={user?.id || user?._id}
            onToggleLike={handleToggleLike}
            onAddComment={handleAddComment}
            onToggleSave={handleToggleSave}
            onVotePoll={handleVotePoll}
            onUpdatePost={handleUpdatePost}
            onDeletePost={handleDeletePost}
            hidePostMenu={activeView === "saved"}
          />
        ))}
      </div>
    </>
  );

  return (
    <div className={`social-app ${theme === "light" ? "light-theme" : ""}`}>
      <TopBar
        user={user}
        onLogout={onLogout}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="social-layout">
        <Sidebar
          activeView={activeView}
          onChangeView={setActiveView}
          onRequestCreatePost={() => setCreatePostFocusRequest((count) => count + 1)}
          communities={communities}
          activeCommunity={activeCommunity}
          onSelectCommunity={(id) => {
            setActiveCommunity((prev) => (prev === id ? null : id));
            setActiveView("home");
          }}
        />

        <main className="social-main">
          {activeView === "people" ? (
            <People suggestions={suggestions} onFollow={handleFollow} />
          ) : activeView === "settings" ? (
            <Settings
              profile={profile}
              theme={theme}
              onThemeChange={handleThemeChange}
              onSaveBio={handleSaveBio}
              onLogout={onLogout}
            />
          ) : activeView === "saved" ? (
            <section className="saved-page">
              <div className="saved-page-heading">
                <h1>Saved posts</h1>
                <p>Your private collection of posts worth keeping.</p>
              </div>
              {renderPostFeed()}
            </section>
          ) : activeView !== "home" ? (
            <div className="coming-soon">
              <h2>{activeView.charAt(0).toUpperCase() + activeView.slice(1)}</h2>
              <p>This page isn't built yet — only the Home feed is wired up so far.</p>
            </div>
          ) : (
            <>
              <CreatePost
                username={user?.username}
                onCreatePost={handleCreatePost}
                focusRequest={createPostFocusRequest}
              />

              <FeedTabs active={activeTab} onChange={setActiveTab} />

              {renderPostFeed()}
            </>
          )}
        </main>

        <RightPanel
          profile={profile}
          trending={trending}
          suggestions={suggestions}
          onFollow={handleFollow}
          onSaveBio={handleSaveBio}
        />
      </div>
    </div>
  );
}

export default Social;