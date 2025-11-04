import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import EmailIcon from '@mui/icons-material/Email';
import DescriptionIcon from '@mui/icons-material/Description';
import '../App.css';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { name: 'Email', path: '/dashboard/email', icon: <EmailIcon /> },
    { name: 'Template', path: '/dashboard/template', icon: <DescriptionIcon /> },
  ];


  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div className="sidebar">
      <div className="sidebar-section">
        {menuItems.map((item) => (
          <Link
            to={item.path}
            key={item.name}
            className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span style={{ marginRight: '10px', verticalAlign: 'middle' }}>{item.icon}</span>
            {item.name}
          </Link>
        ))}
      </div>
      <button
        className="sidebar-item logout-btn"
        style={{ marginTop: 'auto', width: 'auto', padding: '10px', background: '#e74c3c', color: '#fff', border: 'none', cursor: 'pointer' }}
        onClick={handleLogout}
      >
        Logout
      </button>
    </div>
  );
};

export default Sidebar;