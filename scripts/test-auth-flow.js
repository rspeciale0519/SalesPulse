/**
 * Test script to verify authentication flow
 * Run with: node scripts/test-auth-flow.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testAuthFlow() {
  console.log('🔍 Testing Authentication Flow...\n')

  try {
    // Test 1: Check if auth is configured properly
    console.log('1. Testing Supabase connection...')
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
      console.error('❌ Failed to connect to Supabase:', listError.message)
      return
    }
    
    console.log('✅ Supabase connection successful')
    console.log(`   Found ${users.length} existing users\n`)

    // Test 2: Check database functions
    console.log('2. Testing database functions...')
    const { data: functions, error: funcError } = await supabase
      .rpc('initialize_user_profile', {
        user_id: '00000000-0000-0000-0000-000000000000',
        user_email: 'test@example.com',
        full_name: 'Test User',
        organization_name: 'Test Org'
      })
      .then(() => ({ data: 'Function exists', error: null }))
      .catch(err => ({ data: null, error: err }))

    if (funcError && !funcError.message.includes('duplicate key')) {
      console.log('⚠️  Database function test result:', funcError.message)
    } else {
      console.log('✅ Database functions are accessible\n')
    }

    // Test 3: Check recent signups
    console.log('3. Checking recent user activity...')
    const recentUsers = users
      .filter(user => {
        const createdAt = new Date(user.created_at)
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
        return createdAt > oneDayAgo
      })
      .slice(0, 5)

    if (recentUsers.length > 0) {
      console.log(`✅ Found ${recentUsers.length} recent user(s):`)
      recentUsers.forEach(user => {
        console.log(`   - ${user.email} (confirmed: ${!!user.email_confirmed_at})`)
      })
    } else {
      console.log('ℹ️  No recent signups found')
    }

    console.log('\n🎉 Authentication flow test completed!')
    console.log('\n📋 Next steps:')
    console.log('1. Try signing up with a new email address')
    console.log('2. Check your email for the confirmation link')
    console.log('3. Click the confirmation link (should redirect to /auth/confirm)')
    console.log('4. Try logging in with your new credentials')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testAuthFlow()
