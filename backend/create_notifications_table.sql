-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info', -- info, alert, system
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Realtime (optional, for future use)
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- RLS Policies (Simplified for now - allow read to all, write to authenticated/admin)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access"
ON public.notifications FOR SELECT
USING (true);

CREATE POLICY "Allow admin insert"
ON public.notifications FOR INSERT
WITH CHECK (true); -- In production, restrict to service_role or admin role
