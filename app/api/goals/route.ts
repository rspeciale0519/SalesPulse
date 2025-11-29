import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET /api/goals - Fetch user goals
export async function GET(request: Request) {
  console.log('🔍 [GOALS API] Fetching goals...')

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

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const current = searchParams.get('current') === 'true'

    let query = supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // If requesting current goal, filter by date range
    if (current) {
      const today = new Date().toISOString().split('T')[0]
      query = query
        .lte('start_date', today)
        .gte('end_date', today)
        .limit(1)
    }

    const { data: goals, error: fetchError } = await query

    if (fetchError) {
      console.error('❌ [GOALS API] Error fetching goals:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch goals' },
        { status: 500 }
      )
    }

    console.log('✅ [GOALS API] Fetched', goals?.length, 'goals')
    return NextResponse.json({ goals: goals || [] })

  } catch (error) {
    console.error('❌ [GOALS API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/goals - Create new goal
export async function POST(request: Request) {
  console.log('🔍 [GOALS API] Creating new goal...')

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

    const body = await request.json()
    const { target_amount, start_date, end_date, goal_config, calculated_metrics } = body

    // Validate required fields
    if (!target_amount || !start_date || !end_date) {
      return NextResponse.json(
        { error: 'Missing required fields: target_amount, start_date, and end_date are required' },
        { status: 400 }
      )
    }

    // Validate dates
    if (new Date(start_date) > new Date(end_date)) {
      return NextResponse.json(
        { error: 'start_date must be before or equal to end_date' },
        { status: 400 }
      )
    }

    console.log('📝 [GOALS API] Creating goal:', { target_amount, start_date, end_date })

    const { data: newGoal, error: insertError } = await supabase
      .from('goals')
      .insert({
        user_id: user.id,
        target_amount,
        start_date,
        end_date,
        goal_config: goal_config || {},
        calculated_metrics: calculated_metrics || {},
      })
      .select()
      .single()

    if (insertError) {
      console.error('❌ [GOALS API] Error creating goal:', insertError)
      return NextResponse.json(
        { error: 'Failed to create goal' },
        { status: 500 }
      )
    }

    console.log('✅ [GOALS API] Goal created:', newGoal.id)
    return NextResponse.json({ goal: newGoal }, { status: 201 })

  } catch (error) {
    console.error('❌ [GOALS API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
