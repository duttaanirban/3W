const Post = require("../models/Post");

const createPost = async (req, res) => {
  try {
    const { text, image } = req.body;

    if (!text?.trim() && !image) {
      return res.status(400).json({
        message: "Post must contain text, an image, or both",
      });
    }

    const post = await Post.create({
      userId: req.user.userId,
      username: req.user.username,
      text: text?.trim() || "",
      image: image || "",
    });

    res.status(201).json({
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    console.error("Create post error:", error);

    res.status(500).json({
      message: "Server error while creating post",
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

module.exports = {
  createPost,
  getPosts,
};