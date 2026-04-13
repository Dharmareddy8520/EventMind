import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="layout-container">
      <aside className="layout-sidebar glass-panel">
        <div className="sidebar-header">
          <span className="logo-icon">✨</span>
          <h2 className="logo-text">EventMind</h2>
        </div>
        
        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>Dashboard</NavLink>
          <NavLink to="/sessions" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>Sessions</NavLink>
          <NavLink to="/agenda" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>My Agenda</NavLink>
          <NavLink to="/map" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>Venue Map</NavLink>
          <NavLink to="/chat" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>AI Assistant</NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            {user?.photoURL ? <img src={user.photoURL} alt="Avatar" className="user-avatar" /> : <div className="user-avatar-placeholder">{user?.displayName?.[0]}</div>}
            <span className="user-name">{user?.displayName}</span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>Sign Out</button>
        </div>
      </aside>
      <main className="layout-main">
        <div className="main-content-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
