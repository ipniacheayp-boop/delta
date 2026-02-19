"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  searchFlights,
  transformFlight,
  Flight,
  FlightSearchParams,
} from "../../lib/api";

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [flights, setFlights] = useState<Flight[]>([]);

  // Search params
  const origin = searchParams.get("origin") || "";
  const destination = searchParams.get("destination") || "";
  const departDate = searchParams.get("departDate") || "";
  const returnDate = searchParams.get("returnDate") || "";
  const tripType = searchParams.get("tripType") || "one_way";
  const cabinClass =
    (searchParams.get("cabinClass") as FlightSearchParams["cabinClass"]) ||
    "main";
  const passengers = parseInt(searchParams.get("passengers") || "1");

  useEffect(() => {
    const fetchFlights = async () => {
      if (!origin || !destination || !departDate) {
        setError("Missing search parameters");
        setLoading(false);
        return;
      }

      try {
        const params: FlightSearchParams = {
          origin,
          destination,
          departDate,
          returnDate: returnDate || undefined,
          passengers,
          cabinClass,
          tripType: tripType as "one_way" | "round_trip" | "multi_city",
        };

        const result = await searchFlights(params);
        setFlights(result.flights.map(transformFlight));
      } catch (err) {
        console.error("Search error:", err);
        setError(
          err instanceof Error ? err.message : "Failed to search flights",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFlights();
  }, [
    origin,
    destination,
    departDate,
    returnDate,
    tripType,
    cabinClass,
    passengers,
  ]);

  const getPrice = (flight: Flight) => {
    switch (cabinClass) {
      case "comfort_plus":
        return flight.priceComfortPlus ?? flight.priceMain;
      case "first_class":
        return flight.priceFirstClass ?? flight.priceMain;
      case "delta_one":
        return flight.priceDeltaOne ?? flight.priceMain;
      default:
        return flight.priceMain;
    }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const handleSelectFlight = (flight: Flight) => {
    const params = new URLSearchParams({
      flightId: flight.id,
      origin,
      destination,
      departDate,
      returnDate: returnDate || "",
      tripType,
      cabinClass,
      passengers: passengers.toString(),
      price: getPrice(flight).toString(),
    });
    router.push(`/booking?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="text-xl">Searching for flights...</div>
        <div className="text-slate-500 mt-2">
          {origin} → {destination} on {formatDate(departDate)}
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <header className="mb-6">
        <Link href="/" className="text-blue-600 hover:underline">
          ← Back to Search
        </Link>
        <h1 className="text-3xl font-bold mt-2">
          {origin} → {destination}
        </h1>
        <p className="text-slate-600">
          {formatDate(departDate)}
          {returnDate && ` - ${formatDate(returnDate)}`}
          {" • "}
          {passengers} passenger{passengers > 1 ? "s" : ""}
          {" • "}
          {cabinClass === "main"
            ? "Economy"
            : cabinClass === "comfort_plus"
              ? "Comfort+"
              : cabinClass === "first_class"
                ? "First Class"
                : "Delta One"}
        </p>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {flights.length === 0 && !error && (
        <div className="text-center py-12 bg-white rounded shadow">
          <div className="text-xl text-slate-600">No flights found</div>
          <p className="text-slate-500 mt-2">Try different dates or airports</p>
          <Link
            href="/"
            className="mt-4 inline-block text-blue-600 hover:underline"
          >
            Search Again
          </Link>
        </div>
      )}

      <div className="space-y-4">
        {flights.map((flight) => (
          <div
            key={flight.id}
            className="bg-white p-6 rounded shadow hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Flight Info */}
              <div className="flex-1">
                <div className="flex items-center gap-6">
                  {/* Departure */}
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {formatTime(flight.departureTime)}
                    </div>
                    <div className="text-slate-600">{flight.originIata}</div>
                    <div className="text-sm text-slate-500">
                      {flight.destinationIata}
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="text-center flex-shrink-0">
                    <div className="text-sm text-slate-500">
                      {Math.floor(flight.durationMinutes / 60)}h{" "}
                      {flight.durationMinutes % 60}m
                    </div>
                    <div className="border-t border-slate-300 w-24 my-1"></div>
                    <div className="text-xs text-slate-500">
                      {flight.flightNumber}
                    </div>
                  </div>

                  {/* Arrival */}
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {formatTime(flight.arrivalTime)}
                    </div>
                    <div className="text-slate-600">
                      {flight.destinationIata}
                    </div>
                    <div className="text-sm text-slate-500">
                      {flight.destinationIata}
                    </div>
                  </div>
                </div>
              </div>

              {/* Price & Select */}
              <div className="flex flex-col items-end gap-2">
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">
                    ${getPrice(flight)}
                  </div>
                  <div className="text-sm text-slate-500">per person</div>
                </div>
                <button
                  onClick={() => handleSelectFlight(flight)}
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Select
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="py-12 text-center">
          <div className="text-xl">Loading...</div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
