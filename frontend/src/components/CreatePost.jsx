import { useRef, useState } from "react";

function CreatePost({ onCreatePost }) {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [showPoll, setShowPoll] = useState(false);
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImage({ file, preview: URL.createObjectURL(file) });
  };

  const removeImage = () => {
    setImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const togglePoll = () => {
    setShowPoll((prev) => !prev);
  };

  const updatePollOption = (index, value) => {
    setPollOptions((prev) => prev.map((opt, i) => (i === index ? value : opt)));
  };

  const addPollOption = () => {
    if (pollOptions.length >= 4) return;
    setPollOptions((prev) => [...prev, ""]);
  };

  const removePollOption = (index) => {
    if (pollOptions.length <= 2) return;
    setPollOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const resetPoll = () => {
    setShowPoll(false);
    setPollOptions(["", ""]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedText = text.trim();
    const cleanOptions = pollOptions.map((o) => o.trim()).filter(Boolean);
    const poll = showPoll && cleanOptions.length >= 2 ? { options: cleanOptions } : null;

    if (!trimmedText && !image && !poll) return; // need at least one of text/image/poll

    setSubmitting(true);

    try {
      await onCreatePost(trimmedText, image?.file || null, poll);
      setText("");
      removeImage();
      resetPoll();
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit =
    (text.trim() || image || (showPoll && pollOptions.filter((o) => o.trim()).length >= 2)) &&
    !submitting;

  return (
    <form className="create-post" onSubmit={handleSubmit}>
      <div className="create-post-heading">
        <h2>Create Post</h2>
        <span className="all-posts-pill">All Posts</span>
      </div>

      <div className="create-post-top">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's on your mind?"
          rows={2}
        />
      </div>

      {image && (
        <div className="image-preview">
          <img src={image.preview} alt="Preview" />
          <button type="button" onClick={removeImage}>
            ×
          </button>
        </div>
      )}

      {showPoll && (
        <div className="poll-builder">
          {pollOptions.map((option, i) => (
            <div className="poll-option-row" key={i}>
              <input
                value={option}
                onChange={(e) => updatePollOption(i, e.target.value)}
                placeholder={`Option ${i + 1}`}
              />

              {pollOptions.length > 2 && (
                <button
                  type="button"
                  className="poll-remove"
                  onClick={() => removePollOption(i)}
                >
                  ×
                </button>
              )}
            </div>
          ))}

          <div className="poll-builder-footer">
            {pollOptions.length < 4 && (
              <button type="button" className="poll-add" onClick={addPollOption}>
                + Add option
              </button>
            )}

            <button type="button" className="poll-cancel" onClick={resetPoll}>
              Remove poll
            </button>
          </div>
        </div>
      )}

      <div className="create-post-divider" />

      <div className="create-post-bottom">
        <div className="post-tools">
          <button
            type="button"
            className="tool-icon"
            onClick={() => fileInputRef.current?.click()}
            title="Add photo"
          >
            📷
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImage}
            hidden
          />

          <button type="button" className="tool-icon" title="Add feeling">
            ☺
          </button>

          <button
            type="button"
            className={`tool-icon ${showPoll ? "active" : ""}`}
            onClick={togglePoll}
            title="Create a poll"
          >
            ☰
          </button>
        </div>

        <button type="submit" className="post-button" disabled={!canSubmit}>
          <span>➤</span>
          {submitting ? "Posting..." : "Post"}
        </button>
      </div>
    </form>
  );
}

export default CreatePost;