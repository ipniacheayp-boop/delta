// ============================================================
// API Functions  — call Supabase directly or via Edge Functions
// File: src/api/index.ts
// ============================================================

import supabase from "../lib/supabase";
import type {
  FlightSearchParams, FlightSearchResults, CreateBookingRequest,
  Airport, Deal, Profile, Booking, Notification, SkyMilesTransaction,
} from "../types/database";

// ─────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────

/** Sign up with email + password and auto-create profile */
export async function signUp(email: string, password: string, firstName: string, lastName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { first_name: firstName, last_name: lastName } },
  });
  if (error) throw error;

  // Create profile row
  if (data.user) {
    await supabase.from("profiles").insert({
      id:         data.user.id,
      email,
      first_name: firstName,
      last_name:  lastName,
    });
  }

  return data;
}

/** Sign in with email + password */
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

/** Sign out */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/** Get current session */
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

// ─────────────────────────────────────────────────────────────
// AIRPORTS
// ─────────────────────────────────────────────────────────────

/** Get all airports (for autocomplete) */
export async function getAirports(): Promise<Airport[]> {
  const { data, error } = await supabase
    .from("airports")
    .select("*")
    .order("city", { ascending: true });
  if (error) throw error;
  return data;
}

/** Search airports by city or IATA code */
export async function searchAirports(query: string): Promise<Airport[]> {
  const { data, error } = await supabase
    .from("airports")
    .select("*")
    .or(`city.ilike.%${query}%,iata_code.ilike.%${query}%,name.ilike.%${query}%`)
    .limit(8);
  if (error) throw error;
  return data;
}

// ─────────────────────────────────────────────────────────────
// FLIGHT SEARCH
// ─────────────────────────────────────────────────────────────

/** Search available flights via Edge Function */
export async function searchFlights(params: FlightSearchParams): Promise<FlightSearchResults> {
  const { data, error } = await supabase.functions.invoke("search-flights", {
    body: params,
  });
  if (error) throw error;
  if (data.error) throw new Error(data.error);
  return data as FlightSearchResults;
}

/** Get single flight details */
export async function getFlight(flightId: string) {
  const { data, error } = await supabase
    .from("flights")
    .select(`
      *,
      origin:airports!flights_origin_id_fkey(*),
      destination:airports!flights_destination_id_fkey(*),
      aircraft(*)
    `)
    .eq("id", flightId)
    .single();
  if (error) throw error;
  return data;
}

// ─────────────────────────────────────────────────────────────
// DEALS
// ─────────────────────────────────────────────────────────────

/** Get active flight deals */
export async function getDeals(): Promise<Deal[]> {
  const { data, error } = await supabase
    .from("deals")
    .select(`
      *,
      origin:airports!deals_origin_id_fkey(iata_code, city, country),
      destination:airports!deals_destination_id_fkey(iata_code, city, country)
    `)
    .eq("is_active", true)
    .gte("valid_until", new Date().toISOString().split("T")[0])
    .order("discount_percent", { ascending: false })
    .limit(6);
  if (error) throw error;
  return data;
}

// ─────────────────────────────────────────────────────────────
// BOOKINGS
// ─────────────────────────────────────────────────────────────

/** Create a booking via Edge Function */
export async function createBooking(params: CreateBookingRequest) {
  const { data, error } = await supabase.functions.invoke("create-booking", {
    body: params,
  });
  if (error) throw error;
  if (data.error) throw new Error(data.error);
  return data;
}

/** Get all bookings for the current user */
export async function getUserBookings(): Promise<Booking[]> {
  const { data, error } = await supabase
    .from("bookings")
    .select(`
      *,
      booking_flights(
        leg_order,
        flight:flights(
          flight_number, departure_time, arrival_time, status,
          origin:airports!flights_origin_id_fkey(iata_code, city),
          destination:airports!flights_destination_id_fkey(iata_code, city)
        )
      ),
      passengers(first_name, last_name, seat_number, ticket_number, is_primary)
    `)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

/** Get single booking by reference (public lookup) */
export async function getBookingByRef(ref: string) {
  const { data, error } = await supabase
    .from("bookings")
    .select(`
      booking_reference, status, cabin_class, total_price, created_at,
      booking_flights(
        leg_order,
        flight:flights(
          flight_number, departure_time, arrival_time, duration_minutes, status,
          origin:airports!flights_origin_id_fkey(iata_code, name, city),
          destination:airports!flights_destination_id_fkey(iata_code, name, city)
        )
      ),
      passengers(first_name, last_name, seat_number, ticket_number, is_primary)
    `)
    .eq("booking_reference", ref.toUpperCase())
    .single();
  if (error) throw error;
  return data;
}

/** Cancel a booking */
export async function cancelBooking(bookingId: string) {
  const { data, error } = await supabase.functions.invoke("cancel-booking", {
    body: { bookingId },
  });
  if (error) throw error;
  if (data.error) throw new Error(data.error);
  return data;
}

// ─────────────────────────────────────────────────────────────
// PROFILE
// ─────────────────────────────────────────────────────────────

/** Get current user's profile */
export async function getProfile(): Promise<Profile> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  if (error) throw error;
  return data;
}

/** Update profile */
export async function updateProfile(updates: Partial<Profile>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ─────────────────────────────────────────────────────────────
// SKYMILES
// ─────────────────────────────────────────────────────────────

/** Get SkyMiles transaction history */
export async function getSkyMilesHistory(): Promise<SkyMilesTransaction[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("skymiles_transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data;
}

// ─────────────────────────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────────────────────────

/** Get user notifications */
export async function getNotifications(): Promise<Notification[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) throw error;
  return data;
}

/** Mark notification as read */
export async function markNotificationRead(notificationId: string) {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId);
  if (error) throw error;
}
