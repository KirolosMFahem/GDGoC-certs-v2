-- GDGoC Certificate Generator Database Schema

-- Table: allowed_leaders
-- Stores authenticated leaders who can generate certificates
CREATE TABLE IF NOT EXISTS allowed_leaders (
    ocid TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    org_name TEXT,
    org_name_set_at TIMESTAMP,  -- Timestamp when org_name was first set (for lock enforcement)
    can_login BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: certificates
-- Stores all generated certificates
CREATE TABLE IF NOT EXISTS certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unique_id TEXT UNIQUE NOT NULL,
    recipient_name TEXT NOT NULL,
    recipient_email TEXT,
    event_type TEXT NOT NULL CHECK (event_type IN ('workshop', 'course')),
    event_name TEXT NOT NULL,
    issue_date DATE DEFAULT CURRENT_DATE,
    issuer_name TEXT NOT NULL,
    org_name TEXT NOT NULL,
    generated_by TEXT REFERENCES allowed_leaders(ocid),
    pdf_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: email_templates
-- Stores custom email templates for certificate delivery
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    html_content TEXT NOT NULL,
    created_by TEXT REFERENCES allowed_leaders(ocid) ON DELETE CASCADE,
    org_name TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(org_name, name)  -- Template name must be unique per organization
);

-- Table: support_tickets
-- Stores support tickets for organization name change requests
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_type VARCHAR(50) NOT NULL CHECK (ticket_type IN ('org_name_change', 'other')),
    requester_ocid TEXT REFERENCES allowed_leaders(ocid),
    requester_email TEXT NOT NULL,
    current_org_name TEXT,
    requested_org_name TEXT,
    reason TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_certificates_unique_id ON certificates(unique_id);
CREATE INDEX IF NOT EXISTS idx_certificates_generated_by ON certificates(generated_by);
CREATE INDEX IF NOT EXISTS idx_allowed_leaders_email ON allowed_leaders(email);
CREATE INDEX IF NOT EXISTS idx_email_templates_org ON email_templates(org_name);
CREATE INDEX IF NOT EXISTS idx_email_templates_default ON email_templates(org_name, is_default);
CREATE INDEX IF NOT EXISTS idx_support_tickets_requester ON support_tickets(requester_ocid);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
