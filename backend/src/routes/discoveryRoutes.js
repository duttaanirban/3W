const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  getTrendingTopics,
  getCommunities,
  getNotifications,
  markNotificationRead,
} = require("../controllers/discoveryController");

const router = express.Router();

router.use(protect);
router.get("/topics/trending", getTrendingTopics);
router.get("/communities", getCommunities);
router.get("/notifications", getNotifications);
router.patch("/notifications/:id/read", markNotificationRead);

module.exports = router;
