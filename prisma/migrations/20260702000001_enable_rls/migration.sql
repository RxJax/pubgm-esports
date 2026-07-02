-- Enable Row Level Security
ALTER TABLE "Player" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "reports" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Team" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TournamentPlacement" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Highlight" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public read access" ON "Player";
DROP POLICY IF EXISTS "Allow public read access" ON "Team";
DROP POLICY IF EXISTS "Allow public read access" ON "TournamentPlacement";
DROP POLICY IF EXISTS "Allow public read access" ON "Highlight";

-- Create permissive read policies allowing anyone to read public schemas
CREATE POLICY "Allow public read access" ON "Player" FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON "Team" FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON "TournamentPlacement" FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON "Highlight" FOR SELECT USING (true);
