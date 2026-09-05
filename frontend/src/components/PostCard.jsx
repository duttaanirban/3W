import { useState } from "react";
import CommentSection from "./CommentSection";

function PostCard({ post, currentUsername, onToggleLike, onAddComment }) {
  const [showComments, setShowComments] = useState(false);
  const [liking, setLiking] = useState(false);
  const [renderedAt] = useState(() => Date.now());

  const likes = post.likes || [];
  const comments = post.comments || [];
  const hasLiked = currentUsername
    ? likes.some((like) => like.username === currentUsername)
    : false;

  const formatDate = (date) => {
    if (!date) return "";

    const diff = renderedAt - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return "now";
    if (minutes < 60) return `${minutes}m`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;

    return `${Math.floor(hours / 24)}d`;
  };

  const handleLike = async () => {
    if (liking) return;
    setLiking(true);

    try {
      await onToggleLike(post._id);
    } finally {
      setLiking(false);
    }
  };

  return (
    <article className="post-card">
      <div className="post-header">
        <div className="avatar avatar-medium">
          {(post.username || "U").charAt(0).toUpperCase()}
        </div>

        <div className="post-user">
          <strong>{post.username || "User"}</strong>
          <span>{formatDate(post.createdAt)}</span>
        </div>
      </div>

      {post.text && <p className="post-text">{post.text}</p>}

      {post.image && (
        <div className="post-image">
          <img src={post.image} alt="Post" />
        </div>
      )}

      <div className="post-engagement-row">
        <button
          className={`engagement-btn ${hasLiked ? "liked" : ""}`}
          onClick={handleLike}
          disabled={liking}
        >
          <span>{hasLiked ? "♥" : "♡"}</span>
          {likes.length} {likes.length === 1 ? "like" : "likes"}
        </button>

        <button
          className="engagement-btn"
          onClick={() => setShowComments(!showComments)}
        >
          <span>💬</span>
          {comments.length}{" "}
          {comments.length === 1 ? "comment" : "comments"}
        </button>
      </div>

      {showComments && (
        <CommentSection
          comments={comments}
          onAddComment={(text) => onAddComment(post._id, text)}
        />
      )}
    </article>
  );
}

export default PostCard;