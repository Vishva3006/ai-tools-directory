-- ============================================================
-- Fix: Allow anyone (authenticated + anonymous) to INSERT into
--      tool_submissions. Reads remain restricted to admins.
-- ============================================================

-- 1. Ensure RLS is enabled on the table
ALTER TABLE tool_submissions ENABLE ROW LEVEL SECURITY;

-- 2. DROP the existing (broken) INSERT policy if one exists
DROP POLICY IF EXISTS "Anyone can submit tools" ON tool_submissions;
DROP POLICY IF EXISTS "Authenticated users can submit tools" ON tool_submissions;

-- 3. Allow ANY visitor (anon + authenticated) to insert a submission.
--    The form already collects submitter_email, so we do not need auth.
CREATE POLICY "Anyone can submit tools"
  ON tool_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 4. Only admins/service-role can read/update/delete submissions.
--    (These policies may already exist; use CREATE OR REPLACE-style DROP+CREATE.)
DROP POLICY IF EXISTS "Admins can manage submissions" ON tool_submissions;

CREATE POLICY "Admins can manage submissions"
  ON tool_submissions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'moderator')
    )
  );
