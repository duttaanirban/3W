import axios from "axios";

/**
 * ASSUMED BACKEND CONTRACT — edit here if your routes/response shapes differ.
 * Everything in the app calls through these functions, so this file is the
 * single place to update once you've built the matching backend routes.
 *
 * AUTH
 *   POST /auth/signup  { username, email, password } -> { token, user }
 *   POST /auth/login   { email, password }            -> { token, user }
 *
 * POSTS
 *   GET  /posts?filter=all|following&sort=latest|popular -> [ post ]
 *   GET  /posts?community=:communityId                   -> [ post ]  (feed filtered to one community)
 *   POST /posts        FormData(text?, image?, poll?)    -> post
 *   POST /posts/:id/like                                  -> updated post (toggles like for current user)
 *   POST /posts/:id/comment { text }                      -> updated post
 *   POST /posts/:id/save                                   -> updated post (toggles saved-by-me)
 *
 *   post shape:
 *     { _id, username, text, image, likes: [username,...],
 *       comments: [{ username, text, createdAt }], createdAt,
 *       savedByMe: boolean }   // present when the request is authenticated
 *
 * PROFILE
 *   GET /users/me      -> { _id, username, email, bio, followersCount, followingCount, postsCount }
 *   PUT /users/me { bio } -> updated profile
 *
 * SOCIAL GRAPH
 *   GET  /users/suggestions        -> [ { _id, username, isFollowing } ]
 *   POST /users/:id/follow         -> { isFollowing: boolean }
 *
 * DISCOVERY
 *   GET /topics/trending  -> [ { tag, postsCount } ]
 *   GET /communities      -> [ { _id, name } ]
 *
 * NOTIFICATIONS
 *   GET /notifications    -> [ { _id, text, read, createdAt } ]
 *
 * Auth: JWT from signup/login is sent back as `Authorization: Bearer <token>`.
 */

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// --- auth ---
export const signup = (username, email, password) =>
  api.post("/auth/signup", { username, email, password }).then((r) => r.data);

export const login = (email, password) =>
  api.post("/auth/login", { email, password }).then((r) => r.data);

// --- posts ---
export const getPosts = (params = {}) =>
  api.get("/posts", { params }).then((r) => r.data);

export const createPost = (text, imageFile, poll) => {
  const formData = new FormData();
  if (text) formData.append("text", text);
  if (imageFile) formData.append("image", imageFile);
  if (poll) formData.append("poll", JSON.stringify(poll));

  return api
    .post("/posts", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((r) => r.data.post);
};

export const toggleLike = (postId) =>
  api.post(`/posts/${postId}/like`).then((r) => r.data.post);

export const addComment = (postId, text) =>
  api.post(`/posts/${postId}/comments`, { text }).then((r) => r.data.post);

export const toggleSave = (postId) =>
  api.post(`/posts/${postId}/save`).then((r) => ({
    ...r.data.post,
    savedByMe: r.data.savedByMe,
  }));

export const votePoll = (postId, optionId) =>
  api.post(`/posts/${postId}/poll/${optionId}/vote`).then((r) => r.data.post);

export const updatePost = (postId, text) =>
  api.put(`/posts/${postId}`, { text }).then((r) => r.data.post);

export const deletePost = (postId) =>
  api.delete(`/posts/${postId}`).then((r) => r.data);

// --- profile ---
export const getMyProfile = () => api.get("/users/me").then((r) => r.data);

export const updateMyProfile = (updates) =>
  api.put("/users/me", updates).then((r) => r.data);

// --- social graph ---
export const getSuggestions = () =>
  api.get("/users/suggestions").then((r) => r.data);

export const getUserProfile = (userId) =>
  api.get(`/users/${userId}`).then((r) => r.data);

export const toggleFollow = (userId) =>
  api.post(`/users/${userId}/follow`).then((r) => r.data);

// --- discovery ---
export const getTrendingTopics = () =>
  api.get("/topics/trending").then((r) => r.data);

export const getCommunities = () =>
  api.get("/communities").then((r) => r.data);

// --- notifications ---
export const getNotifications = () =>
  api.get("/notifications").then((r) => r.data);

export default api;