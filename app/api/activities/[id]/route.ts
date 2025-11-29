import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// PUT /api/activities/[id] - Update activity
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log('🔍 [ACTIVITIES API] Updating activity:', params.id)

  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('❌ [ACTIVITIES API] Authentication error:', userError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if activity exists and belongs to user
    const { data: existingActivity, error: fetchError } = await supabase
      .from('activities')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingActivity) {
      console.error('❌ [ACTIVITIES API] Activity not found:', fetchError)
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 })
    }

    const body = await request.json()
    const { activity_type, activity_date, quantity, notes } = body

    // Validate activity type if provided
    if (activity_type) {
      const validTypes = ['call', 'appointment', 'deal', 'referral']
      if (!validTypes.includes(activity_type)) {
        return NextResponse.json(
          { error: `Invalid activity_type. Must be one of: ${validTypes.join(', ')}` },
          { status: 400 }
        )
      }
    }

    // Validate quantity if provided
    if (quantity !== undefined && quantity < 1) {
      return NextResponse.json(
        { error: 'Quantity must be at least 1' },
        { status: 400 }
      )
    }

    // Build update object with only provided fields
    const updates: Record<string, any> = {}
    if (activity_type) updates.activity_type = activity_type
    if (activity_date) updates.activity_date = activity_date
    if (quantity !== undefined) updates.quantity = quantity
    if (notes !== undefined) updates.notes = notes

    console.log('📝 [ACTIVITIES API] Updating with:', updates)

    const { data: updatedActivity, error: updateError } = await supabase
      .from('activities')
      .update(updates)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('❌ [ACTIVITIES API] Error updating activity:', updateError)
      return NextResponse.json(
        { error: 'Failed to update activity' },
        { status: 500 }
      )
    }

    console.log('✅ [ACTIVITIES API] Activity updated:', updatedActivity.id)
    return NextResponse.json({ activity: updatedActivity })

  } catch (error) {
    console.error('❌ [ACTIVITIES API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/activities/[id] - Delete activity
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log('🔍 [ACTIVITIES API] Deleting activity:', params.id)

  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('❌ [ACTIVITIES API] Authentication error:', userError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete activity (RLS will ensure user can only delete their own)
    const { error: deleteError } = await supabase
      .from('activities')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('❌ [ACTIVITIES API] Error deleting activity:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete activity' },
        { status: 500 }
      )
    }

    console.log('✅ [ACTIVITIES API] Activity deleted:', params.id)
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('❌ [ACTIVITIES API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
