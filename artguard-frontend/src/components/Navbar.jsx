import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaHome, FaUserShield, FaSignOutAlt } from 'react-icons/fa';
import LanguageSwitcher from './LanguageSwitcher';
import '../styles/Navbar.css';

export default function Navbar({ onLogout, user }) {
  const { t } = useTranslation();

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="nav-link">
          <FaHome className="nav-icon" />
          {t('navbar.home')}
        </Link>

        {user?.role === 'admin' && (
          <Link to="/admin" className="nav-link">
            <FaUserShield className="nav-icon" />
            {t('navbar.admin')}
          </Link>
        )}
      </div>

      <div className="navbar-right">
        <LanguageSwitcher />
        <button className="logout-btn" onClick={onLogout}>
          <FaSignOutAlt /> {t('navbar.logout')}
        </button>
      </div>
    </nav>
  );
}



