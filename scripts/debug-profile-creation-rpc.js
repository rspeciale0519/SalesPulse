/**
 * Debug the profile creation RPC function directly
 * Run with: node scripts/debug-profile-creation-rpc.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const serviceSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function debugProfileCreationRPC() {
  console.log('🔍 DEBUGGING PROFILE CREATION RPC FUNCTION\n')
  console.log('=' .repeat(60))

  try {
    // First, let's check the current function definition
    console.log('\n1. CHECKING CURRENT RPC FUNCTION DEFINITION')
    console.log('-'.repeat(40))
    
    const { data: functions, error: funcError } = await serviceSupabase
      .from('pg_proc')
      .select('proname, prosrc')
      .eq('proname', 'initialize_user_profile')

    if (funcError) {
      console.error('❌ Error checking function:', funcError.message)
    } else if (functions && functions.length > 0) {
      console.log('✅ Function exists')
      console.log('Function source preview:', functions[0].prosrc.substring(0, 200) + '...')
    } else {
      console.log('❌ Function not found')
    }

    // Get a recent user to test with
    console.log('\n2. GETTING RECENT USER FOR TESTING')
    console.log('-'.repeat(40))
    
    const { data: { users }, error: listError } = await serviceSupabase.auth.admin.listUsers()
    
    if (listError) {
      console.error('❌ Failed to list users:', listError.message)
      return
    }

    const recentUser = users
      .filter(user => {
        const createdAt = new Date(user.created_at)
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
        return createdAt > oneHourAgo
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]

    if (!recentUser) {
      console.log('❌ No recent users found for testing')
      return
    }

    console.log(`✅ Testing with user: ${recentUser.email} (${recentUser.id})`)
    console.log(`   Created: ${recentUser.created_at}`)
    console.log(`   Metadata:`, JSON.stringify(recentUser.user_metadata, null, 2))

    // Check if profile already exists
    console.log('\n3. CHECKING EXISTING PROFILE')
    console.log('-'.repeat(40))
    
    const { data: existingProfile, error: profileError } = await serviceSupabase
      .from('users')
      .select('*')
      .eq('id', recentUser.id)
      .single()

    if (profileError && profileError.code === 'PGRST116') {
      console.log('✅ No existing profile found - good for testing')
    } else if (profileError) {
      console.error('❌ Error checking profile:', profileError.message)
      return
    } else {
      console.log('⚠️  Profile already exists:', existingProfile.name)
      console.log('   Deleting existing profile for clean test...')
      
      const { error: deleteError } = await serviceSupabase
        .from('users')
        .delete()
        .eq('id', recentUser.id)
      
      if (deleteError) {
        console.error('❌ Failed to delete existing profile:', deleteError.message)
        return
      }
      console.log('✅ Existing profile deleted')
    }

    // Test the RPC function call
    console.log('\n4. TESTING RPC FUNCTION CALL')
    console.log('-'.repeat(40))
    
    const testName = recentUser.user_metadata?.full_name || 
                    recentUser.user_metadata?.name || 
                    recentUser.email?.split('@')[0] || 
                    'Test User'
    const testOrgName = 'Test Organization'

    console.log('RPC Parameters:')
    console.log(`   user_id: ${recentUser.id}`)
    console.log(`   user_email: ${recentUser.email}`)
    console.log(`   name: ${testName}`)
    console.log(`   organization_name: ${testOrgName}`)

    const { data: rpcResult, error: rpcError } = await serviceSupabase.rpc('initialize_user_profile', {
      user_id: recentUser.id,
      user_email: recentUser.email,
      name: testName,
      organization_name: testOrgName
    })

    if (rpcError) {
      console.error('❌ RPC function failed:', rpcError.message)
      console.error('❌ Error details:', JSON.stringify(rpcError, null, 2))
      
      // Check common issues
      if (rpcError.message.includes('column') && rpcError.message.includes('does not exist')) {
        console.log('\n💡 DIAGNOSIS: Column name mismatch in function')
        console.log('   The function may still be using old column names')
      } else if (rpcError.message.includes('permission')) {
        console.log('\n💡 DIAGNOSIS: Permission issue')
        console.log('   RLS policies may be blocking the operation')
      } else if (rpcError.message.includes('duplicate')) {
        console.log('\n💡 DIAGNOSIS: Duplicate key issue')
        console.log('   User or organization may already exist')
      }
    } else {
      console.log('✅ RPC function succeeded!')
      console.log('   Result:', rpcResult)
    }

    // Verify the profile was created
    console.log('\n5. VERIFYING PROFILE CREATION')
    console.log('-'.repeat(40))
    
    const { data: newProfile, error: verifyError } = await serviceSupabase
      .from('users')
      .select('*')
      .eq('id', recentUser.id)
      .single()

    if (verifyError) {
      console.error('❌ Failed to verify profile creation:', verifyError.message)
    } else {
      console.log('✅ Profile created successfully:')
      console.log(`   Name: ${newProfile.name}`)
      console.log(`   Email: ${newProfile.email}`)
      console.log(`   Role: ${newProfile.role}`)
      console.log(`   Org ID: ${newProfile.org_id}`)
    }

    // Check organization
    if (newProfile?.org_id) {
      const { data: org, error: orgError } = await serviceSupabase
        .from('organizations')
        .select('*')
        .eq('id', newProfile.org_id)
        .single()

      if (orgError) {
        console.error('❌ Failed to verify organization:', orgError.message)
      } else {
        console.log('✅ Organization verified:')
        console.log(`   Name: ${org.name}`)
        console.log(`   ID: ${org.id}`)
      }
    }

  } catch (error) {
    console.error('❌ Debug script failed:', error.message)
    console.error('Stack trace:', error.stack)
  }
}

debugProfileCreationRPC()
