const express = require("express");


const {
  createPost,
  getPosts,
  updatePost,
  deletePost,
  toggleLike,
  toggleSave,
  addComment,
  votePoll,
} = require("../controllers/postController");

const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// Public feed
router.get("/", protect, getPosts);

// Create post
router.post("/", protect, upload.single("image"), createPost);

// Edit / delete own post
router.put("/:id", protect, updatePost);
router.delete("/:id", protect, deletePost);

// Like / unlike post
router.post("/:id/like", protect, toggleLike);
router.post("/:id/save", protect, toggleSave);

// Add comment
router.post("/:id/comments", protect, addComment);

// Vote in a poll
router.post("/:id/poll/:optionId/vote", protect, votePoll);

module.exports = router;