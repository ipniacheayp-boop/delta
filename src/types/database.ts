// ============================================================
// TypeScript Types
// File: src/types/database.ts
// ============================================================

export type CabinClass = "main" | "comfort_plus" | "first_class" | "delta_one";
export type TripType   = "one_way" | "round_trip" | "multi_city";
export type BookingStatus  = "pending" | "confirmed" | "cancelled" | "completed" | "refunded";
export type FlightStatus   = "scheduled" | "boarding" | "departed" | "arrived" | "cancelled" | "delayed";
export type EliteStatus    = "none" | "silver" | "gold" | "platinum" | "diamond";

export interface Airport {
  id:         string;
  iata_code:  string;
  icao_code:  string;
  name:       string;
  city:       string;
  country:    string;
  timezone:   string;
  latitude:   number;
  longitude:  number;
}

export interface Flight {
  id:                            string;
  flight_number:                 string;
  departure_time:                string;
  arrival_time:                  string;
  duration_minutes:              number;
  status:                        FlightStatus;
  price_main:                    number;
  price_comfort_plus:            number | null;
  price_first_class:             number | null;
  price_delta_one:               number | null;
  seats_main_available:          number;
  seats_comfort_plus_available:  number;
  seats_first_class_available:   number;
  seats_delta_one_available:     number;
  origin:                        { iata_code: string; name: string; city: string };
  destination:                   { iata_code: string; name: string; city: string };
  aircraft:                      { model: string; seat_config: Record<string, number> } | null;
}

export interface Profile {
  id:               string;
  first_name:       string | null;
  last_name:        string | null;
  email:            string;
  phone:            string | null;
  date_of_birth:    string | null;
  passport_number:  string | null;
  nationality:      string | null;
  skymiles_number:  string;
  skymiles_balance: number;
  elite_status:     EliteStatus;
  created_at:       string;
}

export interface Booking {
  id:                string;
  booking_reference: string;
  user_id:           string;
  total_price:       number;
  currency:          string;
  cabin_class:       CabinClass;
  trip_type:         TripType;
  status:            BookingStatus;
  miles_earned:      number;
  created_at:        string;
}

export interface Passenger {
  id:              string;
  booking_id:      string;
  first_name:      string;
  last_name:       string;
  date_of_birth:   string | null;
  passport_number: string | null;
  nationality:     string | null;
  seat_number:     string | null;
  ticket_number:   string;
  is_primary:      boolean;
}

export interface Deal {
  id:               string;
  title:            string;
  description:      string | null;
  price:            number;
  original_price:   number | null;
  discount_percent: number | null;
  cabin_class:      CabinClass;
  badge:            string | null;
  image_url:        string | null;
  valid_from:       string;
  valid_until:      string;
}

export interface SkyMilesTransaction {
  id:               string;
  transaction_type: "earn" | "redeem" | "bonus" | "expire" | "transfer";
  miles:            number;
  description:      string | null;
  created_at:       string;
}

export interface Notification {
  id:         string;
  type:       string;
  title:      string;
  message:    string | null;
  is_read:    boolean;
  created_at: string;
}

// ── Search Params ────────────────────────────────────────────
export interface FlightSearchParams {
  origin:      string;
  destination: string;
  departDate:  string;
  returnDate?: string;
  passengers:  number;
  cabinClass:  CabinClass;
  tripType:    TripType;
}

export interface FlightSearchResults {
  outbound: Flight[];
  return:   Flight[] | null;
  search:   FlightSearchParams;
}

// ── Booking Request ──────────────────────────────────────────
export interface PassengerInput {
  firstName:      string;
  lastName:       string;
  dateOfBirth?:   string;
  passportNumber?: string;
  nationality?:   string;
}

export interface CreateBookingRequest {
  outboundFlightId: string;
  returnFlightId?:  string;
  cabinClass:       CabinClass;
  passengers:       PassengerInput[];
  tripType:         TripType;
}
