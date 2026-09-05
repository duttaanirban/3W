const express = require("express");

const {
  createPost,
  getPosts,
} = require("../controllers/postController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Public feed
router.get("/", getPosts);

// Authenticated user can create a post
router.post("/", protect, createPost);

module.exports = router;