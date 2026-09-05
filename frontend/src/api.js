import axios from "axios";

/**
 * ASSUMED BACKEND CONTRACT — edit here if your routes/response shapes differ.
 * Everything else in the app calls through these functions, so this is the
 * only file you should need to touch to match your real backend.
 *
 *   POST   /auth/signup   { username, email, password } -> { token, user: { _id, username, email } }
 *   POST   /auth/login    { email, password }            -> { token, user: { _id, username, email } }
 *   GET    /posts                                        -> { posts: [ post ] }
 *   POST   /posts         FormData(text?, image?)        -> { post }
 *   POST   /posts/:id/like                                -> { post }
 *   POST   /posts/:id/comments { text }                   -> { post }
 *
 * post shape:
 *   { _id, username, text, image, likes: [username, ...], comments: [{ username, text, createdAt }], createdAt }
 *
 * Auth: JWT returned from signup/login is sent back as `Authorization: Bearer <token>`.
 */

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const signup = (username, email, password) =>
  api.post("/auth/signup", { username, email, password }).then((r) => r.data);

export const login = (email, password) =>
  api.post("/auth/login", { email, password }).then((r) => r.data);

export const getPosts = () => api.get("/posts").then((r) => r.data);

export const createPost = (text, imageFile) => {
  const formData = new FormData();

  if (text) formData.append("text", text);
  if (imageFile) formData.append("image", imageFile);

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

export default api;