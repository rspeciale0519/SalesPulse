import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface KPIData {
  callsToday: {
    actual: number
    target: number
    progress: number
  }
  dealsThisWeek: {
    actual: number
    target: number
    progress: number
  }
  incomeThisMonth: {
    actual: number
    target: number
    progress: number
  }
  appointmentsSet: {
    actual: number
    target: number
    progress: number
  }
  recentActivities: Array<{
    id: string
    date: string
    type: string
    quantity: number
    notes: string | null
  }>
}

export async function GET() {
  console.log('🔍 [DASHBOARD KPIs] Fetching dashboard KPIs...')

  try {
    // Initialize Supabase client
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

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('❌ [DASHBOARD KPIs] Authentication error:', userError)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('✅ [DASHBOARD KPIs] User authenticated:', user.id)

    // Calculate date ranges
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0] // YYYY-MM-DD

    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay()) // Sunday
    const startOfWeekStr = startOfWeek.toISOString().split('T')[0]

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const startOfMonthStr = startOfMonth.toISOString().split('T')[0]

    console.log('📅 [DASHBOARD KPIs] Date ranges:', { todayStr, startOfWeekStr, startOfMonthStr })

    // Fetch calls made today
    const { data: callsToday, error: callsTodayError } = await supabase
      .from('activities')
      .select('quantity')
      .eq('user_id', user.id)
      .eq('activity_type', 'call')
      .eq('activity_date', todayStr)

    if (callsTodayError) {
      console.error('❌ [DASHBOARD KPIs] Error fetching calls today:', callsTodayError)
    }

    const callsTodayCount = callsToday?.reduce((sum, activity) => sum + (activity.quantity || 0), 0) || 0
    console.log('📊 [DASHBOARD KPIs] Calls today:', callsTodayCount)

    // Fetch deals this week
    const { data: dealsThisWeek, error: dealsWeekError } = await supabase
      .from('activities')
      .select('quantity')
      .eq('user_id', user.id)
      .eq('activity_type', 'deal')
      .gte('activity_date', startOfWeekStr)
      .lte('activity_date', todayStr)

    if (dealsWeekError) {
      console.error('❌ [DASHBOARD KPIs] Error fetching deals this week:', dealsWeekError)
    }

    const dealsThisWeekCount = dealsThisWeek?.reduce((sum, activity) => sum + (activity.quantity || 0), 0) || 0
    console.log('📊 [DASHBOARD KPIs] Deals this week:', dealsThisWeekCount)

    // Fetch appointments set (this month)
    const { data: appointmentsThisMonth, error: appointmentsError } = await supabase
      .from('activities')
      .select('quantity')
      .eq('user_id', user.id)
      .eq('activity_type', 'appointment')
      .gte('activity_date', startOfMonthStr)
      .lte('activity_date', todayStr)

    if (appointmentsError) {
      console.error('❌ [DASHBOARD KPIs] Error fetching appointments:', appointmentsError)
    }

    const appointmentsCount = appointmentsThisMonth?.reduce((sum, activity) => sum + (activity.quantity || 0), 0) || 0
    console.log('📊 [DASHBOARD KPIs] Appointments this month:', appointmentsCount)

    // Fetch user's current goal
    const { data: currentGoal, error: goalError } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .lte('start_date', todayStr)
      .gte('end_date', todayStr)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (goalError && goalError.code !== 'PGRST116') {
      console.error('❌ [DASHBOARD KPIs] Error fetching goal:', goalError)
    }

    console.log('🎯 [DASHBOARD KPIs] Current goal:', currentGoal)

    // Calculate targets based on goal (simplified for now - will need SIM-specific calculations later)
    // For now, we'll use placeholder values or calculate basic targets
    const targetAmount = currentGoal?.target_amount || 0
    const callsTarget = 50 // Placeholder - should come from SIM calculations
    const dealsTarget = 5 // Placeholder
    const appointmentsTarget = 10 // Placeholder

    // Fetch recent activities (last 10)
    const { data: recentActivities, error: recentError } = await supabase
      .from('activities')
      .select('id, activity_date, activity_type, quantity, notes')
      .eq('user_id', user.id)
      .order('activity_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(10)

    if (recentError) {
      console.error('❌ [DASHBOARD KPIs] Error fetching recent activities:', recentError)
    }

    console.log('📋 [DASHBOARD KPIs] Recent activities count:', recentActivities?.length || 0)

    // Prepare response
    const kpiData: KPIData = {
      callsToday: {
        actual: callsTodayCount,
        target: callsTarget,
        progress: callsTarget > 0 ? Math.round((callsTodayCount / callsTarget) * 100) : 0,
      },
      dealsThisWeek: {
        actual: dealsThisWeekCount,
        target: dealsTarget,
        progress: dealsTarget > 0 ? Math.round((dealsThisWeekCount / dealsTarget) * 100) : 0,
      },
      incomeThisMonth: {
        actual: 0, // TODO: Calculate from deals and SIM-specific commission rates
        target: targetAmount,
        progress: 0,
      },
      appointmentsSet: {
        actual: appointmentsCount,
        target: appointmentsTarget,
        progress: appointmentsTarget > 0 ? Math.round((appointmentsCount / appointmentsTarget) * 100) : 0,
      },
      recentActivities: recentActivities?.map(activity => ({
        id: activity.id,
        date: activity.activity_date,
        type: activity.activity_type,
        quantity: activity.quantity || 1,
        notes: activity.notes,
      })) || [],
    }

    console.log('✅ [DASHBOARD KPIs] KPI data prepared successfully')
    return NextResponse.json(kpiData)

  } catch (error) {
    console.error('❌ [DASHBOARD KPIs] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
