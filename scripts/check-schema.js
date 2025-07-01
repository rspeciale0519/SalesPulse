/**
 * Check the actual database schema for users table
 * Run with: node scripts/check-schema.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkSchema() {
  console.log('🔍 Checking Database Schema...\n')

  try {
    // Check users table schema
    console.log('1. Checking users table columns...')
    const { data: columns, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'users')
      .eq('table_schema', 'public')
      .order('ordinal_position')

    if (error) {
      console.error('❌ Failed to get schema:', error.message)
      return
    }

    console.log('Users table columns:')
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`)
    })

    // Check if full_name column exists
    const hasFullName = columns.some(col => col.column_name === 'full_name')
    const hasName = columns.some(col => col.column_name === 'name')
    
    console.log(`\n2. Column analysis:`)
    console.log(`   - Has 'full_name' column: ${hasFullName ? 'YES' : 'NO'}`)
    console.log(`   - Has 'name' column: ${hasName ? 'YES' : 'NO'}`)

    if (!hasFullName && hasName) {
      console.log('\n⚠️  SCHEMA MISMATCH DETECTED!')
      console.log('   The initialize_user_profile function expects "full_name" but table has "name"')
      console.log('   This explains why profile creation is failing.')
    }

    // Check organizations table too
    console.log('\n3. Checking organizations table columns...')
    const { data: orgColumns, error: orgError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'organizations')
      .eq('table_schema', 'public')
      .order('ordinal_position')

    if (orgError) {
      console.error('❌ Failed to get organizations schema:', orgError.message)
    } else {
      console.log('Organizations table columns:')
      orgColumns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type}`)
      })
    }

  } catch (error) {
    console.error('❌ Schema check failed:', error.message)
  }
}

checkSchema()
