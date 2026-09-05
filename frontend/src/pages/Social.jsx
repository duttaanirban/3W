import { useEffect, useState } from "react";
import TopBar from "../components/TopBar";
import CreatePost from "../components/CreatePost";
import PostCard from "../components/PostCard";
import { getPosts, createPost, toggleLike, addComment } from "../api";

function Social({ user, onLogout }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getPosts();
        const sorted = [...(data.posts || [])].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setPosts(sorted);
      } catch (err) {
        setError(
          err.response?.data?.message || "Couldn't load the feed. Try again."
        );
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  const handleCreatePost = async (text, imageFile) => {
    const newPost = await createPost(text, imageFile);
    setPosts((prev) => [newPost, ...prev]);
  };

  const handleToggleLike = async (postId) => {
    const updated = await toggleLike(postId);
    setPosts((prev) => prev.map((p) => (p._id === postId ? updated : p)));
  };

  const handleAddComment = async (postId, text) => {
    const updated = await addComment(postId, text);
    setPosts((prev) => prev.map((p) => (p._id === postId ? updated : p)));
  };

  return (
    <div className="social-app">
      <TopBar user={user} onLogout={onLogout} />

      <main className="social-main">
        <CreatePost onCreatePost={handleCreatePost} />

        {loading && <p className="feed-status">Loading posts...</p>}
        {error && <p className="feed-status error">{error}</p>}

        {!loading && !error && posts.length === 0 && (
          <p className="feed-status">No posts yet. Be the first to share something.</p>
        )}

        <div className="feed">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              currentUsername={user?.username}
              onToggleLike={handleToggleLike}
              onAddComment={handleAddComment}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

export default Social;