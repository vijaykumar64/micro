CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN CREATE TYPE property_status AS ENUM ('available','rented','sold','inactive');
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE property_type AS ENUM ('residential','commercial','land');
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS properties (
  id            UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id      UUID          NOT NULL,
  title         VARCHAR(300)  NOT NULL,
  description   TEXT,
  address       VARCHAR(500),
  city          VARCHAR(100),
  state         VARCHAR(100),
  country       VARCHAR(100)  DEFAULT 'India',
  price         NUMERIC(12,2),
  status        property_status DEFAULT 'available',
  property_type property_type   DEFAULT 'residential',
  bedrooms      INT,
  bathrooms     INT,
  area_sqft     NUMERIC(10,2),
  is_deleted    BOOLEAN       NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_properties_owner    ON properties (owner_id);
CREATE INDEX IF NOT EXISTS idx_properties_status   ON properties (status) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_properties_city     ON properties (city)   WHERE is_deleted = false;

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS properties_updated_at ON properties;
CREATE TRIGGER properties_updated_at BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
