CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN CREATE TYPE work_item_status AS ENUM ('todo','in_progress','done','blocked');
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE work_item_priority AS ENUM ('low','medium','high','urgent');
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS work_items (
  id           UUID               PRIMARY KEY DEFAULT uuid_generate_v4(),
  title        VARCHAR(300)       NOT NULL,
  description  TEXT,
  assigned_to  UUID,
  assigned_by  UUID               NOT NULL,
  status       work_item_status   DEFAULT 'todo',
  priority     work_item_priority DEFAULT 'medium',
  due_date     DATE,
  created_at   TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ        NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_work_items_assigned_to ON work_items (assigned_to);
CREATE INDEX IF NOT EXISTS idx_work_items_assigned_by ON work_items (assigned_by);
CREATE INDEX IF NOT EXISTS idx_work_items_status      ON work_items (status);

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS work_items_updated_at ON work_items;
CREATE TRIGGER work_items_updated_at BEFORE UPDATE ON work_items
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
