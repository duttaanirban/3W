const express = require("express");


const {
  createPost,
  getPosts,
  toggleLike,
  addComment,
  votePoll,
} = require("../controllers/postController");

const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// Public feed
router.get("/", getPosts);

// Create post
router.post("/", protect, upload.single("image"), createPost);

// Like / unlike post
router.post("/:id/like", protect, toggleLike);

// Add comment
router.post("/:id/comments", protect, addComment);

// Vote in a poll
router.post("/:id/poll/:optionId/vote", protect, votePoll);

module.exports = router;