import { useState } from "react";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Social from "./pages/Social";
import "./App.css";

function App() {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) return null;

    try {
      return JSON.parse(storedUser);
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return null;
    }
  });
  const [view, setView] = useState("login"); // "login" | "signup"

  const handleAuthSuccess = ({ token, user: loggedInUser }) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(loggedInUser));
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setView("login");
  };

  if (!user) {
    return view === "login" ? (
      <Login
        onLoginSuccess={handleAuthSuccess}
        onSwitchToSignup={() => setView("signup")}
      />
    ) : (
      <Signup
        onSignupSuccess={handleAuthSuccess}
        onSwitchToLogin={() => setView("login")}
      />
    );
  }

  return <Social user={user} onLogout={handleLogout} />;
}

export default App;