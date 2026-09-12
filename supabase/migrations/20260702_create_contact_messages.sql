-- Create contact_messages table for the Contact Us form
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL CHECK (char_length(name) >= 2 AND char_length(name) <= 100),
  email       text NOT NULL CHECK (email ~* '^[^\s@]+@[^\s@]+\.[^\s@]+$'),
  subject     text NOT NULL CHECK (char_length(subject) >= 3 AND char_length(subject) <= 200),
  message     text NOT NULL CHECK (char_length(message) >= 20 AND char_length(message) <= 2000),
  status      text NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied')),
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Enable Row-Level Security
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous visitors) can INSERT a contact message
CREATE POLICY "Anyone can submit a contact message"
  ON public.contact_messages
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Only authenticated users with admin role can read/update contact messages
CREATE POLICY "Admins can read contact messages"
  ON public.contact_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update contact messages"
  ON public.contact_messages
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
