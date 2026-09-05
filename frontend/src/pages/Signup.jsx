import { useState } from "react";
import { signup } from "../api";

function Signup({ onSignupSuccess, onSwitchToLogin }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !email.trim() || !password) {
      setError("Fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password should be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const data = await signup(username.trim(), email.trim(), password);
      onSignupSuccess(data);
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <div className="brand-mark">S</div>
        Social
      </div>

      <div className="auth-card">
        <div className="auth-heading">
          <span className="eyebrow">GET STARTED</span>
          <h1>Create your account</h1>
          <p>Join the community to post, like, and comment.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="yourname"
            autoComplete="username"
          />

          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            autoComplete="new-password"
          />

          {error && <p className="auth-error">{error}</p>}

          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <button type="button" onClick={onSwitchToLogin}>
            Log in
          </button>
        </p>
      </div>
    </div>
  );
}

export default Signup;