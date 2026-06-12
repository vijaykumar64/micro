CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN CREATE TYPE verification_type AS ENUM ('identity','address','employment','property');
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE verification_status AS ENUM ('pending','in_review','approved','rejected');
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS verification_requests (
  id           UUID                PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID                NOT NULL,
  type         verification_type   NOT NULL,
  status       verification_status DEFAULT 'pending',
  notes        TEXT,
  reviewed_by  UUID,
  reviewed_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verif_user_id ON verification_requests (user_id);
CREATE INDEX IF NOT EXISTS idx_verif_status  ON verification_requests (status);

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS verif_updated_at ON verification_requests;
CREATE TRIGGER verif_updated_at BEFORE UPDATE ON verification_requests
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
