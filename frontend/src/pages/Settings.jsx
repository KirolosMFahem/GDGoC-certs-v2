import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import './Settings.css';

export default function Settings() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const updatedUser = await profileAPI.updateProfile({
        name: formData.name.trim()
      });
      
      updateUser(updatedUser);
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <button onClick={() => navigate('/admin')} className="back-btn">
          ← Back to Dashboard
        </button>
        <h1>Settings</h1>
      </div>

      <div className="settings-content">
        <div className="settings-card">
          <h2>Profile Information</h2>
          
          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="settings-form">
            <div className="input-group">
              <label htmlFor="name">Your Name</label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={loading}
                required
              />
              <small>This will appear as the issuer name on certificates</small>
            </div>

            <div className="input-group">
              <label>Organization Name</label>
              <input
                type="text"
                value={user?.org_name || ''}
                disabled
                className="locked-field"
              />
              <small className="warning-text">
                ⚠️ Organization name cannot be changed. Contact support if changes are needed.
              </small>
            </div>

            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
              />
              <small>Email is managed by your organization</small>
            </div>

            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
