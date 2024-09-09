import React, { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import '../Styling.css';

function Register() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", address: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok) {
        setFormData({ name: "", email: "", password: "", address: "" });
        toast.success(data.Message);
        setTimeout(() => {
          setLoading(false);
          navigate("/login");
        }, 1800);
      } else {
        throw new Error(data.Message);
      }
    } catch (error) {
      setLoading(false);
      console.error("Registration failed:", error);
      toast.error("Registration failed!");
    }
  };

  return (
    <div id="login">
      <div className="wrapper">
        <form onSubmit={handleSubmit}>
          <h1>Register</h1>
          <div className="input-box">
            <input
              type="text"
              id="name"
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="input-box">
            <input
              type="email"
              id="email"
              placeholder="E-mail"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <i className="bx bxs-user"></i>
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
            <i className="bx bxs-lock-alt"></i>
          </div>
          <div className="input-box">
            <input
              type="text"
              id="address"
              placeholder="Address (place)"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />
          </div>
          <button type="submit" id="register-button" className="btn">
            {loading ? (
              <span>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Loading...
              </span>
            ) : (
              "Register"
            )}
          </button>
          <div className="register-link">
            <p>Already Registered! <Link to="/login">Login</Link></p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
