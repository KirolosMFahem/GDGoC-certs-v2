import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ProfileSetup from '../pages/ProfileSetup';
import AdminDashboard from '../pages/AdminDashboard';
import Settings from '../pages/Settings';
import Customization from '../pages/Customization';
import './AdminApp.css';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      // If user doesn't have org_name, redirect to profile setup
      if (!user.org_name) {
        navigate('/profile-setup', { replace: true });
      }
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="error-screen">
        <h1>Authentication Error</h1>
        <p>Unable to authenticate. Please try refreshing the page.</p>
      </div>
    );
  }

  return children;
}

function RequireOrgName({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user?.org_name) {
    return <Navigate to="/profile-setup" replace />;
  }

  return children;
}

export default function AdminApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/profile-setup" element={
          <ProtectedRoute>
            <ProfileSetup />
          </ProtectedRoute>
        } />
        
        <Route path="/admin" element={
          <ProtectedRoute>
            <RequireOrgName>
              <AdminDashboard />
            </RequireOrgName>
          </ProtectedRoute>
        } />
        
        <Route path="/admin/settings" element={
          <ProtectedRoute>
            <RequireOrgName>
              <Settings />
            </RequireOrgName>
          </ProtectedRoute>
        } />
        
        <Route path="/admin/customization" element={
          <ProtectedRoute>
            <RequireOrgName>
              <Customization />
            </RequireOrgName>
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
