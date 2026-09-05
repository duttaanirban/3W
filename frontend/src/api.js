import axios from "axios";

/**
 * ASSUMED BACKEND CONTRACT — edit here if your routes/response shapes differ.
 *
 *   POST   /auth/signup   { username, email, password } -> { token, user: { _id, username, email } }
 *   POST   /auth/login    { email, password }            -> { token, user: { _id, username, email } }
 *   GET    /posts                                        -> [ post ]
 *   POST   /posts         FormData(text?, image?, poll?) -> post
 *   POST   /posts/:id/like                                -> updated post   (toggles like for the current user)
 *   POST   /posts/:id/comment { text }                    -> updated post
 *
 * post shape:
 *   { _id, username, text, image, likes: [username, ...], comments: [{ username, text, createdAt }], createdAt }
 *
 * `poll` is sent as a JSON string field: { options: [string, ...] }.
 * Your backend doesn't have to support it — if it ignores unknown fields,
 * everything else still works. It's not part of the original assignment spec.
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

export default api;