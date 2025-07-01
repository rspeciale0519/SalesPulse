/**
 * Apply the profile creation fix directly to the database
 * Run with: node scripts/apply-profile-fix.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function applyProfileFix() {
  console.log('🔧 Applying Profile Creation Fix...\n')

  try {
    // Drop the existing function
    console.log('1. Dropping existing function...')
    const { error: dropError } = await supabase.rpc('sql', {
      query: 'DROP FUNCTION IF EXISTS public.initialize_user_profile(UUID, TEXT, TEXT, TEXT);'
    })

    if (dropError) {
      console.error('❌ Failed to drop function:', dropError.message)
      return
    }
    console.log('✅ Function dropped successfully')

    // Create the corrected function
    console.log('\n2. Creating corrected function...')
    const createFunctionSQL = `
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

        -- If no org_id was returned, get it
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
          name,
          created_at
        ) VALUES (
          user_id,
          org_id,
          'admin',
          user_email,
          '',
          COALESCE(full_name, user_email),
          NOW()
        );

        RETURN org_id;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `

    const { error: createError } = await supabase.rpc('sql', {
      query: createFunctionSQL
    })

    if (createError) {
      console.error('❌ Failed to create function:', createError.message)
      return
    }
    console.log('✅ Function created successfully')

    // Test the fixed function
    console.log('\n3. Testing the fixed function...')
    const testUserId = 'fe038f81-06c5-46f5-9569-e7874a357c0c' // The user from our debug
    const testEmail = 'rob@yellowlettershop.com'
    const testName = 'John Doe'

    const { data: result, error: testError } = await supabase.rpc('initialize_user_profile', {
      user_id: testUserId,
      user_email: testEmail,
      full_name: testName,
      organization_name: 'Personal Organization'
    })

    if (testError) {
      console.error('❌ Function test failed:', testError.message)
    } else {
      console.log('✅ Function test successful!')
      console.log('   Organization ID returned:', result)

      // Verify the profile was created
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', testUserId)
        .single()

      if (profileError) {
        console.error('❌ Profile verification failed:', profileError.message)
      } else {
        console.log('✅ User profile created successfully!')
        console.log('   Profile data:', JSON.stringify(profile, null, 2))
      }
    }

  } catch (error) {
    console.error('❌ Fix application failed:', error.message)
  }
}

applyProfileFix()
