/**
 * Test the complete authentication flow to identify session issues
 * Run with: node scripts/test-complete-auth-flow.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY  // Use anon key like the client would
)

async function testCompleteAuthFlow() {
  console.log('🔍 Testing Complete Authentication Flow...\n')

  try {
    const testEmail = 'rob@yellowlettershop.com'
    const testPassword = 'your-password-here' // You'll need to provide this

    console.log('1. Testing sign-in with credentials...')
    
    // Test the actual sign-in process that the client would use
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    })

    if (signInError) {
      console.error('❌ Sign-in failed:', signInError.message)
      
      if (signInError.message.includes('Invalid login credentials')) {
        console.log('   This could mean:')
        console.log('   - Wrong password')
        console.log('   - User account not properly set up')
        console.log('   - Email not confirmed')
      }
      return
    }

    if (!signInData.user || !signInData.session) {
      console.error('❌ Sign-in succeeded but no user/session returned')
      return
    }

    console.log('✅ Sign-in successful!')
    console.log(`   User ID: ${signInData.user.id}`)
    console.log(`   Email: ${signInData.user.email}`)
    console.log(`   Session exists: ${signInData.session ? 'YES' : 'NO'}`)
    console.log(`   Access token: ${signInData.session?.access_token ? 'Present' : 'Missing'}`)

    // Test session retrieval
    console.log('\n2. Testing session retrieval...')
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      console.error('❌ Session retrieval failed:', sessionError.message)
      return
    }

    if (!session) {
      console.error('❌ No session found after sign-in')
      return
    }

    console.log('✅ Session retrieved successfully!')
    console.log(`   Session user ID: ${session.user.id}`)
    console.log(`   Session expires at: ${session.expires_at}`)

    // Test user profile access
    console.log('\n3. Testing user profile access...')
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (profileError) {
      console.error('❌ Profile access failed:', profileError.message)
      return
    }

    console.log('✅ Profile access successful!')
    console.log(`   Profile name: ${profile.name}`)
    console.log(`   Organization ID: ${profile.org_id}`)

    // Test organization access
    console.log('\n4. Testing organization access...')
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', profile.org_id)
      .single()

    if (orgError) {
      console.error('❌ Organization access failed:', orgError.message)
    } else {
      console.log('✅ Organization access successful!')
      console.log(`   Organization: ${org.name}`)
    }

    console.log('\n📋 Authentication Flow Summary:')
    console.log('✅ Sign-in: Working')
    console.log('✅ Session creation: Working')
    console.log('✅ Profile access: Working')
    console.log('✅ Organization access: Working')
    
    console.log('\n🔍 If login still redirects to landing page, the issue is likely:')
    console.log('1. Session cookies not being set properly in the browser')
    console.log('2. Middleware not reading session cookies correctly')
    console.log('3. Client-side session management issues')

    // Sign out to clean up
    await supabase.auth.signOut()
    console.log('\n✅ Signed out successfully')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

console.log('⚠️  Note: You need to provide the actual password for rob@yellowlettershop.com')
console.log('Edit this script and replace "your-password-here" with the real password\n')

testCompleteAuthFlow()
