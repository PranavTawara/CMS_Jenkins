import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../Styling.css';

const Navbar = ({ handleLogout }) => {
  const navigate = useNavigate();

  // Function to handle logout
  const handleLogoutClick = () => {
    handleLogout();  // Call the passed down handleLogout function
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">CMS</div>
      <ul className="navbar-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/placeholder">Holders</Link></li>
        <li><Link to="/policies">Policies</Link></li>
        <li><Link to="/claims">Claims</Link></li>
        <li><button onClick={handleLogoutClick} className="logout-button">Logout</button></li>
      </ul>
    </nav>
  );
}

export default Navbar;
