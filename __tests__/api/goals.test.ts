/**
 * API Route Tests: /api/goals
 * Tests for goals CRUD operations
 */

import { createMocks } from 'node-mocks-http'
import { GET, POST } from '@/app/api/goals/route'
import { PUT, DELETE } from '@/app/api/goals/[id]/route'

// Mock Supabase
jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
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

describe('Goals API - GET /api/goals', () => {
  it('should return 401 if user is not authenticated', async () => {
    const { req } = createMocks({
      method: 'GET',
      url: '/api/goals',
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

  it('should return all goals for authenticated user', async () => {
    const mockGoals = [
      {
        id: 'goal-1',
        user_id: 'user-1',
        target_amount: 100000,
        start_date: '2025-01-01',
        end_date: '2025-12-31',
        goal_config: {
          incomePerDeal: '500',
          closeRate: '40',
        },
        calculated_metrics: {
          dailyCalls: 42,
          weeklyDeals: 4,
        },
        created_at: '2025-11-01T00:00:00Z',
      },
    ]

    const { req } = createMocks({
      method: 'GET',
      url: '/api/goals',
    })

    const mockSupabase = require('@supabase/ssr').createServerClient()
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    })
    mockSupabase.from().order.mockResolvedValue({
      data: mockGoals,
      error: null,
    })

    const response = await GET(req as any)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.goals).toHaveLength(1)
    expect(data.goals[0].target_amount).toBe(100000)
    expect(data.goals[0].calculated_metrics.dailyCalls).toBe(42)
  })

  it('should return current goal when current=true', async () => {
    const { req } = createMocks({
      method: 'GET',
      url: '/api/goals?current=true',
    })

    const mockSupabase = require('@supabase/ssr').createServerClient()
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    })

    await GET(req as any)

    expect(mockSupabase.from().lte).toHaveBeenCalled()
    expect(mockSupabase.from().gte).toHaveBeenCalled()
    expect(mockSupabase.from().limit).toHaveBeenCalledWith(1)
  })
})

describe('Goals API - POST /api/goals', () => {
  it('should create a new goal with full configuration', async () => {
    const { req } = createMocks({
      method: 'POST',
      url: '/api/goals',
      body: {
        target_amount: 120000,
        start_date: '2025-01-01',
        end_date: '2025-12-31',
        goal_config: {
          incomePerDeal: '600',
          closeRate: '45',
          callBookRate: '150',
        },
        calculated_metrics: {
          dailyCalls: 40,
          weeklyDeals: 5,
          dailyAppointmentsSet: 8,
        },
      },
    })

    const mockSupabase = require('@supabase/ssr').createServerClient()
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    })
    mockSupabase.from().single.mockResolvedValue({
      data: {
        id: 'goal-1',
        user_id: 'user-1',
        target_amount: 120000,
        start_date: '2025-01-01',
        end_date: '2025-12-31',
        goal_config: {
          incomePerDeal: '600',
          closeRate: '45',
        },
        calculated_metrics: {
          dailyCalls: 40,
          weeklyDeals: 5,
        },
      },
      error: null,
    })

    const response = await POST(req as any)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.goal.target_amount).toBe(120000)
    expect(data.goal.calculated_metrics.dailyCalls).toBe(40)
  })

  it('should return 400 if required fields are missing', async () => {
    const { req } = createMocks({
      method: 'POST',
      url: '/api/goals',
      body: {
        target_amount: 100000,
        // Missing start_date and end_date
      },
    })

    const mockSupabase = require('@supabase/ssr').createServerClient()
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    })

    const response = await POST(req as any)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('required')
  })

  it('should return 400 if start_date is after end_date', async () => {
    const { req } = createMocks({
      method: 'POST',
      url: '/api/goals',
      body: {
        target_amount: 100000,
        start_date: '2025-12-31',
        end_date: '2025-01-01',
      },
    })

    const mockSupabase = require('@supabase/ssr').createServerClient()
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    })

    const response = await POST(req as any)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('start_date must be before')
  })
})

describe('Goals API - PUT /api/goals/[id]', () => {
  it('should update a goal', async () => {
    const { req } = createMocks({
      method: 'PUT',
      url: '/api/goals/goal-1',
      body: {
        target_amount: 150000,
        calculated_metrics: {
          dailyCalls: 50,
          weeklyDeals: 6,
        },
      },
    })

    const mockSupabase = require('@supabase/ssr').createServerClient()
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    })
    mockSupabase.from().single.mockResolvedValueOnce({
      data: {
        id: 'goal-1',
        user_id: 'user-1',
        start_date: '2025-01-01',
        end_date: '2025-12-31',
      },
      error: null,
    })
    mockSupabase.from().single.mockResolvedValueOnce({
      data: {
        id: 'goal-1',
        user_id: 'user-1',
        target_amount: 150000,
        calculated_metrics: {
          dailyCalls: 50,
          weeklyDeals: 6,
        },
      },
      error: null,
    })

    const response = await PUT(req as any, { params: { id: 'goal-1' } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.goal.target_amount).toBe(150000)
  })

  it('should return 404 if goal not found', async () => {
    const { req } = createMocks({
      method: 'PUT',
      url: '/api/goals/nonexistent',
      body: { target_amount: 100000 },
    })

    const mockSupabase = require('@supabase/ssr').createServerClient()
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    })
    mockSupabase.from().single.mockResolvedValue({
      data: null,
      error: { message: 'Not found' },
    })

    const response = await PUT(req as any, { params: { id: 'nonexistent' } })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Goal not found')
  })
})

describe('Goals API - DELETE /api/goals/[id]', () => {
  it('should delete a goal', async () => {
    const { req } = createMocks({
      method: 'DELETE',
      url: '/api/goals/goal-1',
    })

    const mockSupabase = require('@supabase/ssr').createServerClient()
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    })
    mockSupabase.from().delete.mockResolvedValue({
      data: null,
      error: null,
    })

    const response = await DELETE(req as any, { params: { id: 'goal-1' } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })
})
