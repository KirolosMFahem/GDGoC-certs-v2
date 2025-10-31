-- GDGoC Certificate Generator Database Schema

-- Table: allowed_leaders
-- Stores authenticated leaders who can generate certificates
CREATE TABLE IF NOT EXISTS allowed_leaders (
    ocid TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    org_name TEXT,
    can_login BOOLEAN DEFAULT true
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_certificates_unique_id ON certificates(unique_id);
CREATE INDEX IF NOT EXISTS idx_certificates_generated_by ON certificates(generated_by);
CREATE INDEX IF NOT EXISTS idx_allowed_leaders_email ON allowed_leaders(email);
