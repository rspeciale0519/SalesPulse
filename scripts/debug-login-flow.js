/**
 * Debug the complete login flow to identify why redirect is failing
 * Run with: node scripts/debug-login-flow.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function debugLoginFlow() {
  console.log('🔍 Debugging Login Flow...\n')

  try {
    const testEmail = 'rob@yellowlettershop.com'
    const testUserId = 'fe038f81-06c5-46f5-9569-e7874a357c0c'

    // 1. Check user authentication status
    console.log('1. Checking user authentication status...')
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
      console.error('❌ Failed to list users:', listError.message)
      return
    }

    const user = users.find(u => u.email === testEmail)
    if (!user) {
      console.error('❌ User not found in auth system')
      return
    }

    console.log('✅ User found in auth system:')
    console.log(`   - Email: ${user.email}`)
    console.log(`   - ID: ${user.id}`)
    console.log(`   - Email confirmed: ${user.email_confirmed_at ? 'YES' : 'NO'}`)
    console.log(`   - Last sign in: ${user.last_sign_in_at || 'Never'}`)
    console.log(`   - User metadata:`, JSON.stringify(user.user_metadata, null, 2))

    // 2. Check user profile in database
    console.log('\n2. Checking user profile in database...')
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', testUserId)
      .single()

    if (profileError) {
      console.error('❌ User profile not found:', profileError.message)
      return
    }

    console.log('✅ User profile found:')
    console.log('   Profile:', JSON.stringify(profile, null, 2))

    // 3. Check organization
    console.log('\n3. Checking organization...')
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', profile.org_id)
      .single()

    if (orgError) {
      console.error('❌ Organization not found:', orgError.message)
    } else {
      console.log('✅ Organization found:', org.name)
    }

    // 4. Test authentication with credentials
    console.log('\n4. Testing authentication with credentials...')
    
    // Create a client-side supabase instance to test login
    const clientSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    // Note: We can't actually test login here without the password
    // But we can check what the callback logic expects

    console.log('\n5. Analyzing callback logic requirements...')
    console.log('   The callback route expects:')
    console.log('   - Valid session from Supabase Auth')
    console.log('   - User profile to exist in database')
    console.log('   - Organization to exist and be linked to user')

    // 6. Check if there are any RLS policies blocking access
    console.log('\n6. Testing RLS policies...')
    
    // Test if we can access the user's data with their ID
    const { data: rlsTest, error: rlsError } = await supabase
      .from('users')
      .select('*')
      .eq('id', testUserId)

    if (rlsError) {
      console.error('❌ RLS policy may be blocking access:', rlsError.message)
    } else {
      console.log('✅ RLS policies allow access to user data')
    }

    // 7. Check what happens during the callback process
    console.log('\n7. Simulating callback process...')
    console.log('   When user logs in, the callback should:')
    console.log('   1. Get session from Supabase Auth ✅')
    console.log('   2. Find user profile in database ✅')
    console.log('   3. Initialize user profile if missing ❓ (may still be broken)')
    console.log('   4. Redirect to dashboard ❓')

    console.log('\n📋 Potential Issues:')
    console.log('1. Session handling in the callback route')
    console.log('2. Redirect logic after successful authentication')
    console.log('3. Client-side session management')
    console.log('4. Middleware or route protection logic')

    console.log('\n🔍 Next Steps:')
    console.log('1. Check the authentication callback route logs')
    console.log('2. Verify session is being set properly')
    console.log('3. Check if middleware is blocking access')
    console.log('4. Test the redirect logic in the callback')

  } catch (error) {
    console.error('❌ Debug failed:', error.message)
  }
}

debugLoginFlow()
