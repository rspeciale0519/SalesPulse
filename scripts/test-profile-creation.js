/**
 * Test script to debug user profile creation issues
 * Run with: node scripts/test-profile-creation.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testProfileCreation() {
  console.log('🔍 Testing User Profile Creation...\n')

  try {
    // Get the user that needs a profile
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
      console.error('❌ Failed to list users:', listError.message)
      return
    }

    const userWithoutProfile = users.find(user => user.email === 'rob@yellowlettershop.com')
    
    if (!userWithoutProfile) {
      console.log('❌ Test user not found')
      return
    }

    console.log('1. Found test user:', userWithoutProfile.email)
    console.log('   User ID:', userWithoutProfile.id)
    console.log('   User metadata:', JSON.stringify(userWithoutProfile.user_metadata, null, 2))

    // Test the initialize_user_profile function directly
    console.log('\n2. Testing initialize_user_profile function...')
    
    const { data: result, error: initError } = await supabase.rpc('initialize_user_profile', {
      user_id: userWithoutProfile.id,
      user_email: userWithoutProfile.email,
      full_name: userWithoutProfile.user_metadata?.full_name || 'Test User',
      organization_name: userWithoutProfile.user_metadata?.organization_name || 'Personal Organization'
    })

    if (initError) {
      console.error('❌ Profile creation failed:', initError)
      console.error('   Error details:', JSON.stringify(initError, null, 2))
      
      // Check if it's a permissions issue
      if (initError.message.includes('permission denied')) {
        console.log('\n🔍 This appears to be a permissions issue. Checking RLS policies...')
      }
      
      // Check if it's a duplicate key issue
      if (initError.message.includes('duplicate key')) {
        console.log('\n🔍 This appears to be a duplicate key issue. Checking existing records...')
        
        // Check if organization already exists
        const { data: existingOrg } = await supabase
          .from('organizations')
          .select('*')
          .eq('name', 'Personal Organization')
          .single()
          
        if (existingOrg) {
          console.log('   Found existing organization:', existingOrg.name)
        }
        
        // Check if user already exists
        const { data: existingUser } = await supabase
          .from('users')
          .select('*')
          .eq('id', userWithoutProfile.id)
          .single()
          
        if (existingUser) {
          console.log('   Found existing user profile:', existingUser.email)
        }
      }
    } else {
      console.log('✅ Profile creation successful!')
      console.log('   Organization ID returned:', result)
      
      // Verify the profile was created
      const { data: newProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', userWithoutProfile.id)
        .single()
        
      if (newProfile) {
        console.log('✅ User profile verified in database')
        console.log('   Profile:', JSON.stringify(newProfile, null, 2))
      }
    }

    // Test direct table access permissions
    console.log('\n3. Testing direct table access...')
    
    const { data: orgs, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .limit(1)
      
    if (orgError) {
      console.error('❌ Cannot access organizations table:', orgError.message)
    } else {
      console.log('✅ Can access organizations table')
    }
    
    const { data: usersTable, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1)
      
    if (usersError) {
      console.error('❌ Cannot access users table:', usersError.message)
    } else {
      console.log('✅ Can access users table')
    }

  } catch (error) {
    console.error('❌ Test script failed:', error.message)
  }
}

testProfileCreation()
