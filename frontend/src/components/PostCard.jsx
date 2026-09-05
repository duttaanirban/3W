import { useState } from "react";
import CommentSection from "./CommentSection";

function PostCard({
  post,
  currentUsername,
  onToggleLike,
  onAddComment,
  onVotePoll,
}) {
  const [showComments, setShowComments] = useState(false);
  const [liking, setLiking] = useState(false);
  const [voting, setVoting] = useState(false);
  const [renderedAt] = useState(() => Date.now());

  const likes = post.likes || [];
  const comments = post.comments || [];
  const pollOptions = post.poll?.options || [];
  const totalVotes = pollOptions.reduce(
    (total, option) => total + (option.votes?.length || 0),
    0
  );
  const selectedOption = pollOptions.find((option) =>
    option.votes?.some((vote) => vote.username === currentUsername)
  );
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

  const handleVote = async (optionId) => {
    if (voting || selectedOption) return;
    setVoting(true);

    try {
      await onVotePoll(post._id, optionId);
    } finally {
      setVoting(false);
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

      {pollOptions.length > 0 && (
        <div className="poll-display">
          {pollOptions.map((option) => {
            const votes = option.votes?.length || 0;
            const percentage = totalVotes
              ? Math.round((votes / totalVotes) * 100)
              : 0;

            return (
              <button
                type="button"
                className={`poll-choice ${
                  selectedOption?._id === option._id ? "selected" : ""
                }`}
                key={option._id}
                onClick={() => handleVote(option._id)}
                disabled={voting || Boolean(selectedOption)}
              >
                <span className="poll-choice-bar" style={{ width: `${percentage}%` }} />
                <span className="poll-choice-content">
                  <strong>{option.text}</strong>
                  <span>{percentage}%</span>
                </span>
              </button>
            );
          })}
          <span className="poll-total">
            {totalVotes} {totalVotes === 1 ? "vote" : "votes"}
          </span>
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