import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// PUT /api/goals/[id] - Update goal
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log('🔍 [GOALS API] Updating goal:', params.id)

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
      console.error('❌ [GOALS API] Authentication error:', userError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if goal exists and belongs to user
    const { data: existingGoal, error: fetchError } = await supabase
      .from('goals')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingGoal) {
      console.error('❌ [GOALS API] Goal not found:', fetchError)
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 })
    }

    const body = await request.json()
    const { target_amount, start_date, end_date, goal_config, calculated_metrics } = body

    // Validate dates if provided
    const startDate = start_date || existingGoal.start_date
    const endDate = end_date || existingGoal.end_date

    if (new Date(startDate) > new Date(endDate)) {
      return NextResponse.json(
        { error: 'start_date must be before or equal to end_date' },
        { status: 400 }
      )
    }

    // Build update object with only provided fields
    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }

    if (target_amount !== undefined) updates.target_amount = target_amount
    if (start_date !== undefined) updates.start_date = start_date
    if (end_date !== undefined) updates.end_date = end_date
    if (goal_config !== undefined) updates.goal_config = goal_config
    if (calculated_metrics !== undefined) updates.calculated_metrics = calculated_metrics

    console.log('📝 [GOALS API] Updating with:', updates)

    const { data: updatedGoal, error: updateError } = await supabase
      .from('goals')
      .update(updates)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('❌ [GOALS API] Error updating goal:', updateError)
      return NextResponse.json(
        { error: 'Failed to update goal' },
        { status: 500 }
      )
    }

    console.log('✅ [GOALS API] Goal updated:', updatedGoal.id)
    return NextResponse.json({ goal: updatedGoal })

  } catch (error) {
    console.error('❌ [GOALS API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/goals/[id] - Delete goal
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log('🔍 [GOALS API] Deleting goal:', params.id)

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
      console.error('❌ [GOALS API] Authentication error:', userError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete goal (RLS will ensure user can only delete their own)
    const { error: deleteError } = await supabase
      .from('goals')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('❌ [GOALS API] Error deleting goal:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete goal' },
        { status: 500 }
      )
    }

    console.log('✅ [GOALS API] Goal deleted:', params.id)
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('❌ [GOALS API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
