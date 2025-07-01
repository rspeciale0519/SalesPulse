/**
 * Create the initialize_user_profile RPC function in Supabase
 * Run with: node scripts/create-rpc-function.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const serviceSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function createRPCFunction() {
  console.log('🔧 Creating initialize_user_profile RPC function...\n')

  try {
    // First, drop the function if it exists
    console.log('1. Dropping existing function (if any)...')
    const dropSQL = `
      DROP FUNCTION IF EXISTS public.initialize_user_profile(uuid, text, text, text);
    `
    
    const { error: dropError } = await serviceSupabase.rpc('exec_sql', { 
      sql: dropSQL 
    })
    
    if (dropError) {
      console.log('Note: Could not drop function (may not exist):', dropError.message)
    } else {
      console.log('✅ Existing function dropped')
    }

    // Create the function with correct schema
    console.log('\n2. Creating new function...')
    const createSQL = `
      CREATE OR REPLACE FUNCTION public.initialize_user_profile(
        user_id uuid,
        user_email text,
        name text,
        organization_name text
      )
      RETURNS void
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      DECLARE
        org_id uuid;
      BEGIN
        -- Create or get organization
        INSERT INTO organizations (name, created_at)
        VALUES (organization_name, NOW())
        ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
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
          created_at
        )
        VALUES (
          user_id,
          org_id,
          'admin',
          user_email,
          '',
          name,
          NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          email = EXCLUDED.email,
          org_id = EXCLUDED.org_id;
      END;
      $$;
    `

    const { error: createError } = await serviceSupabase.rpc('exec_sql', { 
      sql: createSQL 
    })

    if (createError) {
      console.error('❌ Failed to create function:', createError.message)
      
      // Try alternative approach - direct SQL execution
      console.log('\n3. Trying direct SQL execution...')
      const { error: directError } = await serviceSupabase
        .from('pg_stat_statements')
        .select('*')
        .limit(0) // This will fail but might give us SQL execution capability
      
      console.log('Direct SQL not available, trying manual creation...')
      
      // Let's try creating it step by step
      const simpleFunctionSQL = `
        CREATE OR REPLACE FUNCTION initialize_user_profile(
          user_id uuid,
          user_email text,
          name text,
          organization_name text
        )
        RETURNS json
        LANGUAGE plpgsql
        AS $$
        DECLARE
          org_id uuid;
          result json;
        BEGIN
          -- Create organization first
          INSERT INTO organizations (name, created_at)
          VALUES (organization_name, NOW())
          ON CONFLICT (name) DO NOTHING
          RETURNING id INTO org_id;
          
          -- Get org_id if it already existed
          IF org_id IS NULL THEN
            SELECT id INTO org_id FROM organizations WHERE name = organization_name LIMIT 1;
          END IF;
          
          -- Create user profile
          INSERT INTO users (id, org_id, role, email, password_hash, name, created_at)
          VALUES (user_id, org_id, 'admin', user_email, '', name, NOW())
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            email = EXCLUDED.email,
            org_id = EXCLUDED.org_id;
          
          result := json_build_object('success', true, 'org_id', org_id);
          RETURN result;
        END;
        $$;
      `

      console.log('Creating simplified function...')
      // We'll need to apply this manually through Supabase dashboard
      console.log('\n📋 MANUAL STEPS REQUIRED:')
      console.log('1. Go to Supabase Dashboard > SQL Editor')
      console.log('2. Execute the following SQL:')
      console.log('\n' + '='.repeat(60))
      console.log(simpleFunctionSQL)
      console.log('='.repeat(60))
      
      return
    }

    console.log('✅ Function created successfully!')

    // Test the function
    console.log('\n3. Testing the function...')
    const { data: testResult, error: testError } = await serviceSupabase.rpc('initialize_user_profile', {
      user_id: '00000000-0000-0000-0000-000000000000',
      user_email: 'test@example.com',
      name: 'Test User',
      organization_name: 'Test Organization'
    })

    if (testError) {
      console.error('❌ Function test failed:', testError.message)
    } else {
      console.log('✅ Function test successful:', testResult)
    }

  } catch (error) {
    console.error('❌ Script failed:', error.message)
  }
}

createRPCFunction()
