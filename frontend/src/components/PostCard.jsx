import { useState } from "react";
import Bookmark from "@mui/icons-material/Bookmark";
import BookmarkBorder from "@mui/icons-material/BookmarkBorder";
import CommentOutlined from "@mui/icons-material/CommentOutlined";
import DeleteForeverOutlined from "@mui/icons-material/DeleteForeverOutlined";
import EditOutlined from "@mui/icons-material/EditOutlined";
import Favorite from "@mui/icons-material/Favorite";
import FavoriteBorder from "@mui/icons-material/FavoriteBorder";
import MoreVert from "@mui/icons-material/MoreVert";
import SendRounded from "@mui/icons-material/SendRounded";
import CommentSection from "./CommentSection";

function PostCard({
  post,
  currentUsername,
  currentUserId,
  onToggleLike,
  onAddComment,
  onToggleSave,
  onVotePoll,
  onUpdatePost,
  onDeletePost,
  hidePostMenu = false,
}) {
  const [showComments, setShowComments] = useState(false);
  const [liking, setLiking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [voting, setVoting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draftText, setDraftText] = useState(post.text || "");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [actionError, setActionError] = useState("");
  const [renderedAt] = useState(() => Date.now());

  const likes = post.likes || [];
  const comments = post.comments || [];
  const hasLiked = currentUsername
    ? likes.some((like) =>
        typeof like === "string" ? like === currentUsername : like.username === currentUsername
      )
    : false;
  const postUserId = post.userId?._id || post.userId;
  const isOwner = currentUserId && String(postUserId) === String(currentUserId);

  const formatDate = (date) => {
    if (!date) return "";

    const diff = renderedAt - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return "now";
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    return `${Math.floor(hours / 24)}d ago`;
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

  const handleSave = async () => {
    if (saving) return;
    setActionError("");
    setSaving(true);
    try {
      await onToggleSave(post._id);
    } catch (error) {
      setActionError(
        error.response?.data?.message || "Could not save this post."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleVote = async (optionId) => {
    if (voting) return;
    setVoting(true);
    try {
      await onVotePoll(post._id, optionId);
    } finally {
      setVoting(false);
    }
  };

  const handleEdit = () => {
    setActionError("");
    setDraftText(post.text || "");
    setEditing(true);
    setMenuOpen(false);
  };

  const handleSaveEdit = async () => {
    if (!draftText.trim()) return;
    setActionError("");
    try {
      await onUpdatePost(post._id, draftText.trim());
      setEditing(false);
    } catch (error) {
      setActionError(
        error.response?.data?.message || "Could not update this post."
      );
    }
  };

  const handleDelete = async () => {
    setMenuOpen(false);
    setConfirmDelete(true);
  };

  const confirmPostDelete = async () => {
    setActionError("");
    try {
      await onDeletePost(post._id);
      setConfirmDelete(false);
    } catch (error) {
      setConfirmDelete(false);
      setActionError(
        error.response?.data?.message || "Could not delete this post."
      );
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

        {isOwner && !hidePostMenu && (
          <div className="post-menu-wrap">
            <button
              type="button"
              className="post-menu"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="Post options"
              aria-expanded={menuOpen}
            >
              <MoreVert aria-hidden="true" />
            </button>
            {menuOpen && (
              <div className="post-menu-dropdown">
                <button type="button" onClick={handleEdit}>
                  <EditOutlined aria-hidden="true" />
                  Edit
                </button>
                <button type="button" onClick={handleDelete}>
                  <DeleteForeverOutlined aria-hidden="true" />
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {editing ? (
        <div className="post-edit-form">
          <textarea
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            rows={3}
            autoFocus
          />
          <div className="post-edit-actions">
            <button type="button" className="post-edit-cancel" onClick={() => setEditing(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="post-edit-save"
              onClick={handleSaveEdit}
              disabled={!draftText.trim()}
            >
              Save changes
            </button>
          </div>
        </div>
      ) : (
        post.text && <p className="post-text">{post.text}</p>
      )}

      {actionError && <p className="post-action-error">{actionError}</p>}

      {post.image && (
        <div className="post-image">
          <img src={post.image} alt="Post" />
        </div>
      )}

      {post.video && (
        <div className="post-image">
          <video src={post.video} controls preload="metadata" />
        </div>
      )}

      {post.poll?.options?.length > 0 && (
        <div className="poll-display">
          {post.poll.options.map((option) => (
            <button
              type="button"
              className="poll-choice"
              key={option._id}
              onClick={() => handleVote(option._id)}
              disabled={voting}
            >
              <strong>{option.text}</strong>
              <span>{option.votes?.length || 0} votes</span>
            </button>
          ))}
        </div>
      )}

      <div className="post-engagement-row">
        <button
          className={`engagement-btn ${hasLiked ? "liked" : ""}`}
          onClick={handleLike}
          disabled={liking}
        >
          {hasLiked ? <Favorite aria-hidden="true" /> : <FavoriteBorder aria-hidden="true" />}
          {likes.length}
        </button>

        <button
          className="engagement-btn"
          onClick={() => setShowComments(!showComments)}
        >
          <CommentOutlined aria-hidden="true" />
          {comments.length}
        </button>

        <button
          className="engagement-btn"
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: post.username, text: post.text || "" });
            }
          }}
        >
          <SendRounded aria-hidden="true" />
          Share
        </button>

        <button
          className={`engagement-btn bookmark ${post.savedByMe ? "saved" : ""}`}
          onClick={handleSave}
          disabled={saving}
          title={post.savedByMe ? "Remove from saved" : "Save post"}
          aria-label={post.savedByMe ? "Remove from saved" : "Save post"}
        >
          {post.savedByMe ? <Bookmark aria-hidden="true" /> : <BookmarkBorder aria-hidden="true" />}
          <span>{post.savedByMe ? "Saved" : "Save"}</span>
        </button>
      </div>

      {showComments && (
        <CommentSection
          comments={comments}
          onAddComment={(text) => onAddComment(post._id, text)}
        />
      )}

      {confirmDelete && (
        <div className="dialog-backdrop" role="presentation">
          <div className="delete-dialog" role="alertdialog" aria-modal="true">
            <div className="delete-dialog-icon">
              <DeleteForeverOutlined aria-hidden="true" />
            </div>
            <h3>Delete this post?</h3>
            <p>This post and its interactions will be permanently removed.</p>
            <div className="delete-dialog-actions">
              <button type="button" onClick={() => setConfirmDelete(false)}>
                Keep post
              </button>
              <button type="button" onClick={confirmPostDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

export default PostCard;