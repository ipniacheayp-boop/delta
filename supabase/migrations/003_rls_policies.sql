-- ============================================================
-- Row Level Security (RLS) Policies
-- File: supabase/migrations/003_rls_policies.sql
-- ============================================================

-- Enable RLS on all user-facing tables
ALTER TABLE profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings             ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_flights      ENABLE ROW LEVEL SECURITY;
ALTER TABLE passengers           ENABLE ROW LEVEL SECURITY;
ALTER TABLE skymiles_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications        ENABLE ROW LEVEL SECURITY;

-- Public read-only tables (no RLS needed, or open read)
ALTER TABLE airports  ENABLE ROW LEVEL SECURITY;
ALTER TABLE flights   ENABLE ROW LEVEL SECURITY;
ALTER TABLE aircraft  ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals     ENABLE ROW LEVEL SECURITY;

-- ── AIRPORTS (public read) ──────────────────────────────────
CREATE POLICY "airports_public_read" ON airports
  FOR SELECT USING (true);

-- ── FLIGHTS (public read) ───────────────────────────────────
CREATE POLICY "flights_public_read" ON flights
  FOR SELECT USING (true);

-- ── AIRCRAFT (public read) ──────────────────────────────────
CREATE POLICY "aircraft_public_read" ON aircraft
  FOR SELECT USING (true);

-- ── DEALS (public read, active only) ───────────────────────
CREATE POLICY "deals_public_read" ON deals
  FOR SELECT USING (is_active = true AND valid_until >= CURRENT_DATE);

-- ── PROFILES ────────────────────────────────────────────────
-- Users can only see and edit their own profile
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- ── BOOKINGS ────────────────────────────────────────────────
CREATE POLICY "bookings_select_own" ON bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "bookings_insert_own" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only cancel their own bookings (not delete)
CREATE POLICY "bookings_update_own" ON bookings
  FOR UPDATE USING (auth.uid() = user_id);

-- ── BOOKING_FLIGHTS ─────────────────────────────────────────
CREATE POLICY "booking_flights_select_own" ON booking_flights
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.id = booking_id AND b.user_id = auth.uid()
    )
  );

CREATE POLICY "booking_flights_insert_own" ON booking_flights
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.id = booking_id AND b.user_id = auth.uid()
    )
  );

-- ── PASSENGERS ──────────────────────────────────────────────
CREATE POLICY "passengers_select_own" ON passengers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.id = booking_id AND b.user_id = auth.uid()
    )
  );

CREATE POLICY "passengers_insert_own" ON passengers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.id = booking_id AND b.user_id = auth.uid()
    )
  );

-- ── SKYMILES TRANSACTIONS ───────────────────────────────────
CREATE POLICY "miles_select_own" ON skymiles_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Only backend (service role) can insert miles transactions
-- Frontend never writes directly to this table

-- ── NOTIFICATIONS ───────────────────────────────────────────
CREATE POLICY "notifications_select_own" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "notifications_update_own" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);
