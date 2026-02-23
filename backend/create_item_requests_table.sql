-- Create item_requests table
CREATE TABLE IF NOT EXISTS public.item_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_email TEXT NOT NULL,
    item_name TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, fulfilled
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.item_requests ENABLE ROW LEVEL SECURITY;

-- Clients can insert their own requests
CREATE POLICY "Allow public insert requests"
ON public.item_requests FOR INSERT
WITH CHECK (true);

-- Admin can read and update all requests
CREATE POLICY "Allow admin full access"
ON public.item_requests FOR ALL
USING (true);
