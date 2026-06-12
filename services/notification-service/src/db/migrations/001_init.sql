CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN CREATE TYPE notification_type AS ENUM ('email','sms','push','in_app');
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE notification_status AS ENUM ('pending','sent','failed','read');
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS notifications (
  id         UUID                 PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID                 NOT NULL,
  type       notification_type    DEFAULT 'in_app',
  title      VARCHAR(300)         NOT NULL,
  message    TEXT                 NOT NULL,
  status     notification_status  DEFAULT 'sent',
  metadata   JSONB,
  created_at TIMESTAMPTZ          NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notification_preferences (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID        NOT NULL UNIQUE,
  email_enabled    BOOLEAN     NOT NULL DEFAULT true,
  sms_enabled      BOOLEAN     NOT NULL DEFAULT false,
  push_enabled     BOOLEAN     NOT NULL DEFAULT true,
  in_app_enabled   BOOLEAN     NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status  ON notifications (user_id, status);

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS notif_prefs_updated_at ON notification_preferences;
CREATE TRIGGER notif_prefs_updated_at BEFORE UPDATE ON notification_preferences
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
