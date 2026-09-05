const User = require("../models/User");
const Post = require("../models/Post");

const getMyProfile = async (req, res) => {
  const user = await User.findById(req.user.userId).select("username email bio followers following");

  if (!user) return res.status(404).json({ message: "User not found" });

  const posts = await Post.find({ userId: user._id })
    .sort({ createdAt: -1 })
    .select("text image video poll createdAt")
    .lean();
  res.json({
    _id: user._id,
    username: user.username,
    email: user.email,
    bio: user.bio,
    followersCount: user.followers.length,
    followingCount: user.following.length,
    postsCount: posts.length,
    posts,
  });
};

const updateMyProfile = async (req, res) => {
  const bio = typeof req.body.bio === "string" ? req.body.bio.trim() : "";
  const user = await User.findByIdAndUpdate(
    req.user.userId,
    { bio },
    { new: true, runValidators: true }
  ).select("username email bio followers following");

  if (!user) return res.status(404).json({ message: "User not found" });

  const posts = await Post.find({ userId: user._id })
    .sort({ createdAt: -1 })
    .select("text image video poll createdAt")
    .lean();
  res.json({
    _id: user._id,
    username: user.username,
    email: user.email,
    bio: user.bio,
    followersCount: user.followers.length,
    followingCount: user.following.length,
    postsCount: posts.length,
    posts,
  });
};

const getSuggestions = async (req, res) => {
  const user = await User.findById(req.user.userId).select("following");
  const users = await User.find({ _id: { $ne: req.user.userId } })
    .select("username")
    .sort({ createdAt: -1 })
    .limit(10);
  const following = new Set((user?.following || []).map(String));

  res.json(users.map((candidate) => ({
    _id: candidate._id,
    username: candidate.username,
    isFollowing: following.has(String(candidate._id)),
  })));
};

const getUserProfile = async (req, res) => {
  const user = await User.findById(req.params.id).select(
    "username bio followers following"
  );

  if (!user) return res.status(404).json({ message: "User not found" });

  const posts = await Post.find({ userId: user._id })
    .sort({ createdAt: -1 })
    .select("text image video poll createdAt")
    .lean();
  res.json({
    _id: user._id,
    username: user.username,
    bio: user.bio,
    followersCount: user.followers.length,
    followingCount: user.following.length,
    postsCount: posts.length,
    posts,
    isFollowing: user.followers.some(
      (followerId) => String(followerId) === String(req.user.userId)
    ),
  });
};

const toggleFollow = async (req, res) => {
  const targetId = req.params.id;
  if (String(targetId) === String(req.user.userId)) {
    return res.status(400).json({ message: "You cannot follow yourself" });
  }

  const [currentUser, targetUser] = await Promise.all([
    User.findById(req.user.userId),
    User.findById(targetId),
  ]);

  if (!currentUser || !targetUser) {
    return res.status(404).json({ message: "User not found" });
  }

  const index = currentUser.following.findIndex((id) => String(id) === String(targetId));
  const isFollowing = index === -1;

  if (isFollowing) {
    currentUser.following.push(targetUser._id);
    targetUser.followers.push(currentUser._id);
  } else {
    currentUser.following.splice(index, 1);
    targetUser.followers = targetUser.followers.filter(
      (id) => String(id) !== String(currentUser._id)
    );
  }

  await Promise.all([currentUser.save(), targetUser.save()]);
  res.json({ isFollowing });
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  getSuggestions,
  getUserProfile,
  toggleFollow,
};
