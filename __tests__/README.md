# SalesPulse Test Suite

This directory contains comprehensive tests for the SalesPulse application.

## Test Coverage

### API Route Tests

#### `/api/activities` - Activities CRUD (`api/activities.test.ts`)
- ✅ GET - List user activities with pagination and filtering
- ✅ POST - Create new activities with validation
- ✅ PUT - Update existing activities
- ✅ DELETE - Remove activities
- ✅ Authentication checks
- ✅ Error handling
- ✅ Input validation (activity types, dates, quantities)

**Test Count:** 8 tests

#### `/api/goals` - Goals Management (`api/goals.test.ts`)
- ✅ GET - List user goals
- ✅ GET - Filter current goal by date range
- ✅ POST - Create goals with configuration
- ✅ PUT - Update goal configuration and metrics
- ✅ DELETE - Remove goals
- ✅ Date validation (start_date before end_date)
- ✅ Required fields validation
- ✅ Goal config and calculated_metrics storage

**Test Count:** 8 tests

#### `/api/dashboard/kpis` - Dashboard KPIs (`api/dashboard-kpis.test.ts`)
- ✅ KPI aggregation from activities
- ✅ Target calculation from user goals
- ✅ Progress percentage calculations
- ✅ Default targets when no goal exists
- ✅ Recent activities inclusion
- ✅ Authentication checks
- ✅ Data structure validation

**Test Count:** 6 tests

### Total Test Count: **22 API tests**

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- activities.test.ts

# Run with coverage
npm test -- --coverage
```

## Test Structure

```
__tests__/
├── api/
│   ├── activities.test.ts      # Activities CRUD tests
│   ├── goals.test.ts           # Goals management tests
│   └── dashboard-kpis.test.ts  # Dashboard KPI tests
├── auth/
│   └── login-form.test.tsx     # Login form component tests
└── README.md                   # This file
```

## Mocking Strategy

### Supabase Client
All tests mock the Supabase client using Jest mocks:
```typescript
jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(() => ({
    auth: { getUser: jest.fn() },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      // ... other methods
    })),
  })),
}))
```

### HTTP Requests
API route tests use `node-mocks-http` to create mock requests and responses.

## Test Scenarios Covered

### Authentication
- ✅ Unauthorized access (401 responses)
- ✅ Authenticated user access
- ✅ User ownership validation

### Data Validation
- ✅ Required fields validation
- ✅ Data type validation
- ✅ Enum validation (activity types)
- ✅ Date range validation
- ✅ Quantity validation (positive numbers)

### Business Logic
- ✅ Activity aggregation by date
- ✅ KPI progress calculation
- ✅ Goal-based target calculation
- ✅ Recent activities filtering
- ✅ Default fallback values

### Error Handling
- ✅ Missing required fields
- ✅ Invalid data types
- ✅ Not found (404) responses
- ✅ Database errors
- ✅ Internal server errors (500)

## Adding New Tests

### API Route Test Template
```typescript
import { createMocks } from 'node-mocks-http'
import { GET } from '@/app/api/your-route/route'

describe('Your API Route', () => {
  it('should do something', async () => {
    const { req } = createMocks({
      method: 'GET',
      url: '/api/your-route',
    })

    const mockSupabase = require('@supabase/ssr').createServerClient()
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    })

    const response = await GET(req as any)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('someField')
  })
})
```

## Next Steps

### Additional Tests Needed
- [ ] Component tests for dashboard page
- [ ] Component tests for activity log page
- [ ] Component tests for goals calculator
- [ ] E2E tests for critical user flows
- [ ] Integration tests with real Supabase instance
- [ ] Performance/load tests

### Test Coverage Goals
- Current: ~22 tests
- Target: 80%+ code coverage
- Focus areas:
  - All API routes
  - Key components
  - Utility functions
  - Error boundaries

## Continuous Integration

Tests should be run:
- ✅ On every commit
- ✅ Before merging PRs
- ✅ In CI/CD pipeline
- ✅ Before deploying to production

## Debugging Tests

```bash
# Run with verbose output
npm test -- --verbose

# Run with debug logging
DEBUG=* npm test

# Run single test
npm test -- -t "should return activities"
```

## Test Maintenance

- Update tests when API contracts change
- Keep mocks synchronized with actual implementations
- Review and update test data regularly
- Remove obsolete tests
- Add tests for new features before implementing

---

**Last Updated:** 2025-11-29
**Test Framework:** Jest
**Total Tests:** 22
