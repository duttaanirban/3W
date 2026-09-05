const express = require("express");

const {
  createPost,
  getPosts,
  toggleLike,
  addComment,
} = require("../controllers/postController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Public feed
router.get("/", getPosts);

// Create post
router.post("/", protect, createPost);

// Like / unlike post
router.post("/:id/like", protect, toggleLike);

// Add comment
router.post("/:id/comments", protect, addComment);

module.exports = router;