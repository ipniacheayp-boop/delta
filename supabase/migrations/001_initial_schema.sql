-- ============================================================
-- Delta Replica — Supabase Database Schema
-- File: supabase/migrations/001_initial_schema.sql
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────
-- 1. AIRPORTS
-- ─────────────────────────────────────────
CREATE TABLE airports (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  iata_code   CHAR(3) UNIQUE NOT NULL,        -- e.g. JFK, LAX, CDG
  icao_code   CHAR(4),
  name        TEXT NOT NULL,                   -- John F. Kennedy International
  city        TEXT NOT NULL,
  country     TEXT NOT NULL,
  timezone    TEXT NOT NULL,                   -- America/New_York
  latitude    NUMERIC(9,6),
  longitude   NUMERIC(9,6),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- 2. AIRCRAFT
-- ─────────────────────────────────────────
CREATE TABLE aircraft (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registration    TEXT UNIQUE NOT NULL,       -- N123DA
  model           TEXT NOT NULL,             -- Boeing 737-900ER
  total_seats     INT NOT NULL,
  seat_config     JSONB,                     -- { "first": 16, "comfort_plus": 48, "main": 156 }
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- 3. FLIGHTS
-- ─────────────────────────────────────────
CREATE TABLE flights (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flight_number       TEXT NOT NULL,                        -- DL 401
  origin_id           UUID REFERENCES airports(id),
  destination_id      UUID REFERENCES airports(id),
  aircraft_id         UUID REFERENCES aircraft(id),
  departure_time      TIMESTAMPTZ NOT NULL,
  arrival_time        TIMESTAMPTZ NOT NULL,
  duration_minutes    INT GENERATED ALWAYS AS (
                        EXTRACT(EPOCH FROM (arrival_time - departure_time)) / 60
                      )::INT STORED,
  status              TEXT DEFAULT 'scheduled'              -- scheduled | boarding | departed | arrived | cancelled | delayed
                        CHECK (status IN ('scheduled','boarding','departed','arrived','cancelled','delayed')),
  -- Pricing per cabin
  price_main          NUMERIC(10,2) NOT NULL,
  price_comfort_plus  NUMERIC(10,2),
  price_first_class   NUMERIC(10,2),
  price_delta_one     NUMERIC(10,2),
  -- Seat availability
  seats_main_available          INT NOT NULL DEFAULT 0,
  seats_comfort_plus_available  INT NOT NULL DEFAULT 0,
  seats_first_class_available   INT NOT NULL DEFAULT 0,
  seats_delta_one_available     INT NOT NULL DEFAULT 0,

  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_flights_origin      ON flights(origin_id);
CREATE INDEX idx_flights_destination ON flights(destination_id);
CREATE INDEX idx_flights_departure   ON flights(departure_time);
CREATE INDEX idx_flights_status      ON flights(status);

-- ─────────────────────────────────────────
-- 4. USERS (extends Supabase auth.users)
-- ─────────────────────────────────────────
CREATE TABLE profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name      TEXT,
  last_name       TEXT,
  email           TEXT UNIQUE NOT NULL,
  phone           TEXT,
  date_of_birth   DATE,
  passport_number TEXT,
  nationality     TEXT,
  -- SkyMiles
  skymiles_number TEXT UNIQUE DEFAULT 'DL' || LPAD(FLOOR(RANDOM() * 1000000000)::TEXT, 9, '0'),
  skymiles_balance INT DEFAULT 0,
  elite_status    TEXT DEFAULT 'none'
                    CHECK (elite_status IN ('none','silver','gold','platinum','diamond')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- 5. BOOKINGS
-- ─────────────────────────────────────────
CREATE TABLE bookings (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_reference TEXT UNIQUE NOT NULL DEFAULT UPPER(SUBSTR(MD5(RANDOM()::TEXT), 1, 6)),
  user_id           UUID REFERENCES profiles(id),
  total_price       NUMERIC(10,2) NOT NULL,
  currency          TEXT DEFAULT 'USD',
  cabin_class       TEXT NOT NULL
                      CHECK (cabin_class IN ('main','comfort_plus','first_class','delta_one')),
  trip_type         TEXT NOT NULL CHECK (trip_type IN ('one_way','round_trip','multi_city')),
  status            TEXT DEFAULT 'confirmed'
                      CHECK (status IN ('pending','confirmed','cancelled','completed','refunded')),
  miles_earned      INT DEFAULT 0,
  payment_intent_id TEXT,                  -- Stripe Payment Intent ID
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bookings_user   ON bookings(user_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_ref    ON bookings(booking_reference);

-- ─────────────────────────────────────────
-- 6. BOOKING FLIGHTS (supports multi-city)
-- ─────────────────────────────────────────
CREATE TABLE booking_flights (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id  UUID REFERENCES bookings(id) ON DELETE CASCADE,
  flight_id   UUID REFERENCES flights(id),
  leg_order   INT NOT NULL DEFAULT 1,         -- 1 = outbound, 2 = return, 3+ = multi-city
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- 7. PASSENGERS
-- ─────────────────────────────────────────
CREATE TABLE passengers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id      UUID REFERENCES bookings(id) ON DELETE CASCADE,
  first_name      TEXT NOT NULL,
  last_name       TEXT NOT NULL,
  date_of_birth   DATE,
  passport_number TEXT,
  nationality     TEXT,
  seat_number     TEXT,                      -- e.g. 12A
  ticket_number   TEXT UNIQUE DEFAULT 'DL' || LPAD(FLOOR(RANDOM() * 10000000000)::TEXT, 10, '0'),
  is_primary      BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_passengers_booking ON passengers(booking_id);

-- ─────────────────────────────────────────
-- 8. DEALS / PROMOTIONS
-- ─────────────────────────────────────────
CREATE TABLE deals (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title               TEXT NOT NULL,
  description         TEXT,
  origin_id           UUID REFERENCES airports(id),
  destination_id      UUID REFERENCES airports(id),
  price               NUMERIC(10,2) NOT NULL,
  original_price      NUMERIC(10,2),
  discount_percent    INT,
  cabin_class         TEXT DEFAULT 'main',
  badge               TEXT,                  -- SALE, HOT, NEW ROUTE, DEAL
  image_url           TEXT,
  valid_from          DATE NOT NULL,
  valid_until         DATE NOT NULL,
  is_active           BOOLEAN DEFAULT TRUE,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- 9. SKYMILES TRANSACTIONS
-- ─────────────────────────────────────────
CREATE TABLE skymiles_transactions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES profiles(id),
  booking_id      UUID REFERENCES bookings(id),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earn','redeem','bonus','expire','transfer')),
  miles           INT NOT NULL,
  description     TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- 10. NOTIFICATIONS
-- ─────────────────────────────────────────
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES profiles(id),
  type        TEXT NOT NULL,     -- booking_confirmed | flight_update | check_in_open | deal
  title       TEXT NOT NULL,
  message     TEXT,
  is_read     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- AUTO-UPDATE updated_at TRIGGER
-- ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_flights_updated_at   BEFORE UPDATE ON flights   FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_bookings_updated_at  BEFORE UPDATE ON bookings  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_profiles_updated_at  BEFORE UPDATE ON profiles  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
