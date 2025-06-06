-- SalesPulse Row Level Security (RLS) Policies (Continued)
-- Implements remaining multi-tenant security policies

-- Activities Policies
CREATE POLICY activities_select_policy ON activities
  FOR SELECT USING (
    user_id = get_auth_user_id() OR
    (EXISTS (SELECT 1 FROM users WHERE users.id = activities.user_id AND users.org_id = get_auth_user_org_id() AND is_admin_or_manager()))
  );

CREATE POLICY activities_insert_policy ON activities
  FOR INSERT WITH CHECK (user_id = get_auth_user_id());

CREATE POLICY activities_update_policy ON activities
  FOR UPDATE USING (
    (user_id = get_auth_user_id() AND 
     activities.created_at >= NOW() - INTERVAL '24 hours') OR
    (EXISTS (SELECT 1 FROM users WHERE users.id = activities.user_id AND users.org_id = get_auth_user_org_id() AND is_admin_or_manager()))
  );

CREATE POLICY activities_delete_policy ON activities
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = activities.user_id AND users.org_id = get_auth_user_org_id() AND is_admin_or_manager())
  );

-- Referrals Policies
CREATE POLICY referrals_select_policy ON referrals
  FOR SELECT USING (
    user_id = get_auth_user_id() OR
    referred_user_id = get_auth_user_id() OR
    (EXISTS (SELECT 1 FROM users WHERE users.id = referrals.user_id AND users.org_id = get_auth_user_org_id() AND is_admin_or_manager()))
  );

CREATE POLICY referrals_insert_policy ON referrals
  FOR INSERT WITH CHECK (user_id = get_auth_user_id());

CREATE POLICY referrals_update_policy ON referrals
  FOR UPDATE USING (
    user_id = get_auth_user_id() OR
    (EXISTS (SELECT 1 FROM users WHERE users.id = referrals.user_id AND users.org_id = get_auth_user_org_id() AND is_admin_or_manager()))
  );

CREATE POLICY referrals_delete_policy ON referrals
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = referrals.user_id AND users.org_id = get_auth_user_org_id() AND is_admin_or_manager())
  );

-- What_If_Scenarios Policies
CREATE POLICY what_if_scenarios_select_policy ON what_if_scenarios
  FOR SELECT USING (
    user_id = get_auth_user_id() OR
    (get_auth_user_role() = 'admin')
  );

CREATE POLICY what_if_scenarios_insert_policy ON what_if_scenarios
  FOR INSERT WITH CHECK (user_id = get_auth_user_id());

CREATE POLICY what_if_scenarios_update_policy ON what_if_scenarios
  FOR UPDATE USING (user_id = get_auth_user_id());

CREATE POLICY what_if_scenarios_delete_policy ON what_if_scenarios
  FOR DELETE USING (user_id = get_auth_user_id() OR get_auth_user_role() = 'admin');

-- SIM_Templates Policies
CREATE POLICY sim_templates_select_policy ON sim_templates
  FOR SELECT USING (true);

CREATE POLICY sim_templates_insert_policy ON sim_templates
  FOR INSERT WITH CHECK (get_auth_user_role() = 'admin');

CREATE POLICY sim_templates_update_policy ON sim_templates
  FOR UPDATE USING (get_auth_user_role() = 'admin');

CREATE POLICY sim_templates_delete_policy ON sim_templates
  FOR DELETE USING (get_auth_user_role() = 'admin');

-- Threads Policies
CREATE POLICY threads_select_policy ON threads
  FOR SELECT USING (
    org_id = get_auth_user_org_id() AND
    EXISTS (
      SELECT 1 FROM messages 
      WHERE messages.thread_id = threads.id AND
      (messages.sender_id = get_auth_user_id() OR messages.recipient_id = get_auth_user_id())
    ) OR get_auth_user_role() = 'admin'
  );

CREATE POLICY threads_insert_policy ON threads
  FOR INSERT WITH CHECK (org_id = get_auth_user_org_id());

CREATE POLICY threads_update_policy ON threads
  FOR UPDATE USING (org_id = get_auth_user_org_id() AND get_auth_user_role() = 'admin');

CREATE POLICY threads_delete_policy ON threads
  FOR DELETE USING (org_id = get_auth_user_org_id() AND get_auth_user_role() = 'admin');

-- Messages Policies
CREATE POLICY messages_select_policy ON messages
  FOR SELECT USING (
    sender_id = get_auth_user_id() OR 
    recipient_id = get_auth_user_id() OR
    EXISTS (
      SELECT 1 FROM threads 
      WHERE threads.id = messages.thread_id 
      AND threads.org_id = get_auth_user_org_id() 
      AND is_admin_or_manager()
    )
  );

CREATE POLICY messages_insert_policy ON messages
  FOR INSERT WITH CHECK (
    sender_id = get_auth_user_id() AND
    EXISTS (
      SELECT 1 FROM threads 
      WHERE threads.id = messages.thread_id 
      AND threads.org_id = get_auth_user_org_id()
    )
  );

CREATE POLICY messages_update_policy ON messages
  FOR UPDATE USING (
    sender_id = get_auth_user_id() OR 
    recipient_id = get_auth_user_id() OR
    get_auth_user_role() = 'admin'
  );

-- Note: Real-world validation of read/content changes should be done via a trigger or app logic
-- since RLS policies can't reference NEW and OLD in this context

CREATE POLICY messages_delete_policy ON messages
  FOR DELETE USING (get_auth_user_role() = 'admin');
