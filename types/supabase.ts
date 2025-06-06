// Temporary type definitions for Supabase
// These will be replaced by generated types from supabase gen types typescript
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'Rep' | 'Manager' | 'Admin' | 'PlatformAdmin' | 'SuperAdmin'
          org_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          role?: 'Rep' | 'Manager' | 'Admin' | 'PlatformAdmin' | 'SuperAdmin'
          org_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: 'Rep' | 'Manager' | 'Admin' | 'PlatformAdmin' | 'SuperAdmin'
          org_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      // Add more tables as needed
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}
