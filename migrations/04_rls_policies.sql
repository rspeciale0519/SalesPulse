-- SalesPulse Row Level Security (RLS) Policies
-- Implements multi-tenant security per the database schema documentation

-- Enable Row Level Security on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sims ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sims ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE what_if_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE sim_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper functions for auth
CREATE OR REPLACE FUNCTION get_auth_user_id() 
RETURNS UUID AS $$
BEGIN
  RETURN (auth.jwt() ->> 'sub')::UUID;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_auth_user_org_id() 
RETURNS UUID AS $$
BEGIN
  RETURN (auth.jwt() ->> 'org_id')::UUID;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_auth_user_role() 
RETURNS TEXT AS $$
BEGIN
  RETURN (auth.jwt() ->> 'role')::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_admin_or_manager() 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_auth_user_role() IN ('admin', 'manager');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Organizations Policies
CREATE POLICY org_select_policy ON organizations
  FOR SELECT USING (id = get_auth_user_org_id() OR get_auth_user_role() = 'admin');

CREATE POLICY org_insert_policy ON organizations
  FOR INSERT WITH CHECK (get_auth_user_role() = 'admin');

CREATE POLICY org_update_policy ON organizations
  FOR UPDATE USING (get_auth_user_role() = 'admin');

CREATE POLICY org_delete_policy ON organizations
  FOR DELETE USING (get_auth_user_role() = 'admin');

-- Users Policies
CREATE POLICY users_select_policy ON users
  FOR SELECT USING (org_id = get_auth_user_org_id() OR get_auth_user_role() = 'admin');

CREATE POLICY users_insert_policy ON users
  FOR INSERT WITH CHECK (
    get_auth_user_role() = 'admin' OR 
    (get_auth_user_role() = 'manager' AND org_id = get_auth_user_org_id())
  );

CREATE POLICY users_update_policy ON users
  FOR UPDATE USING (
    id = get_auth_user_id() OR
    (org_id = get_auth_user_org_id() AND is_admin_or_manager())
  );

CREATE POLICY users_delete_policy ON users
  FOR DELETE USING (get_auth_user_role() = 'admin');

-- SIMs Policies
CREATE POLICY sims_select_policy ON sims
  FOR SELECT USING (true);

CREATE POLICY sims_insert_policy ON sims
  FOR INSERT WITH CHECK (get_auth_user_role() = 'admin');

CREATE POLICY sims_update_policy ON sims
  FOR UPDATE USING (get_auth_user_role() = 'admin');

CREATE POLICY sims_delete_policy ON sims
  FOR DELETE USING (get_auth_user_role() = 'admin');

-- User_SIMs Policies
CREATE POLICY user_sims_select_policy ON user_sims
  FOR SELECT USING (
    user_id = get_auth_user_id() OR
    EXISTS (SELECT 1 FROM users WHERE users.id = user_sims.user_id AND users.org_id = get_auth_user_org_id() AND is_admin_or_manager())
  );

CREATE POLICY user_sims_insert_policy ON user_sims
  FOR INSERT WITH CHECK (
    user_id = get_auth_user_id() OR
    (EXISTS (SELECT 1 FROM users WHERE users.id = user_sims.user_id AND users.org_id = get_auth_user_org_id() AND is_admin_or_manager()))
  );

CREATE POLICY user_sims_update_policy ON user_sims
  FOR UPDATE USING (
    user_id = get_auth_user_id() OR
    (EXISTS (SELECT 1 FROM users WHERE users.id = user_sims.user_id AND users.org_id = get_auth_user_org_id() AND is_admin_or_manager()))
  );

CREATE POLICY user_sims_delete_policy ON user_sims
  FOR DELETE USING (get_auth_user_role() = 'admin');

-- Goals Policies
CREATE POLICY goals_select_policy ON goals
  FOR SELECT USING (
    user_id = get_auth_user_id() OR
    (EXISTS (SELECT 1 FROM users WHERE users.id = goals.user_id AND users.org_id = get_auth_user_org_id() AND is_admin_or_manager()))
  );

CREATE POLICY goals_insert_policy ON goals
  FOR INSERT WITH CHECK (user_id = get_auth_user_id());

CREATE POLICY goals_update_policy ON goals
  FOR UPDATE USING (
    user_id = get_auth_user_id() OR
    (EXISTS (SELECT 1 FROM users WHERE users.id = goals.user_id AND users.org_id = get_auth_user_org_id() AND is_admin_or_manager()))
  );

CREATE POLICY goals_delete_policy ON goals
  FOR DELETE USING (
    user_id = get_auth_user_id() OR
    (EXISTS (SELECT 1 FROM users WHERE users.id = goals.user_id AND users.org_id = get_auth_user_org_id() AND is_admin_or_manager()))
  );

-- Activities Policies (more to follow in the next file)
