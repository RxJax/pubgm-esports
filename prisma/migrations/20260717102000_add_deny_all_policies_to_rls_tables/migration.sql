-- Create strict deny policies that reject all public access via PostgREST API
CREATE POLICY "Deny all public access" ON "organizations" FOR ALL USING (false);
CREATE POLICY "Deny all public access" ON "team_rosters" FOR ALL USING (false);
CREATE POLICY "Deny all public access" ON "system_config" FOR ALL USING (false);
