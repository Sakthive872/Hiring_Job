CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_profiles_location ON profiles(location);
CREATE INDEX idx_jobs_title ON jobs(title);
CREATE INDEX idx_jobs_company_id ON jobs(company_id);
CREATE INDEX idx_company_members_company ON company_members(company_id);
CREATE INDEX idx_notification_created_at ON notifications(created_at DESC);
