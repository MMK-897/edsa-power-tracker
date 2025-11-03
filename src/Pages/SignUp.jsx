import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/SignUp.module.css";
import { supabase } from "../supabase";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [adminExists, setAdminExists] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkAdminExists(params) {
      const { data } = await supabase.from("admin").select("id").limit(1);
      if (data && data.length > 0) setAdminExists(true);
    }
    checkAdminExists();
  }, []);

  //   const validateForm = () => {
  //     if (!fullName || !email || !password || !confirmPassword) {
  //       setError("All fields are required");
  //       return false;
  //     }
  //     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  //     if (!emailRegex.test(email)) {
  //       setError("Please enter a valid email address");
  //       return false;
  //     }
  //     if (password.length < 6) {
  //       setError("Password must be at least 6 characters long");
  //       return false;
  //     }
  //     if (password !== confirmPassword) {
  //       setError("Passwords do not match");
  //       return false;
  //     }
  //     return true;
  //   };
  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
  

      const {data,  error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpError) throw signUpError;
      const user = data?.user;
      if (!user) throw new Error("User not found");


      await supabase.from("admin").insert([
        {
          id: data.user.id,
          full_name: fullName,
          email: user.email,
        },
      ]);
      navigate("/dashboard");
    } catch (err) {
      // Show error message to user
      setError(typeof err === "string" ? err : err.message || "Could not Sign Up");
    } finally {
      setLoading(false); // Hide loading spinner
    }
  };

  if (adminExists) {
    return (
      <div className={styles.container}>
         <h2>Admin Already Exists</h2>
        <p>Please log in.</p>
        <button onClick={() => navigate('/login')}>Go to Login</button>
      </div>
    );
  }



  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Create Admin Account</h2>
        <p className={styles.subtitle}>
          Set up the first administrator account
        </p>

        {/* Show error message if exists */}
        {error && <div className={styles.errorBox}>{error}</div>}

        {/* Sign up form */}
        <form onSubmit={handleSignUp} className={styles.form}>
          {/* Full Name Input */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="Enter your full name"
              className={styles.input}
            
            />
          </div>

          {/* Email Input */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@example.com"
              className={styles.input}
              
            />
          </div>

          {/* Password Input */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password (min. 6 characters)"
              className={styles.input}
              required
            />
          </div>

          {/* Submit Button */}
               <button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Admin Account'}</button>
        </form>

        {/* Link to login */}
        {/* <p className={styles.linkText}>
          Already have an account?{" "}
          <button
            onClick={() => navigate("/admin-login")}
            className={styles.link}
          >
            Login here
          </button>
        </p> */}
      </div>
    </div>
  );
}
