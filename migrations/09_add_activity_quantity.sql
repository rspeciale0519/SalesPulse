-- Migration: Add quantity field to activities table
-- This allows users to log bulk activities (e.g., "25 calls on 2025-11-29")

-- Add quantity column to activities table
ALTER TABLE activities
ADD COLUMN quantity INTEGER NOT NULL DEFAULT 1;

-- Add constraint to ensure quantity is positive
ALTER TABLE activities
ADD CONSTRAINT activities_quantity_positive CHECK (quantity > 0);

-- Update comment
COMMENT ON COLUMN activities.quantity IS 'Number of activities of this type performed (e.g., 25 calls)';
