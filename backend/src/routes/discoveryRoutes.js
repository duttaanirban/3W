const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  getTrendingTopics,
  getCommunities,
  getNotifications,
} = require("../controllers/discoveryController");

const router = express.Router();

router.use(protect);
router.get("/topics/trending", getTrendingTopics);
router.get("/communities", getCommunities);
router.get("/notifications", getNotifications);

module.exports = router;
