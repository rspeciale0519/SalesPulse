-- Migration: Add goal_config JSONB to goals table
-- This allows storing all calculator inputs (conversion rates, work schedule, etc.)

-- Add goal_config column to goals table
ALTER TABLE goals
ADD COLUMN goal_config JSONB DEFAULT '{}';

-- Update comment
COMMENT ON COLUMN goals.goal_config IS 'Calculator configuration including rates, schedule, and referral settings (incomePerDeal, takenRate, closeRate, showRate, callBookRate, daysPerWeek, weeksPerYear, dealReferralPercent, etc.)';

-- Add calculated_metrics column to store pre-computed metrics
ALTER TABLE goals
ADD COLUMN calculated_metrics JSONB DEFAULT '{}';

COMMENT ON COLUMN goals.calculated_metrics IS 'Pre-computed metrics from calculator (dailyCalls, weeklyCalls, dailyDeals, weeklyDeals, etc.) for quick dashboard access';
