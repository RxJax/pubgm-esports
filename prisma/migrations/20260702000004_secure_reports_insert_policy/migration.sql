-- Drop the existing permissive insert policy on reports
DROP POLICY IF EXISTS "Allow anonymous report insertions" ON "reports";

-- Drop existing secure policy if it already exists
DROP POLICY IF EXISTS "Secure anonymous report insertions" ON "reports";

-- Create the secure insert policy requiring reason_category to be non-empty
CREATE POLICY "Secure anonymous report insertions" ON "reports"
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (reason_category IS NOT NULL AND length(reason_category) > 0);
