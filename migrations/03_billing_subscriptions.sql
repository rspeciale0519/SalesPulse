-- SalesPulse Billing & Subscriptions Tables
-- Creates tables related to plans, subscriptions, and usage tracking

-- Plans Table
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  price_per_month NUMERIC NOT NULL,
  max_users INTEGER NOT NULL,
  included_sims INTEGER NOT NULL,
  can_purchase_sims BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  plan_id UUID NOT NULL REFERENCES plans(id),
  stripe_subscription_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('active', 'past_due', 'canceled', 'unpaid')),
  start_date DATE NOT NULL,
  current_period_end DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage_Records Table
CREATE TABLE IF NOT EXISTS usage_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  sim_id UUID NOT NULL REFERENCES sims(id),
  usage_date DATE NOT NULL,
  usage_amount INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit_Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default plans
INSERT INTO plans (name, price_per_month, max_users, included_sims)
VALUES 
  ('Free', 0, 1, 0),
  ('Pro', 25, 1, 1),
  ('Team', 100, 5, 1),
  ('Enterprise', 300, 15, 3);

-- Documentation comments
COMMENT ON TABLE plans IS 'Available subscription plans';
COMMENT ON TABLE subscriptions IS 'User subscriptions linked to Stripe';
COMMENT ON TABLE usage_records IS 'Tracking of SIM usage for billing purposes';
COMMENT ON TABLE audit_logs IS 'Security audit trail for system actions';
