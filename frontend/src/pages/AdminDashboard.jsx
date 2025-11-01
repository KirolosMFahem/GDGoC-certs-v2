import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import { certificatesAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('single');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Single certificate form
  const [singleForm, setSingleForm] = useState({
    recipient_name: '',
    recipient_email: '',
    event_type: 'workshop',
    event_name: '',
    issue_date: new Date().toISOString().split('T')[0]
  });

  // Bulk upload state
  const [bulkResults, setBulkResults] = useState(null);

  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await certificatesAPI.create(singleForm);
      setSuccess(`Certificate created successfully! ID: ${result.unique_id}`);
      
      // Reset form
      setSingleForm({
        recipient_name: '',
        recipient_email: '',
        event_type: 'workshop',
        event_name: '',
        issue_date: new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        if (results.errors.length > 0) {
          setError('Error parsing CSV file');
          return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);
        setBulkResults(null);

        try {
          const certificates = results.data.map(row => ({
            recipient_name: row.recipient_name,
            recipient_email: row.recipient_email || '',
            event_type: row.event_type || 'workshop',
            event_name: row.event_name,
            issue_date: row.issue_date || new Date().toISOString().split('T')[0]
          }));

          const result = await certificatesAPI.createBulk(certificates);
          setBulkResults(result);
          
          if (result.successful > 0) {
            setSuccess(`Successfully created ${result.successful} out of ${result.total} certificates`);
          }
          
          if (result.failed > 0) {
            setError(`${result.failed} certificates failed to create`);
          }
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      },
      error: (error) => {
        setError('Failed to parse CSV file');
        console.error(error);
      }
    });
  };

  const downloadTemplate = () => {
    const csv = 'recipient_name,recipient_email,event_type,event_name,issue_date\nJohn Doe,john@example.com,workshop,Introduction to React,2024-01-15\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Certificate Generator</h1>
          <p>Welcome, {user?.name}</p>
          <p className="org-name">{user?.org_name}</p>
        </div>
        <div className="header-actions">
          <button onClick={() => navigate('/admin/customization')} className="customization-btn">
            🎨 Customization
          </button>
          <button onClick={() => navigate('/admin/settings')} className="settings-btn">
            ⚙️ Settings
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="tabs">
          <button
            className={activeTab === 'single' ? 'active' : ''}
            onClick={() => setActiveTab('single')}
          >
            Single Certificate
          </button>
          <button
            className={activeTab === 'bulk' ? 'active' : ''}
            onClick={() => setActiveTab('bulk')}
          >
            Bulk Upload
          </button>
        </div>

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

        {activeTab === 'single' && (
          <div className="tab-content">
            <h2>Generate Single Certificate</h2>
            <form onSubmit={handleSingleSubmit} className="certificate-form">
              <div className="form-row">
                <div className="input-group">
                  <label>Recipient Name *</label>
                  <input
                    type="text"
                    value={singleForm.recipient_name}
                    onChange={(e) => setSingleForm({ ...singleForm, recipient_name: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="input-group">
                  <label>Recipient Email</label>
                  <input
                    type="email"
                    value={singleForm.recipient_email}
                    onChange={(e) => setSingleForm({ ...singleForm, recipient_email: e.target.value })}
                    disabled={loading}
                  />
                  <small>Optional - certificate will be emailed if provided</small>
                </div>
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label>Event Type *</label>
                  <select
                    value={singleForm.event_type}
                    onChange={(e) => setSingleForm({ ...singleForm, event_type: e.target.value })}
                    required
                    disabled={loading}
                  >
                    <option value="workshop">Workshop</option>
                    <option value="course">Course</option>
                  </select>
                </div>

                <div className="input-group">
                  <label>Issue Date *</label>
                  <input
                    type="date"
                    value={singleForm.issue_date}
                    onChange={(e) => setSingleForm({ ...singleForm, issue_date: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Event Name *</label>
                <input
                  type="text"
                  value={singleForm.event_name}
                  onChange={(e) => setSingleForm({ ...singleForm, event_name: e.target.value })}
                  placeholder="e.g., Introduction to React"
                  required
                  disabled={loading}
                />
              </div>

              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? 'Generating...' : 'Generate Certificate'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'bulk' && (
          <div className="tab-content">
            <h2>Bulk Certificate Upload</h2>
            
            <div className="bulk-instructions">
              <p>Upload a CSV file with the following columns:</p>
              <code>recipient_name, recipient_email, event_type, event_name, issue_date</code>
              <button onClick={downloadTemplate} className="template-btn">
                📥 Download CSV Template
              </button>
            </div>

            <div className="file-upload">
              <input
                type="file"
                accept=".csv"
                onChange={handleBulkUpload}
                disabled={loading}
                id="csv-upload"
              />
              <label htmlFor="csv-upload" className="upload-label">
                {loading ? 'Processing...' : '📂 Choose CSV File'}
              </label>
            </div>

            {bulkResults && (
              <div className="bulk-results">
                <h3>Upload Results</h3>
                <div className="results-summary">
                  <div className="stat">
                    <span className="stat-value">{bulkResults.total}</span>
                    <span className="stat-label">Total</span>
                  </div>
                  <div className="stat success">
                    <span className="stat-value">{bulkResults.successful}</span>
                    <span className="stat-label">Success</span>
                  </div>
                  <div className="stat error">
                    <span className="stat-value">{bulkResults.failed}</span>
                    <span className="stat-label">Failed</span>
                  </div>
                </div>

                {bulkResults.errors && bulkResults.errors.length > 0 && (
                  <div className="errors-list">
                    <h4>Errors:</h4>
                    {bulkResults.errors.map((err, idx) => (
                      <div key={idx} className="error-item">
                        <strong>{err.data.recipient_name}</strong>: {err.error}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
