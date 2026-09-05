const Post = require("../models/Post");
const Notification = require("../models/Notification");

const getTrendingTopics = async (req, res) => {
  const posts = await Post.find({ text: /#/ }).select("text").lean();
  const counts = new Map();

  posts.forEach(({ text }) => {
    const tags = text.match(/#[a-z0-9_]+/gi) || [];
    new Set(tags.map((tag) => tag.slice(1).toLowerCase())).forEach((tag) => {
      counts.set(tag, (counts.get(tag) || 0) + 1);
    });
  });

  res.json(
    [...counts.entries()]
      .map(([tag, postsCount]) => ({ tag, postsCount }))
      .sort((a, b) => b.postsCount - a.postsCount)
      .slice(0, 10)
  );
};

const getCommunities = async (req, res) => {
  const posts = await Post.find({ text: /#/ }).select("text").lean();
  const names = new Set();

  posts.forEach(({ text }) => {
    (text.match(/#[a-z0-9_]+/gi) || []).forEach((tag) => names.add(tag.slice(1).toLowerCase()));
  });

  res.json([...names].slice(0, 12).map((name) => ({ _id: name, name })));
};

const getNotifications = async (req, res) => {
  const notifications = await Notification.find({ recipientId: req.user.userId })
    .sort({ createdAt: -1 })
    .limit(50)
    .select("text read createdAt")
    .lean();

  res.json(notifications);
};

const markNotificationRead = async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipientId: req.user.userId },
    { read: true },
    { new: true }
  )
    .select("text read createdAt")
    .lean();

  if (!notification) {
    return res.status(404).json({ message: "Notification not found" });
  }

  res.json(notification);
};

module.exports = {
  getTrendingTopics,
  getCommunities,
  getNotifications,
  markNotificationRead,
};
