/**
 * Check the actual table structure using PostgreSQL system tables
 * Run with: node scripts/check-table-structure.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkTableStructure() {
  console.log('🔍 Checking Table Structure...\n')

  try {
    // Use PostgreSQL system tables to get column info
    console.log('1. Checking users table structure...')
    const { data: userColumns, error: userError } = await supabase
      .rpc('sql', {
        query: `
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'users'
          ORDER BY ordinal_position;
        `
      })

    if (userError) {
      console.log('Trying alternative approach...')
      
      // Try a simple SELECT to see what columns exist
      const { data: sampleUser, error: selectError } = await supabase
        .from('users')
        .select('*')
        .limit(1)
        .single()

      if (selectError && selectError.code === 'PGRST116') {
        console.log('No users in table, but we can check the structure by attempting an insert')
        
        // Try to get column info by attempting a describe-like query
        const { error: describeError } = await supabase
          .from('users')
          .select('id, org_id, role, email, password_hash, name, created_at, last_login')
          .limit(0)

        if (describeError) {
          console.log('Available columns based on error:', describeError.message)
        } else {
          console.log('✅ Users table has columns: id, org_id, role, email, password_hash, name, created_at, last_login')
        }
      } else if (sampleUser) {
        console.log('✅ Users table columns from sample data:')
        Object.keys(sampleUser).forEach(col => {
          console.log(`  - ${col}: ${typeof sampleUser[col]}`)
        })
      }
    } else {
      console.log('Users table columns:')
      userColumns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type}`)
      })
    }

    // Check what the initialize_user_profile function expects
    console.log('\n2. Checking initialize_user_profile function...')
    const { data: functionInfo, error: funcError } = await supabase
      .rpc('sql', {
        query: `
          SELECT routine_name, parameter_name, data_type, parameter_mode
          FROM information_schema.parameters 
          WHERE specific_schema = 'public' 
          AND routine_name = 'initialize_user_profile'
          ORDER BY ordinal_position;
        `
      })

    if (funcError) {
      console.log('Cannot get function parameters, but we know it expects: user_id, user_email, full_name, organization_name')
    } else {
      console.log('Function parameters:')
      functionInfo.forEach(param => {
        console.log(`  - ${param.parameter_name}: ${param.data_type}`)
      })
    }

    console.log('\n3. The Issue:')
    console.log('   - Function expects "full_name" parameter')
    console.log('   - But users table likely has "name" column')
    console.log('   - This mismatch causes the profile creation to fail')

  } catch (error) {
    console.error('❌ Table structure check failed:', error.message)
  }
}

checkTableStructure()
