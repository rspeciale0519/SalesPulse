-- SalesPulse JWT Claims Setup for Supabase Auth
-- This script configures user profile handling and RLS support

-- Create helper functions for RLS policies
CREATE OR REPLACE FUNCTION public.get_current_user_id() 
RETURNS UUID AS $$
  DECLARE
    claims jsonb;
  BEGIN
    claims := current_setting('request.jwt.claims', true)::jsonb;
    
    IF claims IS NULL OR claims ->> 'sub' IS NULL THEN
      RETURN NULL;
    END IF;
    
    RETURN (claims ->> 'sub')::UUID;
  END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to retrieve current user's org_id from database
CREATE OR REPLACE FUNCTION public.get_current_user_org_id() 
RETURNS UUID AS $$
  DECLARE
    user_id UUID;
    user_org_id UUID;
  BEGIN
    user_id := public.get_current_user_id();
    
    IF user_id IS NULL THEN
      RETURN NULL;
    END IF;
    
    SELECT org_id INTO user_org_id FROM public.users WHERE id = user_id;
    RETURN user_org_id;
  END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
    
-- Helper function to retrieve current user's role from database
CREATE OR REPLACE FUNCTION public.get_current_user_role() 
RETURNS TEXT AS $$
  DECLARE
    user_id UUID;
    user_role TEXT;
  BEGIN
    user_id := public.get_current_user_id();
    
    IF user_id IS NULL THEN
      RETURN NULL;
    END IF;
    
    SELECT role INTO user_role FROM public.users WHERE id = user_id;
    RETURN user_role;
  END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function for common role check
CREATE OR REPLACE FUNCTION public.is_admin_or_manager() 
RETURNS BOOLEAN AS $$
  DECLARE
    user_role TEXT;
  BEGIN
    user_role := public.get_current_user_role();
    RETURN user_role IN ('admin', 'manager', 'Admin', 'Manager');
  END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- We'll use a function that runs on sign-up to initialize user profile
-- This should be called from the client side after signup
CREATE OR REPLACE FUNCTION public.initialize_user_profile(user_id UUID, user_email TEXT, full_name TEXT, organization_name TEXT) 
RETURNS UUID AS $$
DECLARE
  org_id uuid;
BEGIN  
  -- Use provided org name or default
  IF organization_name IS NULL OR organization_name = '' THEN
    organization_name := 'Personal Organization';
  END IF;
  
  -- Create a new organization
  INSERT INTO public.organizations (name)
  VALUES (organization_name)
  RETURNING id INTO org_id;
  
  -- Create user record in public schema
  INSERT INTO public.users (
    id, 
    email, 
    full_name,
    role,
    org_id,
    created_at,
    updated_at
  ) VALUES (
    user_id,
    user_email,
    COALESCE(full_name, user_email),
    'Admin', -- Default new users to Admin for their own org
    org_id,
    NOW(),
    NOW()
  );
  
  RETURN org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user email
CREATE OR REPLACE FUNCTION public.update_user_email(user_id UUID, new_email TEXT) 
RETURNS VOID AS $$
BEGIN
  UPDATE public.users
  SET email = new_email,
      updated_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function for current auth user - useful for RLS
CREATE OR REPLACE FUNCTION public.get_auth_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN auth.uid();
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- This version should work with Supabase's built-in auth.uid()
CREATE OR REPLACE FUNCTION public.get_auth_user_org_id()
RETURNS UUID AS $$
DECLARE
  user_org_id UUID;
BEGIN
  SELECT org_id INTO user_org_id FROM public.users WHERE id = auth.uid();
  RETURN user_org_id;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- For role checks
CREATE OR REPLACE FUNCTION public.get_auth_user_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role FROM public.users WHERE id = auth.uid();
  RETURN user_role;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.initialize_user_profile IS 'Creates organization and user records after sign-up';
COMMENT ON FUNCTION public.update_user_email IS 'Updates user email in public.users table';
COMMENT ON FUNCTION public.get_auth_user_id IS 'Gets current authenticated user ID';
COMMENT ON FUNCTION public.get_auth_user_org_id IS 'Gets current authenticated user organization ID';
COMMENT ON FUNCTION public.get_auth_user_role IS 'Gets current authenticated user role';
