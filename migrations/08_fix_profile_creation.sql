-- Fix schema mismatch in initialize_user_profile function
-- The function was trying to insert into 'full_name' column but users table has 'name' column

-- Drop the existing function
DROP FUNCTION IF EXISTS public.initialize_user_profile(UUID, TEXT, TEXT, TEXT);

-- Recreate the function with correct column name
CREATE OR REPLACE FUNCTION public.initialize_user_profile(
  user_id UUID,
  user_email TEXT,
  full_name TEXT,
  organization_name TEXT
) RETURNS UUID AS $$
DECLARE
  org_id UUID;
BEGIN
  -- Create or get organization
  INSERT INTO organizations (name, created_at)
  VALUES (COALESCE(organization_name, 'Personal Organization'), NOW())
  ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO org_id;

  -- If no org_id was returned (shouldn't happen), get it
  IF org_id IS NULL THEN
    SELECT id INTO org_id FROM organizations WHERE name = COALESCE(organization_name, 'Personal Organization');
  END IF;

  -- Create user profile with correct column name 'name' instead of 'full_name'
  INSERT INTO users (
    id,
    org_id,
    role,
    email,
    password_hash,
    name,  -- Changed from full_name to name
    created_at
  ) VALUES (
    user_id,
    org_id,
    'admin',
    user_email,
    '', -- Empty password hash since auth is handled by Supabase Auth
    COALESCE(full_name, user_email),  -- Use full_name parameter but insert into name column
    NOW()
  );

  RETURN org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
