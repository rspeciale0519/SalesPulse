/**
 * Quick test of the initialize_user_profile RPC function
 * Run with: node scripts/quick-rpc-test.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const serviceSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function quickRPCTest() {
  console.log('🔍 Quick RPC Function Test\n')

  try {
    // Get the most recent user
    const { data: { users }, error: listError } = await serviceSupabase.auth.admin.listUsers()
    
    if (listError) {
      console.error('❌ Failed to list users:', listError.message)
      return
    }

    const recentUser = users
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]

    if (!recentUser) {
      console.log('❌ No users found')
      return
    }

    console.log(`Testing with: ${recentUser.email}`)
    console.log(`User ID: ${recentUser.id}`)

    // Test the RPC call with the exact same parameters as the callback
    const testName = recentUser.user_metadata?.full_name || 
                    recentUser.user_metadata?.name || 
                    recentUser.email?.split('@')[0] || 
                    'Test User'

    console.log(`\nCalling RPC with name: "${testName}"`)

    const { data, error } = await serviceSupabase.rpc('initialize_user_profile', {
      user_id: recentUser.id,
      user_email: recentUser.email,
      name: testName,
      organization_name: 'Test Organization'
    })

    if (error) {
      console.error('❌ RPC Error:', error.message)
      console.error('❌ Full error:', JSON.stringify(error, null, 2))
    } else {
      console.log('✅ RPC Success:', data)
    }

  } catch (error) {
    console.error('❌ Script error:', error.message)
  }
}

quickRPCTest()
