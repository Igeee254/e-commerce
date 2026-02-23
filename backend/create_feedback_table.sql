-- Create feedback table
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Clients can insert feedback
CREATE POLICY "Allow public insert feedback"
ON public.feedback FOR INSERT
WITH CHECK (true);

-- Admin can read all feedback
CREATE POLICY "Allow admin read feedback"
ON public.feedback FOR SELECT
USING (true);
