import React from 'react';
import { Link } from 'react-router-dom';
import '../Styling.css';

const Dashboard = () => {
  return (
    <div className="dashboard">
      <Link to="/placeholder" className="dashboard-box">
        <i className="fa-solid fa-users" style={{ color: '#74C0FC' }}></i>
        <h2>Policy Holders</h2>
      </Link>
      <Link to="/policies" className="dashboard-box">
        <i className="fa-solid fa-file-alt" style={{ color: '#74C0FC' }}></i>
        <h2>Policies</h2>
      </Link>
      <Link to="/claims" className="dashboard-box">
        <i className="fa-solid fa-file-invoice-dollar" style={{ color: '#74C0FC' }}></i>
        <h2>Claims</h2>
      </Link>
    </div>
  );
};

export default Dashboard;
