import React, { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import '../Styling.css';

function Login({ setIsLoggedIn }) {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      console.log('Token received:', data.token); // Log the token for debugging
      localStorage.setItem('token', data.token); // Save token to localStorage
      setIsLoggedIn(true); // Update the logged-in state
      toast.success('Login successful!');
      setTimeout(() => {
        setLoading(false);
        navigate('/'); // Redirect after login
      }, 1800);
    } catch (error) {
      setLoading(false);
      console.error('Login failed:', error);
      toast.error(error.message || 'Login failed!');
    }
  };

  return (
    <div id="login">
      <div className="wrapper">
        <form onSubmit={handleSubmit}>
          <h1>Login</h1>
          <div className="input-box">
            <input
              type="email"
              id="email"
              placeholder="E-mail"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="input-box">
            <input
              type="password"
              id="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>
          <button type="submit" id="login-button" className="btn">
            {loading ? (
              <span>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Loading...
              </span>
            ) : (
              "Login"
            )}
          </button>
          <div className="register-link">
            <p>Not registered yet? <Link to="/register">Register</Link></p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
