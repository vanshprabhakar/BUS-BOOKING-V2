import React from 'react';
import '../styles/Navbar.css';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          🚌 BusBook
        </Link>

        <div className={`nav-menu ${menuOpen ? 'active' : ''}`}>
          <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>
            Home
          </Link>

          {user ? (
            <>
              <Link to="/my-bookings" className="nav-link" onClick={() => setMenuOpen(false)}>
                My Bookings
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="nav-link" onClick={() => setMenuOpen(false)}>
                  Admin Panel
                </Link>
              )}
              <div className="nav-user-menu">
                <span className="nav-username">{user.name}</span>
                <button className="nav-btn logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link" onClick={() => setMenuOpen(false)}>
                Login
              </Link>
              <Link to="/register" className="nav-link nav-btn register-btn" onClick={() => setMenuOpen(false)}>
                Register
              </Link>
            </>
          )}
        </div>

        <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
