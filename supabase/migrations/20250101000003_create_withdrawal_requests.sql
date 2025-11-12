-- Create withdrawal_requests table for tracking withdrawal requests
CREATE TABLE IF NOT EXISTS withdrawal_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('bank', 'paypal', 'stripe')),
    payment_details JSONB, -- Store bank account, PayPal email, etc.
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'processing', 'completed', 'rejected', 'cancelled')),
    admin_notes TEXT,
    processed_by UUID REFERENCES profiles(id),
    processed_at TIMESTAMPTZ,
    stripe_payout_id TEXT, -- For Stripe payouts
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Policies for withdrawal_requests
CREATE POLICY "Users can view own withdrawal requests"
    ON withdrawal_requests
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own withdrawal requests"
    ON withdrawal_requests
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Admin can view all withdrawal requests
CREATE POLICY "Admins can view all withdrawal requests"
    ON withdrawal_requests
    FOR SELECT
    TO authenticated
    USING (true); -- In production, check for admin role

-- Admin can update withdrawal requests
CREATE POLICY "Admins can update withdrawal requests"
    ON withdrawal_requests
    FOR UPDATE
    TO authenticated
    USING (true); -- In production, check for admin role

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user_id ON withdrawal_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON withdrawal_requests(status);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_created_at ON withdrawal_requests(created_at DESC);

