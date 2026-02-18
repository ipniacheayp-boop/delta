// ============================================================
// React Hooks — wrap API calls with loading/error state
// File: src/hooks/index.ts
// ============================================================

import { useState, useEffect, useCallback } from "react";
import supabase from "../lib/supabase";
import * as api from "../api";
import type {
  Profile, Booking, Deal, Airport,
  FlightSearchParams, FlightSearchResults,
  Notification,
} from "../types/database";

// ─────────────────────────────────────────────────────────────
// useAuth
// ─────────────────────────────────────────────────────────────
export function useAuth() {
  const [user, setUser]       = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const data = await api.signIn(email, password);
    return data;
  }, []);

  const signUp = useCallback(async (email: string, password: string, firstName: string, lastName: string) => {
    return api.signUp(email, password, firstName, lastName);
  }, []);

  const signOut = useCallback(async () => {
    await api.signOut();
    setUser(null);
  }, []);

  return { user, loading, signIn, signUp, signOut, isAuthenticated: !!user };
}

// ─────────────────────────────────────────────────────────────
// useProfile
// ─────────────────────────────────────────────────────────────
export function useProfile() {
  const [profile, setProfile]   = useState<Profile | null>(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getProfile();
      setProfile(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    const updated = await api.updateProfile(updates);
    setProfile(updated);
    return updated;
  }, []);

  return { profile, loading, error, refetch: fetchProfile, updateProfile };
}

// ─────────────────────────────────────────────────────────────
// useAirports
// ─────────────────────────────────────────────────────────────
export function useAirportSearch(query: string) {
  const [airports, setAirports] = useState<Airport[]>([]);
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    if (!query || query.length < 2) {
      setAirports([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await api.searchAirports(query);
        setAirports(results);
      } catch {
        setAirports([]);
      } finally {
        setLoading(false);
      }
    }, 250); // debounce 250ms

    return () => clearTimeout(timer);
  }, [query]);

  return { airports, loading };
}

// ─────────────────────────────────────────────────────────────
// useFlightSearch
// ─────────────────────────────────────────────────────────────
export function useFlightSearch() {
  const [results, setResults]   = useState<FlightSearchResults | null>(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const search = useCallback(async (params: FlightSearchParams) => {
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const data = await api.searchFlights(params);
      setResults(data);
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { results, loading, error, search };
}

// ─────────────────────────────────────────────────────────────
// useDeals
// ─────────────────────────────────────────────────────────────
export function useDeals() {
  const [deals, setDeals]     = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    api.getDeals()
      .then(setDeals)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { deals, loading, error };
}

// ─────────────────────────────────────────────────────────────
// useBookings
// ─────────────────────────────────────────────────────────────
export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getUserBookings();
      setBookings(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const cancel = useCallback(async (bookingId: string) => {
    await api.cancelBooking(bookingId);
    await fetchBookings(); // refresh list
  }, [fetchBookings]);

  return { bookings, loading, error, refetch: fetchBookings, cancel };
}

// ─────────────────────────────────────────────────────────────
// useCreateBooking
// ─────────────────────────────────────────────────────────────
export function useCreateBooking() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [result, setResult]   = useState<any>(null);

  const createBooking = useCallback(async (params: Parameters<typeof api.createBooking>[0]) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await api.createBooking(params);
      setResult(data);
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createBooking, loading, error, result };
}

// ─────────────────────────────────────────────────────────────
// useNotifications
// ─────────────────────────────────────────────────────────────
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount]     = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.is_read).length);
    } catch {
      // user might not be logged in
    }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  // Realtime subscription for new notifications
  useEffect(() => {
    const channel = supabase
      .channel("notifications")
      .on("postgres_changes", {
        event:  "INSERT",
        schema: "public",
        table:  "notifications",
      }, (payload) => {
        setNotifications((prev) => [payload.new as Notification, ...prev]);
        setUnreadCount((c) => c + 1);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const markRead = useCallback(async (id: string) => {
    await api.markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  }, []);

  return { notifications, unreadCount, markRead, refetch: fetchNotifications };
}
