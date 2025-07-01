/**
 * Debug script to check signup and email delivery issues
 * Run with: node scripts/debug-signup.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function debugSignupIssues() {
  console.log('🔍 Debugging Signup and Email Issues...\n')

  try {
    // Check recent users and their email confirmation status
    console.log('1. Checking recent user accounts...')
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
      console.error('❌ Failed to list users:', listError.message)
      return
    }

    // Filter users from the last hour
    const recentUsers = users
      .filter(user => {
        const createdAt = new Date(user.created_at)
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
        return createdAt > oneHourAgo
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

    console.log(`Found ${recentUsers.length} users created in the last hour:`)
    
    if (recentUsers.length === 0) {
      console.log('⚠️  No recent signups found. This suggests the signup process may not be creating users.')
    } else {
      recentUsers.forEach((user, index) => {
        console.log(`\n${index + 1}. User: ${user.email}`)
        console.log(`   - ID: ${user.id}`)
        console.log(`   - Created: ${user.created_at}`)
        console.log(`   - Email confirmed: ${user.email_confirmed_at ? 'YES' : 'NO'}`)
        console.log(`   - Last sign in: ${user.last_sign_in_at || 'Never'}`)
        console.log(`   - Confirmation sent: ${user.confirmation_sent_at || 'Unknown'}`)
      })
    }

    // Check Supabase project settings
    console.log('\n2. Checking Supabase configuration...')
    
    // Test email delivery by attempting to resend confirmation for the most recent user
    if (recentUsers.length > 0) {
      const latestUser = recentUsers[0]
      if (!latestUser.email_confirmed_at) {
        console.log(`\n3. Attempting to resend confirmation email for ${latestUser.email}...`)
        
        const { error: resendError } = await supabase.auth.admin.generateLink({
          type: 'signup',
          email: latestUser.email,
          options: {
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback?type=signup`
          }
        })

        if (resendError) {
          console.error('❌ Failed to generate confirmation link:', resendError.message)
        } else {
          console.log('✅ Confirmation link generated successfully')
          console.log('   Check if this indicates email delivery issues vs. generation issues')
        }
      }
    }

    // Check if users table entries exist for recent signups
    console.log('\n4. Checking user profiles in database...')
    if (recentUsers.length > 0) {
      for (const user of recentUsers.slice(0, 3)) {
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileError && profileError.code === 'PGRST116') {
          console.log(`⚠️  No profile found for ${user.email} - this may cause login issues`)
        } else if (profileError) {
          console.log(`❌ Error checking profile for ${user.email}:`, profileError.message)
        } else {
          console.log(`✅ Profile exists for ${user.email}`)
        }
      }
    }

    console.log('\n📋 Diagnosis Summary:')
    console.log('- If no recent users found: Signup process is not creating accounts')
    console.log('- If users exist but no email_confirmed_at: Email delivery issue')
    console.log('- If users exist but no profiles: Database profile creation issue')
    console.log('- Check spam folder and email provider settings')

  } catch (error) {
    console.error('❌ Debug script failed:', error.message)
  }
}

debugSignupIssues()
