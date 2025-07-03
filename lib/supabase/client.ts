import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/supabase'

export function createClient() {
  // IMPORTANT: This is client-side code where Next.js inlines environment variables during build
  // NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set at build time
  // However, we perform runtime checks for improved debugging and deployment reliability
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  // Verify both environment variables are present
  if (!supabaseUrl || supabaseUrl.trim() === '') {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not defined. Please check your environment variables.')
  }
  
  if (!supabaseAnonKey || supabaseAnonKey.trim() === '') {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined. Please check your environment variables.')
  }
  
  return createBrowserClient<Database>(
    supabaseUrl,
    supabaseAnonKey
  )
}
