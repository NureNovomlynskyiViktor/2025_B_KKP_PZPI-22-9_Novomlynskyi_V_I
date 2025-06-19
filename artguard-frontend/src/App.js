import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import AdminDashboard from './pages/AdminDashboard';
import Navbar from './components/Navbar';
import { getMe } from './services/authService';
import './i18n';
import './index.css';
import './App.css';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const userData = await getMe(token);
        setUser(userData);
      } catch {
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    checkToken();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Router>
      <Routes>
        {!user && (
          <Route path="/*" element={<LoginPage onLogin={setUser} />} />
        )}
        {user && (
          <>
            <Route
              path="/"
              element={
                <>
                  <Navbar user={user} onLogout={handleLogout} />
                  <HomePage user={user} />
                </>
              }
            />
            {user.role === 'admin' && (
              <Route
                path="/admin"
                element={
                  <>
                    <Navbar user={user} onLogout={handleLogout} />
                    <AdminDashboard />
                  </>
                }
              />
            )}
          </>
        )}
        <Route path="*" element={<Navigate to={user ? '/' : '/login'} />} />
      </Routes>
    </Router>
  );
}




