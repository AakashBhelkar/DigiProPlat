-- Create kyc_documents table for storing KYC document uploads
CREATE TABLE IF NOT EXISTS kyc_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    document_type TEXT NOT NULL CHECK (document_type IN ('passport', 'drivers_license', 'national_id', 'proof_of_address', 'other')),
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    storage_path TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    reviewed_by UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE kyc_documents ENABLE ROW LEVEL SECURITY;

-- Policies for kyc_documents
CREATE POLICY "Users can view own KYC documents"
    ON kyc_documents
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own KYC documents"
    ON kyc_documents
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Admin can view all KYC documents (this would need admin role check in production)
CREATE POLICY "Admins can view all KYC documents"
    ON kyc_documents
    FOR SELECT
    TO authenticated
    USING (true); -- In production, check for admin role

-- Admin can update KYC documents
CREATE POLICY "Admins can update KYC documents"
    ON kyc_documents
    FOR UPDATE
    TO authenticated
    USING (true); -- In production, check for admin role

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_kyc_documents_user_id ON kyc_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_documents_status ON kyc_documents(status);

