// ============================================================
// Supabase Edge Function: Cancel Booking
// File: supabase/functions/cancel-booking/index.ts
// ============================================================
// POST /functions/v1/cancel-booking  (requires auth JWT)
// Body: { bookingId }

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
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { bookingId } = await req.json();

    // Verify ownership
    const { data: booking, error: fetchError } = await supabaseAdmin
      .from("bookings")
      .select("id, user_id, status, miles_earned, total_price, booking_reference")
      .eq("id", bookingId)
      .single();

    if (fetchError || !booking) throw new Error("Booking not found");
    if (booking.user_id !== user.id) throw new Error("Unauthorized");
    if (booking.status === "cancelled") throw new Error("Booking already cancelled");
    if (booking.status === "completed") throw new Error("Cannot cancel completed booking");

    // Cancel the booking
    await supabaseAdmin
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", bookingId);

    // Reverse SkyMiles earned
    if (booking.miles_earned > 0) {
      await supabaseAdmin.from("skymiles_transactions").insert({
        user_id:          user.id,
        booking_id:       bookingId,
        transaction_type: "expire",
        miles:            -booking.miles_earned,
        description:      `Miles reversed for cancelled booking ${booking.booking_reference}`,
      });
    }

    // Notification
    await supabaseAdmin.from("notifications").insert({
      user_id: user.id,
      type:    "booking_cancelled",
      title:   "Booking Cancelled",
      message: `Your booking ${booking.booking_reference} has been cancelled. Refund will process in 7-10 business days.`,
    });

    return new Response(
      JSON.stringify({ success: true, message: "Booking cancelled successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
