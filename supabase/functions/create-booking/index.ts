// ============================================================
// Supabase Edge Function: Create Booking
// File: supabase/functions/create-booking/index.ts
// ============================================================
// POST /functions/v1/create-booking  (requires auth JWT)
// Body: { outboundFlightId, returnFlightId?, cabinClass, passengers[], tripType }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Authenticated client (uses user's JWT from Authorization header)
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    // Service role client for writes that bypass RLS checks mid-transaction
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { outboundFlightId, returnFlightId, cabinClass = "main", passengers, tripType = "round_trip" } =
      await req.json();

    if (!outboundFlightId || !passengers?.length) {
      return new Response(JSON.stringify({ error: "outboundFlightId and passengers are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const priceCol = `price_${cabinClass}`;
    const seatCol  = `seats_${cabinClass}_available`;

    // Fetch outbound flight price
    const { data: outboundFlight, error: flightError } = await supabaseAdmin
      .from("flights")
      .select(`id, ${priceCol}, ${seatCol}, status`)
      .eq("id", outboundFlightId)
      .single();

    if (flightError || !outboundFlight) throw new Error("Outbound flight not found");
    if (outboundFlight.status === "cancelled") throw new Error("Flight is cancelled");
    if (outboundFlight[seatCol] < passengers.length) throw new Error("Not enough seats available");

    let totalPrice = outboundFlight[priceCol] * passengers.length;
    let returnFlight = null;

    if (returnFlightId) {
      const { data: rf, error: rfe } = await supabaseAdmin
        .from("flights")
        .select(`id, ${priceCol}, ${seatCol}, status`)
        .eq("id", returnFlightId)
        .single();
      if (rfe || !rf) throw new Error("Return flight not found");
      if (rf.status === "cancelled") throw new Error("Return flight is cancelled");
      if (rf[seatCol] < passengers.length) throw new Error("Not enough return seats");
      totalPrice += rf[priceCol] * passengers.length;
      returnFlight = rf;
    }

    // Miles to earn: 1 mile per dollar (simplified)
    const milesEarned = Math.floor(totalPrice);

    // ── Create booking ──────────────────────────────────────
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from("bookings")
      .insert({
        user_id:      user.id,
        total_price:  totalPrice,
        cabin_class:  cabinClass,
        trip_type:    tripType,
        status:       "confirmed",
        miles_earned: milesEarned,
      })
      .select()
      .single();

    if (bookingError) throw bookingError;

    // ── Link flights ────────────────────────────────────────
    const flightLinks = [{ booking_id: booking.id, flight_id: outboundFlightId, leg_order: 1 }];
    if (returnFlightId) flightLinks.push({ booking_id: booking.id, flight_id: returnFlightId, leg_order: 2 });

    await supabaseAdmin.from("booking_flights").insert(flightLinks);

    // ── Create passenger records ────────────────────────────
    const passengerRows = passengers.map((p: any, i: number) => ({
      booking_id:      booking.id,
      first_name:      p.firstName,
      last_name:       p.lastName,
      date_of_birth:   p.dateOfBirth,
      passport_number: p.passportNumber,
      nationality:     p.nationality,
      is_primary:      i === 0,
    }));

    await supabaseAdmin.from("passengers").insert(passengerRows);

    // ── Decrement seat counts ───────────────────────────────
    await supabaseAdmin.rpc("decrement_seats", {
      flight_id:   outboundFlightId,
      cabin_class: cabinClass,
      count:       passengers.length,
    });

    if (returnFlightId) {
      await supabaseAdmin.rpc("decrement_seats", {
        flight_id:   returnFlightId,
        cabin_class: cabinClass,
        count:       passengers.length,
      });
    }

    // ── Award SkyMiles ──────────────────────────────────────
    await supabaseAdmin.from("skymiles_transactions").insert({
      user_id:          user.id,
      booking_id:       booking.id,
      transaction_type: "earn",
      miles:            milesEarned,
      description:      `Miles earned for booking ${booking.booking_reference}`,
    });

    await supabaseAdmin
      .from("profiles")
      .update({ skymiles_balance: supabaseAdmin.rpc("increment_miles", { user_id: user.id, amount: milesEarned }) })
      .eq("id", user.id);

    // ── Send notification ───────────────────────────────────
    await supabaseAdmin.from("notifications").insert({
      user_id: user.id,
      type:    "booking_confirmed",
      title:   "Booking Confirmed! ✈️",
      message: `Your booking ${booking.booking_reference} is confirmed. Enjoy your flight!`,
    });

    return new Response(
      JSON.stringify({
        booking_reference: booking.booking_reference,
        booking_id:        booking.id,
        total_price:       totalPrice,
        miles_earned:      milesEarned,
        status:            "confirmed",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
