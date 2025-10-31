import { useState } from 'react';
import { certificatesAPI } from '../utils/api';
import './PublicValidationPage.css';

export default function PublicValidationPage() {
  const [uniqueId, setUniqueId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleValidate = async (e) => {
    e.preventDefault();
    
    if (!uniqueId.trim()) {
      setError('Please enter a certificate ID');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await certificatesAPI.validate(uniqueId.trim());
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="validation-page">
      <div className="validation-container">
        <div className="header">
          <h1>🎓 GDGoC Certificate Validation</h1>
          <p>Verify the authenticity of your certificate</p>
        </div>

        <form onSubmit={handleValidate} className="validation-form">
          <div className="input-group">
            <label htmlFor="uniqueId">Certificate ID</label>
            <input
              id="uniqueId"
              type="text"
              value={uniqueId}
              onChange={(e) => setUniqueId(e.target.value)}
              placeholder="Enter certificate ID (e.g., GDGOC-XXX-XXX)"
              disabled={loading}
            />
          </div>

          <button type="submit" disabled={loading} className="validate-btn">
            {loading ? 'Validating...' : 'Validate Certificate'}
          </button>
        </form>

        {error && (
          <div className="error-message">
            <span className="icon">❌</span>
            <div>
              <strong>Certificate Not Found</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        {result && result.valid && (
          <div className="success-message">
            <span className="icon">✅</span>
            <div>
              <strong>Valid Certificate</strong>
              <div className="certificate-details">
                <p><strong>Recipient:</strong> {result.certificate.recipient_name}</p>
                <p><strong>Event:</strong> {result.certificate.event_name}</p>
                <p><strong>Type:</strong> {result.certificate.event_type}</p>
                <p><strong>Issue Date:</strong> {new Date(result.certificate.issue_date).toLocaleDateString()}</p>
                <p><strong>Issued By:</strong> {result.certificate.issuer_name}</p>
                <p><strong>Organization:</strong> {result.certificate.org_name}</p>
                {result.certificate.pdf_url && (
                  <p>
                    <a href={result.certificate.pdf_url} target="_blank" rel="noopener noreferrer">
                      Download PDF
                    </a>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
