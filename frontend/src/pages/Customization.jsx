import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Customization.css';

// Simple code editor component (can be replaced with Monaco Editor or CodeMirror)
function CodeEditor({ value, onChange, readOnly = false }) {
  return (
    <div className="code-editor">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        readOnly={readOnly}
        spellCheck={false}
        className="code-textarea"
      />
    </div>
  );
}

export default function Customization() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('templates');
  const [templates, setTemplates] = useState({ builtin: [], custom: [] });
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editorContent, setEditorContent] = useState('');
  const [editorMode, setEditorMode] = useState(null); // null, 'view', 'edit', 'new'
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDesc, setNewTemplateDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/templates/email', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load templates');
      }

      const data = await response.json();
      setTemplates(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplateContent = async (type, name) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/templates/email/${type}/${name}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load template content');
      }

      const data = await response.json();
      setSelectedTemplate(data);
      setEditorContent(data.html_content);
      setEditorMode('view');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveTemplate = async () => {
    if (!editorContent.trim()) {
      setError('Template content cannot be empty');
      return;
    }

    const templateName = editorMode === 'new' ? newTemplateName : selectedTemplate.name;
    const templateDesc = editorMode === 'new' ? newTemplateDesc : selectedTemplate.description;

    if (editorMode === 'new' && !templateName) {
      setError('Template name is required');
      return;
    }

    // Validate template name
    if (editorMode === 'new' && !/^[a-zA-Z0-9_-]+\.html$/.test(templateName)) {
      setError('Template name must be alphanumeric with .html extension (e.g., my-template.html)');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/templates/email', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: templateName,
          description: templateDesc,
          html_content: editorContent,
          is_default: false
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to save template');
      }

      setSuccess('Template saved successfully!');
      setEditorMode('view');
      loadTemplates();

      // Reset new template fields
      if (editorMode === 'new') {
        setNewTemplateName('');
        setNewTemplateDesc('');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteTemplate = async (id) => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/templates/email/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete template');
      }

      setSuccess('Template deleted successfully!');
      setSelectedTemplate(null);
      setEditorMode(null);
      setEditorContent('');
      loadTemplates();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const setDefaultTemplate = async (id) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/templates/email/${id}/default`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to set default template');
      }

      setSuccess('Default template updated!');
      loadTemplates();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startNewTemplate = () => {
    setEditorMode('new');
    setEditorContent('<!DOCTYPE html>\n<html>\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <style>\n    body {\n      font-family: Arial, sans-serif;\n      line-height: 1.6;\n      color: #333;\n      max-width: 600px;\n      margin: 0 auto;\n      padding: 20px;\n    }\n    .header {\n      background: #4285F4;\n      color: white;\n      padding: 20px;\n      text-align: center;\n    }\n    .content {\n      padding: 20px;\n      background: #f9f9f9;\n    }\n    .button {\n      display: inline-block;\n      padding: 12px 24px;\n      background: #34A853;\n      color: white;\n      text-decoration: none;\n      border-radius: 4px;\n      margin: 10px 0;\n    }\n  </style>\n</head>\n<body>\n  <div class="header">\n    <h1>{{ORGANIZATION_NAME}}</h1>\n  </div>\n  <div class="content">\n    <h2>Congratulations, {{RECIPIENT_NAME}}!</h2>\n    <p>You have successfully completed <strong>{{EVENT_NAME}}</strong>.</p>\n    <p>\n      <a href="{{VALIDATION_URL}}" class="button">View Certificate</a>\n    </p>\n    <p>Certificate ID: {{CERTIFICATE_ID}}</p>\n    <p>Issue Date: {{ISSUE_DATE}}</p>\n  </div>\n</body>\n</html>');
    setSelectedTemplate(null);
    setNewTemplateName('');
    setNewTemplateDesc('');
    setError(null);
    setSuccess(null);
  };

  const duplicateTemplate = (template) => {
    setEditorMode('new');
    setEditorContent(template.html_content);
    setNewTemplateName('');
    setNewTemplateDesc(`Copy of ${template.description || template.name}`);
    setSelectedTemplate(null);
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="customization-page">
      <div className="customization-header">
        <button onClick={() => navigate('/admin')} className="back-btn">
          ← Back to Dashboard
        </button>
        <h1>Customization</h1>
      </div>

      <div className="customization-content">
        <div className="tabs">
          <button
            className={activeTab === 'templates' ? 'active' : ''}
            onClick={() => setActiveTab('templates')}
          >
            📧 Email Templates
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

        {activeTab === 'templates' && (
          <div className="templates-section">
            <div className="templates-layout">
              <div className="templates-sidebar">
                <div className="sidebar-header">
                  <h3>Templates</h3>
                  <button
                    onClick={startNewTemplate}
                    className="new-template-btn"
                    disabled={loading}
                  >
                    + New
                  </button>
                </div>

                <div className="template-list">
                  <h4>Built-in Templates</h4>
                  {templates.builtin.map((template) => (
                    <div
                      key={template.name}
                      className={`template-item ${selectedTemplate?.name === template.name ? 'active' : ''}`}
                      onClick={() => loadTemplateContent('builtin', template.name)}
                    >
                      <div className="template-name">{template.name}</div>
                      <div className="template-desc">{template.description}</div>
                    </div>
                  ))}

                  <h4>Custom Templates</h4>
                  {templates.custom.length === 0 && (
                    <div className="empty-state">No custom templates yet</div>
                  )}
                  {templates.custom.map((template) => (
                    <div
                      key={template.id}
                      className={`template-item ${selectedTemplate?.id === template.id ? 'active' : ''} ${template.is_default ? 'default' : ''}`}
                      onClick={() => loadTemplateContent('custom', template.name)}
                    >
                      <div className="template-name">
                        {template.name}
                        {template.is_default && <span className="badge">Default</span>}
                      </div>
                      <div className="template-desc">{template.description || 'No description'}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="templates-main">
                {editorMode === null && (
                  <div className="empty-editor">
                    <p>Select a template from the list or create a new one</p>
                    <button onClick={startNewTemplate} className="primary-btn">
                      Create New Template
                    </button>
                  </div>
                )}

                {editorMode === 'view' && selectedTemplate && (
                  <div className="template-viewer">
                    <div className="viewer-header">
                      <div>
                        <h3>{selectedTemplate.name}</h3>
                        <p>{selectedTemplate.description}</p>
                      </div>
                      <div className="viewer-actions">
                        {selectedTemplate.type === 'custom' && (
                          <>
                            <button
                              onClick={() => setEditorMode('edit')}
                              className="secondary-btn"
                              disabled={loading}
                            >
                              ✏️ Edit
                            </button>
                            {!selectedTemplate.is_default && (
                              <>
                                <button
                                  onClick={() => setDefaultTemplate(selectedTemplate.id)}
                                  className="secondary-btn"
                                  disabled={loading}
                                >
                                  ⭐ Set as Default
                                </button>
                                <button
                                  onClick={() => deleteTemplate(selectedTemplate.id)}
                                  className="danger-btn"
                                  disabled={loading}
                                >
                                  🗑️ Delete
                                </button>
                              </>
                            )}
                          </>
                        )}
                        {selectedTemplate.type === 'builtin' && (
                          <button
                            onClick={() => duplicateTemplate(selectedTemplate)}
                            className="secondary-btn"
                            disabled={loading}
                          >
                            📋 Duplicate
                          </button>
                        )}
                      </div>
                    </div>
                    <CodeEditor value={editorContent} onChange={() => {}} readOnly={true} />
                  </div>
                )}

                {(editorMode === 'edit' || editorMode === 'new') && (
                  <div className="template-editor">
                    <div className="editor-header">
                      <div>
                        {editorMode === 'new' ? (
                          <div className="new-template-form">
                            <input
                              type="text"
                              placeholder="Template name (e.g., my-template.html)"
                              value={newTemplateName}
                              onChange={(e) => setNewTemplateName(e.target.value)}
                              className="template-name-input"
                              disabled={loading}
                            />
                            <input
                              type="text"
                              placeholder="Description (optional)"
                              value={newTemplateDesc}
                              onChange={(e) => setNewTemplateDesc(e.target.value)}
                              className="template-desc-input"
                              disabled={loading}
                            />
                          </div>
                        ) : (
                          <h3>Editing: {selectedTemplate.name}</h3>
                        )}
                      </div>
                      <div className="editor-actions">
                        <button
                          onClick={saveTemplate}
                          className="primary-btn"
                          disabled={loading}
                        >
                          {loading ? 'Saving...' : '💾 Save'}
                        </button>
                        <button
                          onClick={() => {
                            setEditorMode('view');
                            if (selectedTemplate) {
                              setEditorContent(selectedTemplate.html_content);
                            }
                          }}
                          className="secondary-btn"
                          disabled={loading}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>

                    <div className="editor-help">
                      <strong>Available Variables:</strong>{' '} {'{{RECIPIENT_NAME}}'},{' '}{'{{EVENT_NAME}}'},{' '}{'{{CERTIFICATE_ID}}'},{' '}{'{{VALIDATION_URL}}'},{' '}{'{{ISSUE_DATE}}'},{' '}{'{{ORGANIZATION_NAME}}'},{' '}{'{{PDF_URL}}'},{' '}{'{{CUSTOM_MESSAGE}}'}
                    </div>

                    <CodeEditor
                      value={editorContent}
                      onChange={setEditorContent}
                      readOnly={loading}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
