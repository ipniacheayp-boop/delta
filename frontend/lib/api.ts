// ============================================================
// API Client for Frontend - connects to Express backend
// File: frontend/lib/api.ts
// ============================================================

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

// Generic fetch wrapper
async function apiFetch<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...opts.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }

  return res.json();
}

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  passengers: number;
  cabinClass: "main" | "comfort_plus" | "first_class" | "delta_one";
  tripType: "one_way" | "round_trip" | "multi_city";
}

export interface Flight {
  id: string;
  flightNumber: string;
  originIata: string;
  destinationIata: string;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  status: string;
  priceMain: number;
  priceComfortPlus: number | null;
  priceFirstClass: number | null;
  priceDeltaOne: number | null;
  seatsMainAvailable: number;
  seatsComfortPlusAvailable: number;
  seatsFirstClassAvailable: number;
  seatsDeltaOneAvailable: number;
}

// Transform backend snake_case response to camelCase for internal use
export function transformFlight(flight: any): Flight {
  return {
    id: flight.id,
    flightNumber: flight.flightNumber || flight.flight_number,
    originIata: flight.originIata || flight.origin_iata,
    destinationIata: flight.destinationIata || flight.destination_iata,
    departureTime: flight.departureTime || flight.departure_time,
    arrivalTime: flight.arrivalTime || flight.arrival_time,
    durationMinutes: flight.durationMinutes || flight.duration_minutes,
    status: flight.status,
    priceMain: flight.priceMain || flight.price_main,
    priceComfortPlus: flight.priceComfortPlus ?? flight.price_comfort_plus,
    priceFirstClass: flight.priceFirstClass ?? flight.price_first_class,
    priceDeltaOne: flight.priceDeltaOne ?? flight.price_delta_one,
    seatsMainAvailable:
      flight.seatsMainAvailable ?? flight.seats_main_available,
    seatsComfortPlusAvailable:
      flight.seatsComfortPlusAvailable ?? flight.seats_comfort_plus_available,
    seatsFirstClassAvailable:
      flight.seatsFirstClassAvailable ?? flight.seats_first_class_available,
    seatsDeltaOneAvailable:
      flight.seatsDeltaOneAvailable ?? flight.seats_delta_one_available,
  };
}

export interface FlightSearchResults {
  flights: Flight[];
  search: FlightSearchParams;
}

export interface PassengerInput {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  passportNumber?: string;
  nationality?: string;
}

export interface CreateBookingRequest {
  outboundFlightId: string;
  returnFlightId?: string;
  cabinClass: "main" | "comfort_plus" | "first_class" | "delta_one";
  passengers: PassengerInput[];
  tripType: "one_way" | "round_trip" | "multi_city";
  totalPrice: number;
  currency?: string;
}

export interface Booking {
  id: string;
  booking_reference: string;
  user_id: string;
  total_price: number;
  currency: string;
  cabin_class: string;
  trip_type: string;
  status: string;
  payment_status?: string;
  miles_earned: number;
  created_at: string;
  passengers?: unknown;
  seat_assignments?: unknown;
}

export function transformBooking(booking: any): Booking {
  return {
    id: booking.id,
    booking_reference: booking.booking_reference ?? booking.bookingReference,
    user_id: booking.user_id ?? booking.userId,
    total_price: booking.total_price ?? booking.totalPrice,
    currency: booking.currency,
    cabin_class: booking.cabin_class ?? booking.cabinClass,
    trip_type: booking.trip_type ?? booking.tripType,
    status: booking.status,
    payment_status: booking.payment_status ?? booking.paymentStatus,
    miles_earned: booking.miles_earned ?? booking.milesEarned ?? 0,
    created_at: booking.created_at ?? booking.createdAt,
    passengers: booking.passengers,
    seat_assignments: booking.seat_assignments ?? booking.seatAssignments,
  };
}

// ─────────────────────────────────────────────────────────────
// Flight API
// ─────────────────────────────────────────────────────────────

