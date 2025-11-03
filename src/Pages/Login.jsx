import { useState } from "react";
import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";
import styles from "../styles/Login.module.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Step 1: sign in with Supabase Auth
      const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      if (loginError) throw loginError;

      // Step 2: check if admin
      const { data: adminRows } = await supabase.from("admin").select("*").eq("id", data.user.id);
      if (!adminRows || adminRows.length === 0) {
        await supabase.auth.signOut();
        throw new Error("Access denied. This portal is for administrators only.");
      }
      // Step 3: redirect
      navigate("/dashboard");
    } catch (err) {
      setError(typeof err.message === "string" ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <form className={styles.loginForm} onSubmit={handleLogin}>
        <h1>Admin Login</h1>
        <p className={styles.subtitle}>
          Access the Power Supply Management dashboard.
        </p>

        {error && <div className={styles.errorBox}>{error}</div>}

        <div className={styles.inputGroup}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            placeholder="admin@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
        <div className={styles.bottomText}>
          <p>Don't have an admin account? <a href="/signup">Sign up</a></p>
        </div>
      </form>
    </div>
  );
}