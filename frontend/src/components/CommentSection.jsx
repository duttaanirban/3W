import { useState } from "react";

function CommentSection({ comments, onAddComment }) {
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmed = draft.trim();
    if (!trimmed) return;

    setSubmitting(true);

    try {
      await onAddComment(trimmed);
      setDraft("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="comment-section">
      {comments.length === 0 ? (
        <p className="comment-empty">No comments yet. Be the first to reply.</p>
      ) : (
        <div className="comments-list">
          {comments.map((comment, i) => (
            <div className="comment" key={comment._id || i}>
              <div className="avatar avatar-tiny">
                {(comment.username || "U").charAt(0).toUpperCase()}
              </div>

              <div className="comment-body">
                <strong>{comment.username || "User"}</strong>
                <p>{comment.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <form className="comment-form" onSubmit={handleSubmit}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Write a comment..."
        />

        <button type="submit" disabled={!draft.trim() || submitting}>
          →
        </button>
      </form>
    </div>
  );
}

export default CommentSection;