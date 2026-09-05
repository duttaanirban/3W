import { useRef, useState } from "react";

function CreatePost({ onCreatePost }) {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmed = text.trim();
    if (!trimmed && !image) return; // spec: at least one of text/image required

    setSubmitting(true);

    try {
      await onCreatePost(trimmed, image?.file || null);
      setText("");
      removeImage();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="create-post" onSubmit={handleSubmit}>
      <div className="create-post-top">
        <div className="avatar avatar-medium">A</div>

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

      <div className="create-post-bottom">
        <button
          type="button"
          className="photo-button"
          onClick={() => fileInputRef.current?.click()}
        >
          <span>▧</span>
          Photo
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImage}
          hidden
        />

        <button
          type="submit"
          className="post-button"
          disabled={(!text.trim() && !image) || submitting}
        >
          {submitting ? "Posting..." : "Post"}
        </button>
      </div>
    </form>
  );
}

export default CreatePost;