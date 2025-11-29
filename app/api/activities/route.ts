import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET /api/activities - Fetch user activities
export async function GET(request: Request) {
  console.log('🔍 [ACTIVITIES API] Fetching activities...')

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

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const activityType = searchParams.get('type')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    console.log('🔍 [ACTIVITIES API] Query params:', { limit, offset, activityType, startDate, endDate })

    // Build query
    let query = supabase
      .from('activities')
      .select('*')
      .eq('user_id', user.id)
      .order('activity_date', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (activityType) {
      query = query.eq('activity_type', activityType)
    }

    if (startDate) {
      query = query.gte('activity_date', startDate)
    }

    if (endDate) {
      query = query.lte('activity_date', endDate)
    }

    const { data: activities, error: fetchError } = await query

    if (fetchError) {
      console.error('❌ [ACTIVITIES API] Error fetching activities:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch activities' },
        { status: 500 }
      )
    }

    console.log('✅ [ACTIVITIES API] Fetched', activities?.length, 'activities')
    return NextResponse.json({ activities })

  } catch (error) {
    console.error('❌ [ACTIVITIES API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/activities - Create new activity
export async function POST(request: Request) {
  console.log('🔍 [ACTIVITIES API] Creating new activity...')

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

    const body = await request.json()
    const { activity_type, activity_date, quantity, notes } = body

    // Validate required fields
    if (!activity_type || !activity_date) {
      return NextResponse.json(
        { error: 'Missing required fields: activity_type and activity_date are required' },
        { status: 400 }
      )
    }

    // Validate activity type
    const validTypes = ['call', 'appointment', 'deal', 'referral']
    if (!validTypes.includes(activity_type)) {
      return NextResponse.json(
        { error: `Invalid activity_type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate quantity
    const activityQuantity = quantity || 1
    if (activityQuantity < 1) {
      return NextResponse.json(
        { error: 'Quantity must be at least 1' },
        { status: 400 }
      )
    }

    console.log('📝 [ACTIVITIES API] Creating activity:', { activity_type, activity_date, quantity: activityQuantity })

    const { data: newActivity, error: insertError } = await supabase
      .from('activities')
      .insert({
        user_id: user.id,
        activity_type,
        activity_date,
        quantity: activityQuantity,
        notes: notes || null,
      })
      .select()
      .single()

    if (insertError) {
      console.error('❌ [ACTIVITIES API] Error creating activity:', insertError)
      return NextResponse.json(
        { error: 'Failed to create activity' },
        { status: 500 }
      )
    }

    console.log('✅ [ACTIVITIES API] Activity created:', newActivity.id)
    return NextResponse.json({ activity: newActivity }, { status: 201 })

  } catch (error) {
    console.error('❌ [ACTIVITIES API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
