CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS audit_logs (
  id            UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID,
  action        VARCHAR(100) NOT NULL,
  service       VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100),
  resource_id   UUID,
  changes       JSONB,
  ip_address    INET,
  user_agent    TEXT,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_user_id       ON audit_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_service       ON audit_logs (service, resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_created_at    ON audit_logs (created_at DESC);
