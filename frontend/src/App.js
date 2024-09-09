import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Placeholder from './pages/Placeholder';
import Policies from './pages/Policies';
import Claims from './pages/Claims';
import Login from './pages/Login';
import Register from './pages/Register';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  return (
    <Router>
      <div className="App">
        {isLoggedIn && <Navbar handleLogout={handleLogout} />}
        <Routes>
          {isLoggedIn ? (
            <>
              <Route path="/" element={<Dashboard />} />
              <Route path="/placeholder" element={<Placeholder />} />
              <Route path="/policies" element={<Policies />} />
              <Route path="/claims" element={<Claims />} />
            </>
          ) : (
            <>
              <Route path="/" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
            </>
          )}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
