-- Create the initialize_user_profile RPC function
-- This function creates a user profile and organization during signup

-- First, drop the existing function if it exists
DROP FUNCTION IF EXISTS public.initialize_user_profile(uuid, text, text, text);

-- Now create the function with the correct return type
CREATE OR REPLACE FUNCTION public.initialize_user_profile(
  user_id uuid,
  user_email text,
  name text,
  organization_name text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  org_id uuid;
  result json;
BEGIN
  -- Create organization first (or get existing one)
  INSERT INTO organizations (name, created_at, updated_at)
  VALUES (organization_name, NOW(), NOW())
  ON CONFLICT (name) DO UPDATE SET updated_at = NOW()
  RETURNING id INTO org_id;
  
  -- If no org_id was returned (conflict case), get the existing one
  IF org_id IS NULL THEN
    SELECT id INTO org_id FROM organizations WHERE name = organization_name LIMIT 1;
  END IF;
  
  -- Create user profile
  INSERT INTO users (
    id,
    org_id,
    role,
    email,
    password_hash,
    name,
    created_at,
    updated_at
  )
  VALUES (
    user_id,
    org_id,
    'admin',
    user_email,
    '', -- Empty password hash since auth is handled by Supabase Auth
    name,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    org_id = EXCLUDED.org_id,
    updated_at = NOW();
  
  -- Return success result
  result := json_build_object(
    'success', true, 
    'user_id', user_id,
    'org_id', org_id,
    'message', 'User profile initialized successfully'
  );
  
  RETURN result;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Return error result
    result := json_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'Failed to initialize user profile'
    );
    RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.initialize_user_profile(uuid, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.initialize_user_profile(uuid, text, text, text) TO service_role;
