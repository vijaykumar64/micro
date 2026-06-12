CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS files (
  id            UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID          NOT NULL,
  original_name VARCHAR(500)  NOT NULL,
  stored_name   VARCHAR(500)  NOT NULL UNIQUE,
  mime_type     VARCHAR(100)  NOT NULL,
  size_bytes    BIGINT        NOT NULL,
  storage_path  VARCHAR(1000) NOT NULL,
  is_deleted    BOOLEAN       NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_files_user_id     ON files (user_id);
CREATE INDEX IF NOT EXISTS idx_files_user_active ON files (user_id, is_deleted) WHERE is_deleted = false;

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS files_updated_at ON files;
CREATE TRIGGER files_updated_at
  BEFORE UPDATE ON files
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
