-- Drop existing insert policy on reports if any
DROP POLICY IF EXISTS "Allow anonymous report insertions" ON "reports";

-- Create a permissive insert policy allowing public/anonymous report submissions
CREATE POLICY "Allow anonymous report insertions" ON "reports" FOR INSERT WITH CHECK (true);