/** Search flights */
export async function searchFlights(
  params: FlightSearchParams,
): Promise<FlightSearchResults> {
  return apiFetch<FlightSearchResults>("/flights", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

/** Get all flights (for testing/browsing) */
export async function getFlights(): Promise<{ flights: Flight[] }> {
  return apiFetch<{ flights: Flight[] }>("/flights");
}

// ─────────────────────────────────────────────────────────────
// Booking API
// ─────────────────────────────────────────────────────────────

/** Create a booking */
export async function createBooking(
  params: CreateBookingRequest,
): Promise<{ booking: Booking }> {
  const res = await apiFetch<{ booking: any }>("/bookings", {
    method: "POST",
    body: JSON.stringify(params),
  });
  return { booking: transformBooking(res.booking) };
}

/** Get booking by PNR */
export async function getBookingByPnr(
  pnr: string,
): Promise<{ booking: Booking }> {
  const res = await apiFetch<{ booking: any }>(`/bookings/pnr/${pnr}`);
  return { booking: transformBooking(res.booking) };
}

/** Cancel a booking */
export async function cancelBooking(
  bookingId: string,
): Promise<{ booking: Booking }> {
  const res = await apiFetch<{ booking: any }>(`/bookings/${bookingId}/cancel`, {
    method: "PATCH",
  });
  return { booking: transformBooking(res.booking) };
}

/** Pay for a booking (mock) */
export async function payBooking(
  bookingId: string,
): Promise<{ booking: Booking }> {
  const res = await apiFetch<{ booking: any }>(`/bookings/${bookingId}/pay`, {
    method: "POST",
  });
  return { booking: transformBooking(res.booking) };
}

/** Reserve a seat */
export async function reserveSeat(
  bookingId: string,
  flightId: string,
  seat: string,
): Promise<{ ok: boolean; booking: Booking }> {
  const res = await apiFetch<{ ok: boolean; booking: any }>(
    `/bookings/${bookingId}/reserve-seat`,
    {
      method: "POST",
      body: JSON.stringify({ flightId, seat }),
    },
  );
  return { ok: res.ok, booking: transformBooking(res.booking) };
}

// ─────────────────────────────────────────────────────────────
// Flight Status API
// ─────────────────────────────────────────────────────────────

export interface FlightStatusResult {
  id: string;
  flightNumber: string;
  originIata: string;
  destinationIata: string;
  departureTime: string;
  arrivalTime: string;
  status: string;
}

/** Get flight status by flight number */
export async function getFlightStatusByNumber(
  flightNumber: string,
): Promise<{ flights: FlightStatusResult[] }> {
  return apiFetch<{ flights: FlightStatusResult[] }>(
    `/flight-status/flight/${encodeURIComponent(flightNumber)}`,
  );
}

/** Get flight status by route */
export async function getFlightStatusByRoute(
  origin: string,
  destination: string,
  date?: string,
): Promise<{ flights: FlightStatusResult[] }> {
  const params = new URLSearchParams({
    origin,
    destination,
  });
  if (date) {
    params.set("date", date);
  }
  return apiFetch<{ flights: FlightStatusResult[] }>(
    `/flight-status/route?${params.toString()}`,
  );
}

// ─────────────────────────────────────────────────────────────
// Admin API
// ─────────────────────────────────────────────────────────────

export interface AdminStats {
  users: number;
  flights: number;
  bookings: number;
}

export interface AdminUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  created_at: string;
}

export interface AdminBooking {
  id: string;
  booking_reference: string;
  user_id: string;
  total_price: number;
  currency: string;
  cabin_class: string;
  trip_type: string;
  status: string;
  paymentStatus: string;
  created_at: string;
  user?: {
    email: string;
    firstName: string;
    lastName: string;
  };
}

/** Get admin statistics */
export async function getAdminStats(): Promise<AdminStats> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return apiFetch<AdminStats>("/admin/stats", {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

/** Get all users (admin only) */
export async function getAllUsers(): Promise<{ users: AdminUser[] }> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return apiFetch<{ users: AdminUser[] }>("/admin/users", {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

/** Get all bookings (admin only) */
export async function getAllBookings(): Promise<{ bookings: AdminBooking[] }> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return apiFetch<{ bookings: AdminBooking[] }>("/admin/bookings", {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

/** Update user role (admin only) */
export async function updateUserRole(
  userId: string,
  role: string,
): Promise<{ user: AdminUser }> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return apiFetch<{ user: AdminUser }>(`/admin/users/${userId}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}
