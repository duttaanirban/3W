const Post = require("../models/Post");
const Notification = require("../models/Notification");
const cloudinary = require("../config/cloudinary");

const createPost = async (req, res) => {
  try {
    const { text } = req.body;
    let poll = null;

    if (req.body.poll) {
      try {
        poll = JSON.parse(req.body.poll);
      } catch {
        return res.status(400).json({ message: "Invalid poll data" });
      }

      const options = Array.isArray(poll.options)
        ? poll.options.map((option) => String(option).trim()).filter(Boolean)
        : [];
      const uniqueOptions = [...new Set(options)];

      if (uniqueOptions.length < 2 || uniqueOptions.length > 4) {
        return res.status(400).json({
          message: "A poll must contain 2 to 4 unique options",
        });
      }

      poll = {
        options: uniqueOptions.map((option) => ({ text: option, votes: [] })),
      };
    }

    if (!text?.trim() && !req.file && !poll) {
      return res.status(400).json({
        message: "Post must contain text, an image, a poll, or a combination",
      });
    }

    let imageUrl = "";
    let videoUrl = "";

    if (req.file) {
      const isVideo =
        req.file.mimetype.startsWith("video/") ||
        /\.(mp4|webm|mov)$/i.test(req.file.originalname);
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "3w-social-app/posts",
            resource_type: isVideo ? "video" : "image",
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

      if (isVideo) {
        if (uploadResult.duration > 60) {
          await cloudinary.uploader.destroy(uploadResult.public_id, {
            resource_type: "video",
          });
          return res.status(400).json({
            message: "Videos must be 60 seconds or shorter",
          });
        }
        videoUrl = uploadResult.secure_url;
      } else {
        imageUrl = uploadResult.secure_url;
      }
    }

    const post = await Post.create({
      userId: req.user.userId,
      username: req.user.username,
      text: text?.trim() || "",
      image: imageUrl,
      video: videoUrl,
      poll,
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

const votePoll = async (req, res) => {
  try {
    const { id, optionId } = req.params;
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (!post.poll?.options?.length) {
      return res.status(400).json({ message: "This post does not have a poll" });
    }

    const selectedOption = post.poll.options.id(optionId);

    if (!selectedOption) {
      return res.status(404).json({ message: "Poll option not found" });
    }

    post.poll.options.forEach((option) => {
      option.votes = option.votes.filter(
        (vote) => vote.userId.toString() !== req.user.userId.toString()
      );
    });

    selectedOption.votes.push({
      userId: req.user.userId,
      username: req.user.username,
    });

    await post.save();

    res.json({
      message: "Poll vote recorded",
      post,
    });
  } catch (error) {
    console.error("Poll vote error:", error);
    res.status(500).json({ message: "Server error while voting in poll" });
  }
};

const getPosts = async (req, res) => {
  try {
    const { filter, sort, community } = req.query;
    let query = {};

    if (community) {
      const escapedCommunity = String(community).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.text = new RegExp(`#${escapedCommunity}(\\s|$)`, "i");
    }

    if (filter === "following") {
      const User = require("../models/User");
      const user = await User.findById(req.user.userId).select("following");
      query.userId = { $in: user?.following || [] };
    }

    if (filter === "saved") {
      query.savedBy = req.user.userId;
    }

    const posts = await Post.find(query).lean();
    posts.sort((a, b) => {
      if (sort === "popular") return (b.likes?.length || 0) - (a.likes?.length || 0);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    posts.forEach((post) => {
      post.savedByMe = post.savedBy?.some(
        (userId) => String(userId) === String(req.user.userId)
      );
    });

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

const toggleSave = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: "Post not found" });

    const savedBy = post.savedBy || [];
    const index = savedBy.findIndex(
      (userId) => String(userId) === String(req.user.userId)
    );

    if (index === -1) savedBy.push(req.user.userId);
    else savedBy.splice(index, 1);
    post.savedBy = savedBy;

    await post.save();

    res.json({
      post: post.toObject(),
      savedByMe: index === -1,
    });
  } catch (error) {
    console.error("Save post error:", error);
    res.status(500).json({ message: "Server error while saving post" });
  }
};

const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.userId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ message: "You can only edit your own posts" });
    }

    const updatedText = typeof text === "string" ? text.trim() : post.text;

    if (
      !updatedText &&
      !post.image &&
      !post.video &&
      !post.poll?.options?.length
    ) {
      return res.status(400).json({ message: "Post cannot be empty" });
    }

    post.text = updatedText;
    await post.save();

    res.json({
      message: "Post updated successfully",
      post,
    });
  } catch (error) {
    console.error("Update post error:", error);
    res.status(500).json({ message: "Server error while updating post" });
  }
};

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.userId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ message: "You can only delete your own posts" });
    }

    await post.deleteOne();

    res.json({
      message: "Post deleted successfully",
      postId: id,
    });
  } catch (error) {
    console.error("Delete post error:", error);
    res.status(500).json({ message: "Server error while deleting post" });
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

    if (existingLikeIndex === -1 && String(post.userId) !== String(req.user.userId)) {
      await Notification.create({
        recipientId: post.userId,
        actorId: req.user.userId,
        actorUsername: req.user.username,
        postId: post._id,
        type: "like",
        text: `${req.user.username} liked your post.`,
      });
    }

    res.json({
      message:
        existingLikeIndex !== -1
          ? "Post unliked successfully"
          : "Post liked successfully",
      post,
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

    if (String(post.userId) !== String(req.user.userId)) {
      await Notification.create({
        recipientId: post.userId,
        actorId: req.user.userId,
        actorUsername: req.user.username,
        postId: post._id,
        type: "comment",
        text: `${req.user.username} commented on your post.`,
      });
    }

    res.status(201).json({
      message: "Comment added successfully",
      post,
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
  updatePost,
  deletePost,
  toggleLike,
  toggleSave,
  addComment,
  votePoll,
};