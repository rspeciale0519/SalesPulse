# Authentication Failed Login Batching Strategy

## Overview

The authentication system implements a sophisticated batching strategy for updating failed login attempt metadata to balance security monitoring with database performance. This strategy reduces unnecessary database writes while maintaining accurate tracking of failed login attempts.

## Batching Logic

The system updates the user's failed login metadata in the following scenarios:

### 1. First Failed Attempt
- **Condition**: `newFailed === 1`
- **Purpose**: Initialize tracking for the user
- **Impact**: Establishes baseline for subsequent attempts

### 2. Account Lock Threshold
- **Condition**: `newFailed >= MAX_FAILED_ATTEMPTS`
- **Purpose**: Immediate lock when threshold is reached
- **Impact**: Critical security action requiring immediate database update

### 3. Periodic Progress Updates
- **Condition**: `newFailed < MAX_FAILED_ATTEMPTS && newFailed % 3 === 0`
- **Purpose**: Track progression every 3rd attempt between 1 and MAX-1
- **Impact**: Provides monitoring visibility without excessive writes
- **Examples**: Updates on attempts 3, 6, 9, etc.

### 4. Time-Based Fallback
- **Condition**: No update in the last hour (`60 * 60 * 1000` ms)
- **Purpose**: Ensure persistent tracking even with infrequent attempts
- **Impact**: Prevents stale metadata and maintains audit trail

## Performance Benefits

- **Reduced Database Load**: Eliminates updates on every failed attempt
- **Maintained Security**: Critical thresholds still trigger immediate action
- **Audit Compliance**: Time-based fallback ensures complete tracking
- **Scalability**: Batching strategy scales with user base growth

## Configuration

- `MAX_FAILED_ATTEMPTS`: Configurable threshold for account locking
- `AUTH_ACCOUNT_LOCK_DURATION_MINUTES`: Environment variable for lock duration
- Periodic update interval: Every 3 attempts (hardcoded)
- Time-based fallback: 1 hour (hardcoded)

## Implementation Details

The batching logic is implemented in the `signInWithCredentials` function in `lib/actions/auth-actions.ts`. The system:

1. Calculates the new failed attempt count
2. Evaluates batching conditions
3. Updates database only when conditions are met
4. Records attempts in the rate limiter
5. Applies account locking when thresholds are exceeded

## Security Considerations

- Account locking is immediate when thresholds are reached
- Rate limiting works independently of batching
- Time-based fallback prevents circumvention through timing attacks
- All critical security events are logged regardless of batching

## Monitoring

The system logs all authentication attempts and provides detailed debugging information for:
- Failed attempt counts
- Database update decisions
- Account lock status
- Rate limiting actions

This batching strategy ensures robust security while maintaining optimal database performance.
