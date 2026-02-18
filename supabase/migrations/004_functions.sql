-- ============================================================
-- Stored Procedures / RPC Functions
-- File: supabase/migrations/004_functions.sql
-- ============================================================

-- ── Decrement available seats ───────────────────────────────
CREATE OR REPLACE FUNCTION decrement_seats(
  flight_id   UUID,
  cabin_class TEXT,
  count       INT DEFAULT 1
)
RETURNS VOID AS $$
BEGIN
  IF cabin_class = 'main' THEN
    UPDATE flights SET seats_main_available = seats_main_available - count WHERE id = flight_id;
  ELSIF cabin_class = 'comfort_plus' THEN
    UPDATE flights SET seats_comfort_plus_available = seats_comfort_plus_available - count WHERE id = flight_id;
  ELSIF cabin_class = 'first_class' THEN
    UPDATE flights SET seats_first_class_available = seats_first_class_available - count WHERE id = flight_id;
  ELSIF cabin_class = 'delta_one' THEN
    UPDATE flights SET seats_delta_one_available = seats_delta_one_available - count WHERE id = flight_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── Increment miles balance ─────────────────────────────────
CREATE OR REPLACE FUNCTION increment_miles(user_id UUID, amount INT)
RETURNS INT AS $$
DECLARE
  new_balance INT;
BEGIN
  UPDATE profiles
  SET skymiles_balance = skymiles_balance + amount
  WHERE id = user_id
  RETURNING skymiles_balance INTO new_balance;
  RETURN new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── Search flights (callable via supabase.rpc) ──────────────
CREATE OR REPLACE FUNCTION search_flights(
  p_origin      CHAR(3),
  p_destination CHAR(3),
  p_depart_date DATE,
  p_cabin_class TEXT DEFAULT 'main',
  p_passengers  INT  DEFAULT 1
)
RETURNS TABLE (
  flight_id          UUID,
  flight_number      TEXT,
  departure_time     TIMESTAMPTZ,
  arrival_time       TIMESTAMPTZ,
  duration_minutes   INT,
  status             TEXT,
  price              NUMERIC,
  seats_available    INT,
  origin_iata        CHAR(3),
  origin_city        TEXT,
  destination_iata   CHAR(3),
  destination_city   TEXT,
  aircraft_model     TEXT
) AS $$
DECLARE
  v_origin_id      UUID;
  v_dest_id        UUID;
  v_price_col      TEXT;
  v_seat_col       TEXT;
BEGIN
  SELECT id INTO v_origin_id FROM airports WHERE iata_code = UPPER(p_origin);
  SELECT id INTO v_dest_id   FROM airports WHERE iata_code = UPPER(p_destination);

  RETURN QUERY
  SELECT
    f.id,
    f.flight_number,
    f.departure_time,
    f.arrival_time,
    f.duration_minutes,
    f.status,
    CASE p_cabin_class
      WHEN 'main'         THEN f.price_main
      WHEN 'comfort_plus' THEN f.price_comfort_plus
      WHEN 'first_class'  THEN f.price_first_class
      WHEN 'delta_one'    THEN f.price_delta_one
      ELSE f.price_main
    END AS price,
    CASE p_cabin_class
      WHEN 'main'         THEN f.seats_main_available
      WHEN 'comfort_plus' THEN f.seats_comfort_plus_available
      WHEN 'first_class'  THEN f.seats_first_class_available
      WHEN 'delta_one'    THEN f.seats_delta_one_available
      ELSE f.seats_main_available
    END AS seats_available,
    ao.iata_code AS origin_iata,
    ao.city      AS origin_city,
    ad.iata_code AS destination_iata,
    ad.city      AS destination_city,
    ac.model     AS aircraft_model
  FROM flights f
  JOIN airports ao ON ao.id = f.origin_id
  JOIN airports ad ON ad.id = f.destination_id
  LEFT JOIN aircraft ac ON ac.id = f.aircraft_id
  WHERE
    f.origin_id      = v_origin_id
    AND f.destination_id = v_dest_id
    AND f.departure_time::DATE = p_depart_date
    AND f.status != 'cancelled'
    AND (
      CASE p_cabin_class
        WHEN 'main'         THEN f.seats_main_available
        WHEN 'comfort_plus' THEN f.seats_comfort_plus_available
        WHEN 'first_class'  THEN f.seats_first_class_available
        WHEN 'delta_one'    THEN f.seats_delta_one_available
        ELSE f.seats_main_available
      END
    ) >= p_passengers
  ORDER BY f.departure_time ASC;
END;
$$ LANGUAGE plpgsql STABLE;

-- ── Get user dashboard summary ──────────────────────────────
CREATE OR REPLACE FUNCTION get_user_dashboard(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'profile',       (SELECT row_to_json(p) FROM profiles p WHERE p.id = p_user_id),
    'upcoming_trips',(
      SELECT json_agg(b)
      FROM (
        SELECT bo.booking_reference, bo.status, bo.total_price, bo.created_at,
               bf.flight_id,
               f.flight_number, f.departure_time, f.arrival_time,
               ao.iata_code AS origin, ad.iata_code AS destination,
               ao.city AS origin_city, ad.city AS destination_city
        FROM bookings bo
        JOIN booking_flights bf ON bf.booking_id = bo.id AND bf.leg_order = 1
        JOIN flights f ON f.id = bf.flight_id
        JOIN airports ao ON ao.id = f.origin_id
        JOIN airports ad ON ad.id = f.destination_id
        WHERE bo.user_id = p_user_id
          AND bo.status = 'confirmed'
          AND f.departure_time > NOW()
        ORDER BY f.departure_time ASC
        LIMIT 5
      ) b
    ),
    'recent_miles', (
      SELECT json_agg(t)
      FROM (
        SELECT transaction_type, miles, description, created_at
        FROM skymiles_transactions
        WHERE user_id = p_user_id
        ORDER BY created_at DESC
        LIMIT 10
      ) t
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
