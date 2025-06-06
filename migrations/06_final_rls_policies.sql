-- SalesPulse Final RLS Policies & Database Triggers
-- Completes the security policies for all tables and adds required triggers

-- Feature_Flags Policies
CREATE POLICY feature_flags_select_policy ON feature_flags
  FOR SELECT USING (
    scope = 'global' AND is_enabled = true OR
    (scope = 'org' AND scope_id = get_auth_user_org_id()) OR
    (scope = 'user' AND scope_id = get_auth_user_id())
  );

CREATE POLICY feature_flags_insert_policy ON feature_flags
  FOR INSERT WITH CHECK (is_admin_or_manager());

CREATE POLICY feature_flags_update_policy ON feature_flags
  FOR UPDATE USING (is_admin_or_manager());

CREATE POLICY feature_flags_delete_policy ON feature_flags
  FOR DELETE USING (get_auth_user_role() = 'admin');

-- Plans Policies
CREATE POLICY plans_select_policy ON plans
  FOR SELECT USING (true);

CREATE POLICY plans_insert_policy ON plans
  FOR INSERT WITH CHECK (get_auth_user_role() = 'admin');

CREATE POLICY plans_update_policy ON plans
  FOR UPDATE USING (get_auth_user_role() = 'admin');

CREATE POLICY plans_delete_policy ON plans
  FOR DELETE USING (get_auth_user_role() = 'admin');

-- Subscriptions Policies
CREATE POLICY subscriptions_select_policy ON subscriptions
  FOR SELECT USING (
    user_id = get_auth_user_id() OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = subscriptions.user_id 
      AND users.org_id = get_auth_user_org_id() 
      AND is_admin_or_manager()
    )
  );

CREATE POLICY subscriptions_insert_policy ON subscriptions
  FOR INSERT WITH CHECK (
    -- Only via webhook or admin
    get_auth_user_role() = 'admin' OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = subscriptions.user_id
      AND users.id = get_auth_user_id()
    )
  );

CREATE POLICY subscriptions_update_policy ON subscriptions
  FOR UPDATE USING (
    -- Only via webhook or admin
    get_auth_user_role() = 'admin'
  );

CREATE POLICY subscriptions_delete_policy ON subscriptions
  FOR DELETE USING (get_auth_user_role() = 'admin');

-- Usage_Records Policies
CREATE POLICY usage_records_select_policy ON usage_records
  FOR SELECT USING (
    user_id = get_auth_user_id() OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = usage_records.user_id
      AND users.org_id = get_auth_user_org_id()
      AND is_admin_or_manager()
    )
  );

CREATE POLICY usage_records_insert_policy ON usage_records
  FOR INSERT WITH CHECK (
    -- Automatic insert or admin
    user_id = get_auth_user_id() OR
    get_auth_user_role() = 'admin'
  );

CREATE POLICY usage_records_update_policy ON usage_records
  FOR UPDATE USING (get_auth_user_role() = 'admin');

CREATE POLICY usage_records_delete_policy ON usage_records
  FOR DELETE USING (get_auth_user_role() = 'admin');

-- Audit_Logs Policies
CREATE POLICY audit_logs_select_policy ON audit_logs
  FOR SELECT USING (get_auth_user_role() = 'admin');

CREATE POLICY audit_logs_insert_policy ON audit_logs
  FOR INSERT WITH CHECK (
    -- System or admin
    get_auth_user_role() = 'admin' OR
    get_auth_user_id() IS NOT NULL
  );

CREATE POLICY audit_logs_update_policy ON audit_logs
  FOR UPDATE USING (false); -- No updates allowed

CREATE POLICY audit_logs_delete_policy ON audit_logs
  FOR DELETE USING (get_auth_user_role() = 'admin');

-- Database Triggers for Auditing and Automation

-- Create audit log function
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
DECLARE
  action_text TEXT;
  target_type TEXT;
BEGIN
  target_type := TG_TABLE_NAME;
  
  IF (TG_OP = 'INSERT') THEN
    action_text := 'Created new ' || target_type;
    INSERT INTO audit_logs (actor_id, action, target_type, target_id)
    VALUES (get_auth_user_id(), action_text, target_type, NEW.id);
  ELSIF (TG_OP = 'UPDATE') THEN
    action_text := 'Updated ' || target_type;
    INSERT INTO audit_logs (actor_id, action, target_type, target_id)
    VALUES (get_auth_user_id(), action_text, target_type, NEW.id);
  ELSIF (TG_OP = 'DELETE') THEN
    action_text := 'Deleted ' || target_type;
    INSERT INTO audit_logs (actor_id, action, target_type, target_id)
    VALUES (get_auth_user_id(), action_text, target_type, OLD.id);
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit triggers for key tables
CREATE TRIGGER users_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON users
FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER organizations_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON organizations
FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER subscriptions_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON subscriptions
FOR EACH ROW EXECUTE FUNCTION create_audit_log();

-- Create usage tracking function for SIMs
CREATE OR REPLACE FUNCTION track_sim_usage()
RETURNS TRIGGER AS $$
BEGIN
  -- Increment usage count
  UPDATE user_sims
  SET usage_count = usage_count + 1
  WHERE user_id = NEW.user_id AND sim_id = NEW.sim_id;
  
  -- Record usage for billing
  INSERT INTO usage_records (user_id, sim_id, usage_date, usage_amount)
  VALUES (NEW.user_id, NEW.sim_id, CURRENT_DATE, 1);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for SIM usage tracking (attach to appropriate tables in your app)
