const Post = require("../models/Post");
const cloudinary = require("../config/cloudinary");

const createPost = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text?.trim() && !req.file) {
      return res.status(400).json({
        message: "Post must contain text, an image, or both",
      });
    }

    let imageUrl = "";

    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "3w-social-app/posts",
            resource_type: "image",
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );

        uploadStream.end(req.file.buffer);
      });

      imageUrl = uploadResult.secure_url;
    }

    const post = await Post.create({
      userId: req.user.userId,
      username: req.user.username,
      text: text?.trim() || "",
      image: imageUrl,
    });

    res.status(201).json({
      message: "Post created successfully",
      post,
    });
  } catch (error) {
  console.error("Create post error:", error);

  if (error.http_code) {
    console.error("HTTP Code:", error.http_code);
  }

  if (error.response) {
    console.error("Cloudinary response:", error.response);
  }

  if (error.headers) {
    console.error("Cloudinary headers:", error.headers);
  }

  res.status(500).json({
    message: "Server error while creating post",
    error: error.message,
  });
}
};

const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      posts,
    });
  } catch (error) {
    console.error("Get posts error:", error);

    res.status(500).json({
      message: "Server error while fetching posts",
    });
  }
};

const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const existingLikeIndex = post.likes.findIndex(
      (like) => like.userId.toString() === req.user.userId.toString()
    );

    if (existingLikeIndex !== -1) {
      // Unlike
      post.likes.splice(existingLikeIndex, 1);
    } else {
      // Like
      post.likes.push({
        userId: req.user.userId,
        username: req.user.username,
      });
    }

    await post.save();

    res.json({
      message:
        existingLikeIndex !== -1
          ? "Post unliked successfully"
          : "Post liked successfully",
      likes: post.likes,
      likesCount: post.likes.length,
    });
  } catch (error) {
    console.error("Like error:", error);

    res.status(500).json({
      message: "Server error while updating like",
    });
  }
};

const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({
        message: "Comment cannot be empty",
      });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    post.comments.push({
      userId: req.user.userId,
      username: req.user.username,
      text: text.trim(),
    });

    await post.save();

    res.status(201).json({
      message: "Comment added successfully",
      comments: post.comments,
      commentsCount: post.comments.length,
    });
  } catch (error) {
    console.error("Comment error:", error);

    res.status(500).json({
      message: "Server error while adding comment",
    });
  }
};

module.exports = {
  createPost,
  getPosts,
  toggleLike,
  addComment,
};