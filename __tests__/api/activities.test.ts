/**
 * API Route Tests: /api/activities
 * Tests for activities CRUD operations
 */

import { createMocks } from 'node-mocks-http'
import { GET, POST } from '@/app/api/activities/route'
import { PUT, DELETE } from '@/app/api/activities/[id]/route'

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
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
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

describe('Activities API - GET /api/activities', () => {
  it('should return 401 if user is not authenticated', async () => {
    const { req } = createMocks({
      method: 'GET',
      url: '/api/activities',
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

  it('should return activities for authenticated user', async () => {
    const mockActivities = [
      {
        id: '123',
        user_id: 'user-1',
        activity_type: 'call',
        activity_date: '2025-11-29',
        quantity: 25,
        notes: 'Cold calls',
        created_at: '2025-11-29T10:00:00Z',
      },
    ]

    const { req } = createMocks({
      method: 'GET',
      url: '/api/activities',
    })

    const mockSupabase = require('@supabase/ssr').createServerClient()
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    })
    mockSupabase.from().range.mockResolvedValue({
      data: mockActivities,
      error: null,
    })

    const response = await GET(req as any)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.activities).toHaveLength(1)
    expect(data.activities[0].activity_type).toBe('call')
  })

  it('should filter activities by type', async () => {
    const { req } = createMocks({
      method: 'GET',
      url: '/api/activities?type=call',
    })

    const mockSupabase = require('@supabase/ssr').createServerClient()
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    })

    await GET(req as any)

    expect(mockSupabase.from).toHaveBeenCalledWith('activities')
    expect(mockSupabase.from().eq).toHaveBeenCalledWith('activity_type', 'call')
  })
})

describe('Activities API - POST /api/activities', () => {
  it('should create a new activity', async () => {
    const { req } = createMocks({
      method: 'POST',
      url: '/api/activities',
      body: {
        activity_type: 'call',
        activity_date: '2025-11-29',
        quantity: 25,
        notes: 'Test calls',
      },
    })

    const mockSupabase = require('@supabase/ssr').createServerClient()
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    })
    mockSupabase.from().single.mockResolvedValue({
      data: {
        id: 'activity-1',
        user_id: 'user-1',
        activity_type: 'call',
        activity_date: '2025-11-29',
        quantity: 25,
        notes: 'Test calls',
      },
      error: null,
    })

    const response = await POST(req as any)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.activity.activity_type).toBe('call')
    expect(data.activity.quantity).toBe(25)
  })

  it('should return 400 if required fields are missing', async () => {
    const { req } = createMocks({
      method: 'POST',
      url: '/api/activities',
      body: {
        activity_type: 'call',
        // Missing activity_date
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

  it('should return 400 for invalid activity type', async () => {
    const { req } = createMocks({
      method: 'POST',
      url: '/api/activities',
      body: {
        activity_type: 'invalid_type',
        activity_date: '2025-11-29',
        quantity: 5,
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
    expect(data.error).toContain('Invalid activity_type')
  })
})

describe('Activities API - PUT /api/activities/[id]', () => {
  it('should update an activity', async () => {
    const { req } = createMocks({
      method: 'PUT',
      url: '/api/activities/activity-1',
      body: {
        quantity: 30,
        notes: 'Updated notes',
      },
    })

    const mockSupabase = require('@supabase/ssr').createServerClient()
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    })
    mockSupabase.from().single.mockResolvedValueOnce({
      data: {
        id: 'activity-1',
        user_id: 'user-1',
        activity_type: 'call',
      },
      error: null,
    })
    mockSupabase.from().single.mockResolvedValueOnce({
      data: {
        id: 'activity-1',
        user_id: 'user-1',
        quantity: 30,
        notes: 'Updated notes',
      },
      error: null,
    })

    const response = await PUT(req as any, { params: { id: 'activity-1' } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.activity.quantity).toBe(30)
  })

  it('should return 404 if activity not found', async () => {
    const { req } = createMocks({
      method: 'PUT',
      url: '/api/activities/nonexistent',
      body: { quantity: 10 },
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
    expect(data.error).toBe('Activity not found')
  })
})

describe('Activities API - DELETE /api/activities/[id]', () => {
  it('should delete an activity', async () => {
    const { req } = createMocks({
      method: 'DELETE',
      url: '/api/activities/activity-1',
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

    const response = await DELETE(req as any, { params: { id: 'activity-1' } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })
})
