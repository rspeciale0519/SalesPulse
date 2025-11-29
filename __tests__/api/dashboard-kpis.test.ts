/**
 * API Route Tests: /api/dashboard/kpis
 * Tests for dashboard KPI aggregation
 */

import { createMocks } from 'node-mocks-http'
import { GET } from '@/app/api/dashboard/kpis/route'

// Mock Supabase
jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn(),
    })),
  })),
}))

// Mock next/headers
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    getAll: jest.fn(() => []),
    set: jest.fn(),
  })),
}))

describe('Dashboard KPIs API - GET /api/dashboard/kpis', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 401 if user is not authenticated', async () => {
    const { req } = createMocks({
      method: 'GET',
      url: '/api/dashboard/kpis',
    })

    const mockSupabase = require('@supabase/ssr').createServerClient()
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Not authenticated' },
    })

    const response = await GET(req as any)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('should return KPI data with calculated metrics', async () => {
    const mockActivitiesQuery = {
      data: [
        { quantity: 10 },
        { quantity: 15 },
      ],
      error: null,
    }

    const mockGoal = {
      id: 'goal-1',
      target_amount: 100000,
      calculated_metrics: {
        dailyCalls: 42,
        weeklyDeals: 4,
        dailyAppointmentsSet: 10,
      },
    }

    const mockRecentActivities = {
      data: [
        {
          id: 'act-1',
          activity_date: '2025-11-29',
          activity_type: 'call',
          quantity: 25,
          notes: 'Cold calls',
        },
      ],
      error: null,
    }

    const { req } = createMocks({
      method: 'GET',
      url: '/api/dashboard/kpis',
    })

    const mockSupabase = require('@supabase/ssr').createServerClient()
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    })

    // Mock different queries
    const mockFrom = mockSupabase.from()
    mockFrom.lte.mockResolvedValueOnce(mockActivitiesQuery) // calls today
    mockFrom.lte.mockResolvedValueOnce(mockActivitiesQuery) // deals this week
    mockFrom.lte.mockResolvedValueOnce(mockActivitiesQuery) // appointments
    mockFrom.single.mockResolvedValueOnce({
      data: mockGoal,
      error: null,
    }) // current goal
    mockFrom.limit.mockResolvedValueOnce(mockRecentActivities) // recent activities

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('callsToday')
    expect(data).toHaveProperty('dealsThisWeek')
    expect(data).toHaveProperty('incomeThisMonth')
    expect(data).toHaveProperty('appointmentsSet')
    expect(data).toHaveProperty('recentActivities')

    // Verify KPI structure
    expect(data.callsToday).toHaveProperty('actual')
    expect(data.callsToday).toHaveProperty('target')
    expect(data.callsToday).toHaveProperty('progress')

    // Verify targets come from goal
    expect(data.callsToday.target).toBe(42) // From goal's dailyCalls
    expect(data.dealsThisWeek.target).toBe(4) // From goal's weeklyDeals
  })

  it('should use default targets when no goal is set', async () => {
    const mockActivitiesQuery = {
      data: [],
      error: null,
    }

    const { req } = createMocks({
      method: 'GET',
      url: '/api/dashboard/kpis',
    })

    const mockSupabase = require('@supabase/ssr').createServerClient()
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    })

    const mockFrom = mockSupabase.from()
    mockFrom.lte.mockResolvedValue(mockActivitiesQuery)
    mockFrom.single.mockResolvedValueOnce({
      data: null,
      error: { code: 'PGRST116' }, // No goal found
    })
    mockFrom.limit.mockResolvedValueOnce({
      data: [],
      error: null,
    })

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    // Should fall back to default targets
    expect(data.callsToday.target).toBe(50) // Default
    expect(data.dealsThisWeek.target).toBe(5) // Default
  })

  it('should calculate progress percentages correctly', async () => {
    const mockActivitiesQuery = {
      data: [
        { quantity: 20 }, // 20 out of 42 target = ~47% (rounded)
      ],
      error: null,
    }

    const mockGoal = {
      calculated_metrics: {
        dailyCalls: 42,
        weeklyDeals: 4,
        dailyAppointmentsSet: 10,
      },
    }

    const { req } = createMocks({
      method: 'GET',
      url: '/api/dashboard/kpis',
    })

    const mockSupabase = require('@supabase/ssr').createServerClient()
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    })

    const mockFrom = mockSupabase.from()
    mockFrom.lte.mockResolvedValueOnce(mockActivitiesQuery)
    mockFrom.lte.mockResolvedValueOnce({ data: [], error: null })
    mockFrom.lte.mockResolvedValueOnce({ data: [], error: null })
    mockFrom.single.mockResolvedValueOnce({
      data: mockGoal,
      error: null,
    })
    mockFrom.limit.mockResolvedValueOnce({
      data: [],
      error: null,
    })

    const response = await GET()
    const data = await response.json()

    expect(data.callsToday.actual).toBe(20)
    expect(data.callsToday.target).toBe(42)
    expect(data.callsToday.progress).toBe(48) // Math.round(20/42 * 100)
  })

  it('should include recent activities in response', async () => {
    const mockRecentActivities = {
      data: [
        {
          id: 'act-1',
          activity_date: '2025-11-29',
          activity_type: 'call',
          quantity: 25,
          notes: 'Test',
        },
        {
          id: 'act-2',
          activity_date: '2025-11-28',
          activity_type: 'deal',
          quantity: 2,
          notes: null,
        },
      ],
      error: null,
    }

    const { req } = createMocks({
      method: 'GET',
      url: '/api/dashboard/kpis',
    })

    const mockSupabase = require('@supabase/ssr').createServerClient()
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    })

    const mockFrom = mockSupabase.from()
    mockFrom.lte.mockResolvedValue({ data: [], error: null })
    mockFrom.single.mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
    mockFrom.limit.mockResolvedValueOnce(mockRecentActivities)

    const response = await GET()
    const data = await response.json()

    expect(data.recentActivities).toHaveLength(2)
    expect(data.recentActivities[0].type).toBe('call')
    expect(data.recentActivities[0].quantity).toBe(25)
    expect(data.recentActivities[1].type).toBe('deal')
  })
})
