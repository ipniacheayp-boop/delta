// ============================================================
// Supabase Edge Function: Search Flights
// File: supabase/functions/search-flights/index.ts
// ============================================================
// POST /functions/v1/search-flights
// Body: { origin, destination, departDate, returnDate?, passengers, cabinClass, tripType }

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
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { origin, destination, departDate, returnDate, passengers = 1, cabinClass = "main", tripType = "round_trip" } =
      await req.json();

    if (!origin || !destination || !departDate) {
      return new Response(JSON.stringify({ error: "origin, destination, and departDate are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Look up airport IDs by IATA code
    const { data: airports } = await supabase
      .from("airports")
      .select("id, iata_code")
      .in("iata_code", [origin.toUpperCase(), destination.toUpperCase()]);

    const originAirport      = airports?.find((a) => a.iata_code === origin.toUpperCase());
    const destinationAirport = airports?.find((a) => a.iata_code === destination.toUpperCase());

    if (!originAirport || !destinationAirport) {
      return new Response(JSON.stringify({ error: "Invalid airport code(s)" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Search outbound flights
    const departStart = new Date(departDate);
    departStart.setHours(0, 0, 0, 0);
    const departEnd = new Date(departDate);
    departEnd.setHours(23, 59, 59, 999);

    const seatCol = `seats_${cabinClass}_available`;
    const priceCol = `price_${cabinClass}`;

    const { data: outboundFlights, error: outboundError } = await supabase
      .from("flights")
      .select(`
        id, flight_number, departure_time, arrival_time, duration_minutes, status,
        price_main, price_comfort_plus, price_first_class, price_delta_one,
        seats_main_available, seats_comfort_plus_available,
        seats_first_class_available, seats_delta_one_available,
        origin:airports!flights_origin_id_fkey(iata_code, name, city),
        destination:airports!flights_destination_id_fkey(iata_code, name, city),
        aircraft(model, seat_config)
      `)
      .eq("origin_id", originAirport.id)
      .eq("destination_id", destinationAirport.id)
      .gte("departure_time", departStart.toISOString())
      .lte("departure_time", departEnd.toISOString())
      .neq("status", "cancelled")
      .gt(seatCol, passengers - 1)
      .order("departure_time", { ascending: true });

    if (outboundError) throw outboundError;

    let returnFlights = null;

    // Search return flights if round trip
    if (tripType === "round_trip" && returnDate) {
      const returnStart = new Date(returnDate);
      returnStart.setHours(0, 0, 0, 0);
      const returnEnd = new Date(returnDate);
      returnEnd.setHours(23, 59, 59, 999);

      const { data: returnData, error: returnError } = await supabase
        .from("flights")
        .select(`
          id, flight_number, departure_time, arrival_time, duration_minutes, status,
          price_main, price_comfort_plus, price_first_class, price_delta_one,
          seats_main_available, seats_comfort_plus_available,
          seats_first_class_available, seats_delta_one_available,
          origin:airports!flights_origin_id_fkey(iata_code, name, city),
          destination:airports!flights_destination_id_fkey(iata_code, name, city),
          aircraft(model, seat_config)
        `)
        .eq("origin_id", destinationAirport.id)
        .eq("destination_id", originAirport.id)
        .gte("departure_time", returnStart.toISOString())
        .lte("departure_time", returnEnd.toISOString())
        .neq("status", "cancelled")
        .gt(seatCol, passengers - 1)
        .order("departure_time", { ascending: true });

      if (returnError) throw returnError;
      returnFlights = returnData;
    }

    return new Response(
      JSON.stringify({
        outbound: outboundFlights,
        return:   returnFlights,
        search: { origin, destination, departDate, returnDate, passengers, cabinClass, tripType },
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
