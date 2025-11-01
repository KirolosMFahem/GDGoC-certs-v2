import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import './ProfileSetup.css';

export default function ProfileSetup() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    org_name: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.org_name.trim()) {
      setError('Organization name is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const updatedUser = await profileAPI.updateProfile({
        name: formData.name.trim(),
        org_name: formData.org_name.trim()
      });
      
      updateUser(updatedUser);
      navigate('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-setup-page">
      <div className="profile-setup-container">
        <div className="header">
          <h1>👋 Welcome to GDGoC Certificates</h1>
          <p>Complete your profile to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          {error && (
            <div className="error-banner">
              {error}
            </div>
          )}

          <div className="input-group">
            <label htmlFor="name">Your Name</label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter your full name"
              disabled={loading}
              required
            />
            <small>This will appear as the issuer name on certificates</small>
          </div>

          <div className="input-group">
            <label htmlFor="org_name">Organization Name *</label>
            <input
              id="org_name"
              type="text"
              value={formData.org_name}
              onChange={(e) => setFormData({ ...formData, org_name: e.target.value })}
              placeholder="e.g., GDGoC Alexandria University"
              disabled={loading}
              required
            />
            <small className="warning-text">
              ⚠️ <strong>Important:</strong> This cannot be changed later without a support ticket
            </small>
          </div>

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Saving...' : 'Complete Setup'}
          </button>
        </form>
      </div>
    </div>
  );
}
