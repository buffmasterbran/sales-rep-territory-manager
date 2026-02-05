-- =====================================================
-- SALES TERRITORY MANAGER - SUPABASE DATABASE SETUP
-- =====================================================
-- Run this SQL in your Supabase SQL Editor (SQL tab in dashboard)
-- =====================================================

-- Enable UUID extension (usually already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: reps
-- Stores sales representative information
-- =====================================================
CREATE TABLE IF NOT EXISTS reps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  agency TEXT,  -- NULL if rep is independent
  channel TEXT NOT NULL CHECK (channel IN ('Golf', 'Promo', 'Gift')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for channel filtering
CREATE INDEX IF NOT EXISTS idx_reps_channel ON reps(channel);

-- Index for email lookups (for CSV upload matching)
CREATE INDEX IF NOT EXISTS idx_reps_email ON reps(email);

-- Index for sorting by name
CREATE INDEX IF NOT EXISTS idx_reps_name ON reps(last_name, first_name);

-- =====================================================
-- TABLE: assignments
-- Stores territory (zip code) assignments to reps
-- =====================================================
CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  zip_code TEXT NOT NULL CHECK (zip_code ~ '^\d{5}$'),
  channel TEXT NOT NULL CHECK (channel IN ('Golf', 'Promo', 'Gift')),
  rep_id UUID NOT NULL REFERENCES reps(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Composite unique constraint: one rep per zip+channel combination
  UNIQUE (zip_code, channel)
);

-- Index for fast zip code lookups (API endpoint)
CREATE INDEX IF NOT EXISTS idx_assignments_zip ON assignments(zip_code);

-- Index for channel filtering
CREATE INDEX IF NOT EXISTS idx_assignments_channel ON assignments(channel);

-- Index for rep_id lookups
CREATE INDEX IF NOT EXISTS idx_assignments_rep ON assignments(rep_id);

-- =====================================================
-- TABLE: audit_log
-- Stores change history for tracking who updated what
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,        -- NetSuite employee ID
  username TEXT NOT NULL,       -- PAWS username
  user_full_name TEXT NOT NULL, -- Full name of user
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete', 'bulk_upload')),
  table_name TEXT NOT NULL CHECK (table_name IN ('reps', 'assignments')),
  record_id TEXT,               -- UUID of affected record (if single record)
  description TEXT NOT NULL,    -- Human-readable description of what changed
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for filtering by user
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(username);

-- Index for filtering by table
CREATE INDEX IF NOT EXISTS idx_audit_table ON audit_log(table_name);

-- Index for filtering by action
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_log(action);

-- Index for sorting by time (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) - OPTIONAL
-- =====================================================
-- NOTE: Since this app authenticates via NetSuite (not Supabase Auth),
-- and uses the service_role key which bypasses RLS, these policies
-- are optional. They're included for completeness if you want to
-- add Supabase Auth in the future.
-- =====================================================

-- Enable RLS on both tables
ALTER TABLE reps ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES FOR: reps
-- =====================================================

-- Anyone can read reps (public API access)
CREATE POLICY "Public read access on reps" ON reps
  FOR SELECT
  USING (true);

-- Only authenticated users can insert
CREATE POLICY "Authenticated users can insert reps" ON reps
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Only authenticated users can update
CREATE POLICY "Authenticated users can update reps" ON reps
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Only authenticated users can delete
CREATE POLICY "Authenticated users can delete reps" ON reps
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- =====================================================
-- RLS POLICIES FOR: assignments
-- =====================================================

-- Anyone can read assignments (public API access)
CREATE POLICY "Public read access on assignments" ON assignments
  FOR SELECT
  USING (true);

-- Only authenticated users can insert
CREATE POLICY "Authenticated users can insert assignments" ON assignments
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Only authenticated users can update
CREATE POLICY "Authenticated users can update assignments" ON assignments
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Only authenticated users can delete
CREATE POLICY "Authenticated users can delete assignments" ON assignments
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- =====================================================
-- SAMPLE DATA (Optional - Remove in production)
-- =====================================================

-- Uncomment to insert sample reps for testing:
/*
INSERT INTO reps (first_name, last_name, email, phone, agency, channel) VALUES
  ('John', 'Smith', 'john.smith@example.com', '555-0101', NULL, 'Golf'),
  ('Mary', 'Watson', 'mary.watson@example.com', '555-0102', 'Schauben and Co.', 'Promo'),
  ('Bob', 'Wilson', 'bob.wilson@example.com', '555-0103', 'ABC Agency', 'Gift'),
  ('Alice', 'Brown', 'alice.brown@example.com', '555-0104', NULL, 'Golf'),
  ('Charlie', 'Davis', 'charlie.davis@example.com', '555-0105', 'Schauben and Co.', 'Promo');

-- Sample assignments
INSERT INTO assignments (zip_code, channel, rep_id) 
SELECT '12345', 'Golf', id FROM reps WHERE email = 'john.smith@example.com';

INSERT INTO assignments (zip_code, channel, rep_id) 
SELECT '12345', 'Promo', id FROM reps WHERE email = 'mary.watson@example.com';

INSERT INTO assignments (zip_code, channel, rep_id) 
SELECT '12345', 'Gift', id FROM reps WHERE email = 'bob.wilson@example.com';

INSERT INTO assignments (zip_code, channel, rep_id) 
SELECT '90210', 'Golf', id FROM reps WHERE email = 'alice.brown@example.com';
*/

-- =====================================================
-- MIGRATION: If you already have a "name" column
-- Run this to migrate from old schema to new schema
-- =====================================================
/*
-- Add new columns
ALTER TABLE reps ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE reps ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE reps ADD COLUMN IF NOT EXISTS agency TEXT;

-- Migrate data: split existing "name" into first_name/last_name
UPDATE reps 
SET 
  first_name = split_part(name, ' ', 1),
  last_name = CASE 
    WHEN position(' ' in name) > 0 
    THEN substring(name from position(' ' in name) + 1)
    ELSE ''
  END
WHERE first_name IS NULL;

-- Make columns NOT NULL after migration
ALTER TABLE reps ALTER COLUMN first_name SET NOT NULL;
ALTER TABLE reps ALTER COLUMN last_name SET NOT NULL;

-- Drop old name column (after verifying migration)
-- ALTER TABLE reps DROP COLUMN IF EXISTS name;
*/

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check tables were created:
-- SELECT * FROM reps;
-- SELECT * FROM assignments;

-- Check RLS is enabled:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Check policies:
-- SELECT * FROM pg_policies WHERE schemaname = 'public';

-- =====================================================
-- END OF SETUP
-- =====================================================
