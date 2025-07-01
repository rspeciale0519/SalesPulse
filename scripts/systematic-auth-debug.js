/**
 * Systematic authentication debugging - trace every step
 * Run with: node scripts/systematic-auth-debug.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Create both service role and anon key clients to test different scenarios
const serviceSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const anonSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function systematicAuthDebug() {
  console.log('🔍 SYSTEMATIC AUTHENTICATION DEBUGGING\n')
  console.log('=' .repeat(60))

  try {
    // Step 1: Check recent users and their status
    console.log('\n1. CHECKING RECENT USER ACCOUNTS')
    console.log('-'.repeat(40))
    
    const { data: { users }, error: listError } = await serviceSupabase.auth.admin.listUsers()
    
    if (listError) {
      console.error('❌ Failed to list users:', listError.message)
      return
    }

    // Get users from last 2 hours
    const recentUsers = users
      .filter(user => {
        const createdAt = new Date(user.created_at)
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
        return createdAt > twoHoursAgo
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

    console.log(`Found ${recentUsers.length} users created in the last 2 hours:`)
    
    recentUsers.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.email}`)
      console.log(`   ID: ${user.id}`)
      console.log(`   Created: ${user.created_at}`)
      console.log(`   Email confirmed: ${user.email_confirmed_at ? 'YES' : 'NO'}`)
      console.log(`   Last sign in: ${user.last_sign_in_at || 'Never'}`)
      console.log(`   Metadata: ${JSON.stringify(user.user_metadata, null, 2)}`)
    })

    if (recentUsers.length === 0) {
      console.log('⚠️  No recent users found. Please create a test account first.')
      return
    }

    // Step 2: Check database profiles for recent users
    console.log('\n\n2. CHECKING DATABASE PROFILES')
    console.log('-'.repeat(40))
    
    for (const user of recentUsers) {
      console.log(`\nChecking profile for ${user.email}:`)
      
      const { data: profile, error: profileError } = await serviceSupabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError && profileError.code === 'PGRST116') {
        console.log('❌ No profile found in database')
        
        // Try to create profile for this user
        console.log('   Attempting to create profile...')
        const { data: org, error: orgError } = await serviceSupabase
          .from('organizations')
          .upsert({
            name: 'Personal Organization',
            created_at: new Date().toISOString()
          }, { onConflict: 'name' })
          .select()
          .single()

        if (!orgError && org) {
          const { error: userCreateError } = await serviceSupabase
            .from('users')
            .insert({
              id: user.id,
              org_id: org.id,
              role: 'admin',
              email: user.email,
              password_hash: '',
              name: user.user_metadata?.full_name || user.email,
              created_at: new Date().toISOString()
            })

          if (userCreateError) {
            console.log('   ❌ Failed to create profile:', userCreateError.message)
          } else {
            console.log('   ✅ Profile created successfully')
          }
        }
      } else if (profileError) {
        console.log('❌ Error accessing profile:', profileError.message)
      } else {
        console.log('✅ Profile exists:')
        console.log(`   Name: ${profile.name}`)
        console.log(`   Role: ${profile.role}`)
        console.log(`   Org ID: ${profile.org_id}`)
      }
    }

    // Step 3: Test sign-in process with anon client (like browser would)
    console.log('\n\n3. TESTING SIGN-IN PROCESS')
    console.log('-'.repeat(40))
    
    const testUser = recentUsers[0] // Use most recent user
    console.log(`Testing sign-in for: ${testUser.email}`)
    console.log('⚠️  Note: This will fail without the actual password')
    
    // We can't test actual sign-in without password, but we can test session handling
    console.log('\n4. TESTING SESSION HANDLING')
    console.log('-'.repeat(40))
    
    // Check if we can get session (should be null for server-side)
    const { data: { session }, error: sessionError } = await anonSupabase.auth.getSession()
    
    if (sessionError) {
      console.log('❌ Session check failed:', sessionError.message)
    } else {
      console.log(`Session status: ${session ? 'Active' : 'None'}`)
    }

    // Step 5: Test middleware logic simulation
    console.log('\n\n5. SIMULATING MIDDLEWARE LOGIC')
    console.log('-'.repeat(40))
    
    console.log('Middleware checks:')
    console.log('1. Protected routes: /dashboard, /admin, etc.')
    console.log('2. Session existence: Required for access')
    console.log('3. Redirect logic: No session → redirect to /')
    
    // Step 6: Check for potential issues
    console.log('\n\n6. POTENTIAL ISSUES ANALYSIS')
    console.log('-'.repeat(40))
    
    console.log('Checking for common authentication issues:')
    
    // Check environment variables
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY'
    ]
    
    console.log('\nEnvironment variables:')
    requiredEnvVars.forEach(envVar => {
      const value = process.env[envVar]
      console.log(`   ${envVar}: ${value ? 'Present' : 'MISSING'}`)
      if (value && envVar.includes('URL')) {
        console.log(`     Value: ${value}`)
      }
    })

    // Check for RLS policies
    console.log('\nRLS Policy Check:')
    const { data: rlsTest, error: rlsError } = await anonSupabase
      .from('users')
      .select('id')
      .limit(1)

    if (rlsError) {
      console.log('❌ RLS may be blocking anonymous access:', rlsError.message)
    } else {
      console.log('✅ RLS allows anonymous read access')
    }

    console.log('\n\n7. DEBUGGING RECOMMENDATIONS')
    console.log('-'.repeat(40))
    console.log('Based on the analysis, try these steps:')
    console.log('1. Check browser developer tools for session cookies')
    console.log('2. Verify the sign-in form is calling the correct action')
    console.log('3. Add logging to the sign-in action to trace execution')
    console.log('4. Check if cookies are being set with correct domain/path')
    console.log('5. Verify middleware is reading cookies correctly')

  } catch (error) {
    console.error('❌ Systematic debug failed:', error.message)
    console.error('Stack trace:', error.stack)
  }
}

systematicAuthDebug()
