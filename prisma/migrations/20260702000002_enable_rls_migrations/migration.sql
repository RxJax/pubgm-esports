-- Enable Row Level Security on internal migration tracking table conditionally
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = '_prisma_migrations') THEN
        ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;
        
        -- Drop existing policy if any
        DROP POLICY IF EXISTS "Deny all public access" ON "_prisma_migrations";
        
        -- Create a strict deny policy that rejects all public access
        CREATE POLICY "Deny all public access" ON "_prisma_migrations" FOR ALL USING (false);
    END IF;
END $$;
