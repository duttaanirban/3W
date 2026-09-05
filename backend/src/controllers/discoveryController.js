const Post = require("../models/Post");

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
  res.json([]);
};

module.exports = { getTrendingTopics, getCommunities, getNotifications };
