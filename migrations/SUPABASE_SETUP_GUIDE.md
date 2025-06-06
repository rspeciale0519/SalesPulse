# SalesPulse Supabase Setup Guide

This guide will walk you through setting up your Supabase project for SalesPulse, including running the database migrations and configuring authentication properly.

## Prerequisites

- You have already created a Supabase project at `https://kcpfqhpfzdiadclxwget.supabase.co`
- You have the Supabase API keys added to your `.env.local` file (which they already are)

## Step 1: Run the Database Migrations

The migrations need to be executed in the correct order. Open the Supabase dashboard and navigate to the SQL Editor.

1. **Run Initial Setup (Core Tables)**
   - Open `01_initial_setup.sql` in a text editor
   - Copy the entire content
   - Paste it into a new SQL query in the Supabase SQL Editor
   - Execute the query
   - Verify there are no errors in the output

2. **Run Additional Core Tables**
   - Repeat the process with `02_additional_core_tables.sql`
   - Execute and verify

3. **Run Billing & Subscriptions**
   - Repeat the process with `03_billing_subscriptions.sql`
   - Execute and verify

4. **Run RLS Policies (3 parts)**
   - Execute `04_rls_policies.sql`, `05_more_rls_policies.sql`, and `06_final_rls_policies.sql` in order
   - The RLS policies rely on helper functions that will be created in step 5
   - You might encounter errors if you reference functions that don't exist yet
   - If needed, you can run step 5 first and then come back to this step

5. **Run Auth Helper Functions Setup**
   - Execute `07_jwt_claims_setup.sql`
   - This script creates helper functions for RLS policies to work with Supabase Auth

## Step 2: Configure Supabase Authentication

For the Row Level Security to work properly, you need to configure the Supabase Auth settings:

1. **Enable Email Authentication**:
   - Go to **Authentication → Providers**
   - Ensure Email provider is enabled
   - Configure the following settings:
     - Disable "Secure email change" (to simplify for Phase 1)
     - Enable "Confirm email" for new signups

2. **Configure Email Templates**:
   - Go to **Authentication → Email Templates**
   - Update the templates for:
     - Confirmation Email
     - Invite Email
     - Magic Link Email
     - Reset Password Email
   - Add SalesPulse branding to each template

3. **Add Site URL**:
   - Go to **Authentication → URL Configuration**
   - Set Site URL to: `http://localhost:3000` (for development)
   - Add redirect URLs:
     - `http://localhost:3000/auth/callback`
     - `http://localhost:3000/auth/reset-password`

## Step 3: Update the Auth Callback Handler

Since we're manually creating user profiles rather than using triggers (due to Supabase's permissions), we need to update the auth callback handler in your Next.js app. Open or create the file `app/auth/callback/route.ts`:

```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code)
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      // Check if user already has a profile
      const { data: existingProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
      
      // If no profile exists, create one
      if (!existingProfile) {
        const fullName = user.user_metadata?.full_name || ''
        const orgName = user.user_metadata?.organization_name || 'Personal Organization'
        
        // Call our initialize_user_profile function
        await supabase.rpc('initialize_user_profile', {
          user_id: user.id,
          user_email: user.email,
          full_name: fullName,
          organization_name: orgName
        })
      }
    }
  }

  // Redirect to the home page
  return NextResponse.redirect(requestUrl.origin)
}
```

## Step 4: Create Initial Admin User

You should create your first admin user to properly test the system:

1. **Register Through the App**:
   - Start your Next.js development server
   - Navigate to the sign-up page
   - Fill out the form with your email and password
   - Complete the registration process

2. **Verify User Creation**:
   - After signing up, check the Supabase dashboard
   - Confirm that:
     - A new record was created in the `auth.users` table
     - A corresponding record was created in the `public.users` table via our custom handler
     - A new organization was created in the `organizations` table
     - The user has the 'Admin' role

## Step 4: Insert Seed Data (Optional)

If you want to test the application with some initial data, you can add seed data:

```sql
-- Insert a sample SIM
INSERT INTO sims (name, description) 
VALUES ('Life Insurance SIM', 'Standard SIM for life insurance sales');

-- Associate SIM with your user
INSERT INTO user_sims (user_id, sim_id) 
VALUES 
('YOUR_USER_ID', (SELECT id FROM sims WHERE name = 'Life Insurance SIM'));

-- Insert a SIM template
INSERT INTO sim_templates (sim_id, template_name, template_data, is_default) 
VALUES (
  (SELECT id FROM sims WHERE name = 'Life Insurance SIM'),
  'Standard Template',
  '{
    "avgCommission": 1000,
    "callsToAppt": 10,
    "apptsToDeals": 4,
    "referralsPerDeal": 2
  }',
  true
);

-- Add feature flags
INSERT INTO feature_flags (key, scope, is_enabled) 
VALUES 
('enable_goals', 'global', true),
('enable_activities', 'global', true),
('enable_what_if', 'global', true),
('enable_messaging', 'global', true);
```

## Step 5: Test the Authentication Flow

Once you've completed the setup:

1. Start your Next.js development server:
   ```
   yarn dev
   ```

2. Try registering a new user through your application
3. Verify that:
   - The user is created in auth.users
   - A corresponding record is created in public.users
   - A new organization is created
   - The RLS policies are working correctly

## Troubleshooting

### RLS Policy Issues

If you encounter permission errors like "new row violates row-level security policy":

1. Check if the RLS helper functions are working:
   ```sql
   -- Test if you're authenticated
   SELECT auth.uid();
   
   -- Test the helper functions
   SELECT public.get_auth_user_id();
   SELECT public.get_auth_user_org_id();
   SELECT public.get_auth_user_role();
   ```

2. Verify that your user has an entry in the public.users table with the correct org_id and role:
   ```sql
   SELECT * FROM public.users WHERE id = auth.uid();
   ```

3. Test bypassing RLS for debugging:
   ```sql
   -- Temporarily disable RLS for a table
   ALTER TABLE users DISABLE ROW LEVEL SECURITY;
   
   -- After testing, re-enable it
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   ```

### User Profile Not Being Created

If your user profile isn't being created after registration:

1. Check the Supabase logs for any errors in the auth callback handler
2. Verify the call to `initialize_user_profile` function is working correctly
3. Manually create a test profile using the function:
   ```sql
   SELECT initialize_user_profile(
     'your-auth-user-id'::uuid, 
     'your-email@example.com', 
     'Your Name', 
     'Your Organization'
   );
   ```

### Order of Operations

If you encounter errors about missing functions when running the RLS policies:

1. Run the migrations in this order:
   - First: Run `01_initial_setup.sql`, `02_additional_core_tables.sql`, and `03_billing_subscriptions.sql`
   - Second: Run `07_jwt_claims_setup.sql` to create the helper functions
   - Last: Run `04_rls_policies.sql`, `05_more_rls_policies.sql`, and `06_final_rls_policies.sql`

## Next Steps

After setting up the database:

1. Set up the Edge Functions for:
   - Stripe webhook handling
   - Email notifications
   - Background jobs

2. Implement any missing UI components

3. Test the entire authentication and authorization flow

4. Make sure to shut down any development servers before making major changes to the database schema

Remember to regularly back up your database as you develop!
