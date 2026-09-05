import { useEffect, useRef, useState } from "react";
import EmojiEmotionsOutlined from "@mui/icons-material/EmojiEmotionsOutlined";
import EmojiPicker from "emoji-picker-react";
import PhotoCameraOutlined from "@mui/icons-material/PhotoCameraOutlined";
import PollOutlined from "@mui/icons-material/PollOutlined";
import SendRounded from "@mui/icons-material/SendRounded";

function CreatePost({ username, onCreatePost }) {
  const [text, setText] = useState("");
  const [media, setMedia] = useState(null);
  const [mediaError, setMediaError] = useState("");
  const [showPoll, setShowPoll] = useState(false);
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [submitting, setSubmitting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const emojiPickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addEmoji = (emoji) => {
    const textarea = textareaRef.current;
    const start = textarea?.selectionStart ?? text.length;
    const end = textarea?.selectionEnd ?? text.length;
    const nextText = `${text.slice(0, start)}${emoji}${text.slice(end)}`;

    setText(nextText);
    setShowEmojiPicker(false);

    requestAnimationFrame(() => {
      textarea?.focus();
      const cursorPosition = start + emoji.length;
      textarea?.setSelectionRange(cursorPosition, cursorPosition);
    });
  };

  const handleMedia = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMediaError("");
    if (file.size > 25 * 1024 * 1024) {
      setMediaError("Files must be smaller than 25 MB.");
      e.target.value = "";
      return;
    }

    const preview = URL.createObjectURL(file);
    const nextMedia = { file, preview, isVideo: file.type.startsWith("video/") };

    if (nextMedia.isVideo) {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        if (video.duration > 60) {
          URL.revokeObjectURL(preview);
          setMediaError("Videos must be 60 seconds or shorter.");
          if (fileInputRef.current) fileInputRef.current.value = "";
          return;
        }
        setMedia(nextMedia);
      };
      video.src = preview;
      return;
    }

    setMedia(nextMedia);
  };

  const removeMedia = () => {
    if (media?.preview) URL.revokeObjectURL(media.preview);
    setMedia(null);
    setMediaError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const togglePoll = () => setShowPoll((prev) => !prev);

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

    if (!trimmedText && !media && !poll) return;

    setSubmitting(true);

    try {
      await onCreatePost(trimmedText, media?.file || null, poll);
      setText("");
      removeMedia();
      resetPoll();
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit =
    (text.trim() || media || (showPoll && pollOptions.filter((o) => o.trim()).length >= 2)) &&
    !submitting;

  return (
    <form className="create-post" onSubmit={handleSubmit}>
      <div className="create-post-row">
        <div className="avatar avatar-medium">
          {(username || "U").charAt(0).toUpperCase()}
        </div>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`What's on your mind, ${username || ""}?`}
          rows={1}
        />
      </div>

      {media && (
        <div className="image-preview">
          {media.isVideo ? (
            <video src={media.preview} controls muted />
          ) : (
            <img src={media.preview} alt="Preview" />
          )}
          <button type="button" onClick={removeMedia}>
            ×
          </button>
        </div>
      )}

      {mediaError && <p className="media-error">{mediaError}</p>}

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

      <div className="create-post-bottom">
        <div className="post-tools">
          <button
            type="button"
            className="tool-label"
            onClick={() => fileInputRef.current?.click()}
          >
            <PhotoCameraOutlined aria-hidden="true" />
            Photo / Video
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/mp4,video/webm,video/quicktime"
            onChange={handleMedia}
            hidden
          />

          <div className="emoji-picker-wrap" ref={emojiPickerRef}>
            <button
              type="button"
              className={`tool-label ${showEmojiPicker ? "active" : ""}`}
              onClick={() => setShowEmojiPicker((open) => !open)}
              aria-label="Add emoji"
              aria-expanded={showEmojiPicker}
            >
            <EmojiEmotionsOutlined aria-hidden="true" />
            Emoji
            </button>

            {showEmojiPicker && (
              <div className="emoji-picker" role="dialog" aria-label="Emoji picker">
                <EmojiPicker
                  onEmojiClick={(emojiData) => addEmoji(emojiData.emoji)}
                  searchPlaceholder="Search emojis"
                  previewConfig={{ showPreview: false }}
                  lazyLoadEmojis
                />
              </div>
            )}
          </div>

          <button
            type="button"
            className={`tool-label ${showPoll ? "active" : ""}`}
            onClick={togglePoll}
          >
            <PollOutlined aria-hidden="true" />
            Poll
          </button>
        </div>

        <button type="submit" className="post-button" disabled={!canSubmit}>
          <SendRounded aria-hidden="true" />
          {submitting ? "Posting..." : "Post"}
        </button>
      </div>
    </form>
  );
}

export default CreatePost;