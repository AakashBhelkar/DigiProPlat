-- Create download_tokens table for secure, time-limited download links
CREATE TABLE IF NOT EXISTS public.download_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    file_id UUID NOT NULL REFERENCES public.product_files(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    download_count INTEGER DEFAULT 0,
    max_downloads INTEGER DEFAULT 5,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(order_id, file_id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_download_tokens_token ON public.download_tokens(token);
CREATE INDEX IF NOT EXISTS idx_download_tokens_order_id ON public.download_tokens(order_id);
CREATE INDEX IF NOT EXISTS idx_download_tokens_expires_at ON public.download_tokens(expires_at);

-- Enable RLS
ALTER TABLE public.download_tokens ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own download tokens (through orders)
CREATE POLICY "Users can view own download tokens"
    ON public.download_tokens
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = download_tokens.order_id
            AND orders.buyer_id = auth.uid()
        )
    );

-- Policy: Service role can manage all download tokens
CREATE POLICY "Service role can manage download tokens"
    ON public.download_tokens
    FOR ALL
    USING (auth.role() = 'service_role');

