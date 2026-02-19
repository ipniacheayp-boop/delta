"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  createBooking,
  getFlights,
  transformFlight,
  Flight,
  PassengerInput,
} from "../../lib/api";

function BookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [bookingRef, setBookingRef] = useState("");

  // Search params from URL
  const flightId = searchParams.get("flightId") || "";
  const origin = searchParams.get("origin") || "";
  const destination = searchParams.get("destination") || "";
  const departDate = searchParams.get("departDate") || "";
  const returnDate = searchParams.get("returnDate") || "";
  const tripType = searchParams.get("tripType") || "one_way";
  const cabinClass = searchParams.get("cabinClass") || "main";
  const passengers = parseInt(searchParams.get("passengers") || "1");
  const price = parseFloat(searchParams.get("price") || "0");

  const [flight, setFlight] = useState<Flight | null>(null);

  // Passenger info state
  const [passengerData, setPassengerData] = useState<PassengerInput[]>([]);

  useEffect(() => {
    // Initialize passenger data array
    const initial: PassengerInput[] = [];
    for (let i = 0; i < passengers; i++) {
      initial.push({ firstName: "", lastName: "" });
    }
    setPassengerData(initial);

    // Fetch flight details
    const fetchFlight = async () => {
      if (!flightId) return;

      try {
        const result = await getFlights();
        const found = result.flights
          .map(transformFlight)
          .find((f) => f.id === flightId);
        if (found) {
          setFlight(found);
        }
      } catch (err) {
        console.error("Failed to fetch flight:", err);
      }
    };

    fetchFlight();
  }, [flightId, passengers]);

  const updatePassenger = (
    index: number,
    field: keyof PassengerInput,
    value: string,
  ) => {
    const updated = [...passengerData];
    updated[index] = { ...updated[index], [field]: value };
    setPassengerData(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      // Validate passengers
      for (const p of passengerData) {
        if (!p.firstName || !p.lastName) {
          setError("Please fill in all passenger names");
          setSubmitting(false);
          return;
        }
      }

      const result = await createBooking({
        outboundFlightId: flightId,
        returnFlightId: undefined,
        cabinClass: cabinClass as
          | "main"
          | "comfort_plus"
          | "first_class"
          | "delta_one",
        passengers: passengerData,
        tripType: tripType as "one_way" | "round_trip" | "multi_city",
        totalPrice: price * passengers,
      });

      setBookingRef(result.booking.booking_reference);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!flightId) {
    return (
      <div className="py-12 text-center">
        <div className="text-xl text-red-600">No flight selected</div>
        <Link
          href="/"
          className="mt-4 inline-block text-blue-600 hover:underline"
        >
          Search for flights
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="py-12 text-center">
        <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded inline-block">
          <div className="text-2xl font-bold mb-2">Booking Confirmed!</div>
          <div className="text-lg">
            Your booking reference is:{" "}
            <span className="font-bold">{bookingRef}</span>
          </div>
        </div>
        <div className="mt-6">
          <Link href="/" className="text-blue-600 hover:underline">
            Book another flight
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <header className="mb-6">
        <Link href="/search" className="text-blue-600 hover:underline">
          ← Back to Search Results
        </Link>
        <h1 className="text-3xl font-bold mt-2">Complete Your Booking</h1>
      </header>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Flight Summary */}
        <div className="md:col-span-2">
          {flight && (
            <div className="bg-white p-6 rounded shadow mb-6">
              <h2 className="text-xl font-semibold mb-4">Flight Details</h2>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="text-2xl font-bold">
                      {formatTime(flight.departureTime)}
                    </div>
                    <div className="text-slate-600">{flight.originIata}</div>
                    <div className="text-sm text-slate-500">
                      {flight.originIata}
                    </div>
                  </div>
                  <div className="text-center px-4">
                    <div className="text-sm text-slate-500">
                      {Math.floor(flight.durationMinutes / 60)}h{" "}
                      {flight.durationMinutes % 60}m
                    </div>
                    <div className="border-t border-slate-300 w-16 my-1"></div>
                    <div className="text-xs text-slate-500">
                      {flight.flightNumber}
                    </div>
                  </div>
                  <div>
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
                <div className="text-right">
                  <div className="text-sm text-slate-500">
                    {formatDate(departDate)}
                  </div>
                  <div className="text-lg font-semibold mt-1">
                    {cabinClass === "main"
                      ? "Economy"
                      : cabinClass === "comfort_plus"
                        ? "Comfort+"
                        : cabinClass === "first_class"
                          ? "First Class"
                          : "Delta One"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Passenger Information Form */}
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">
              Passenger Information
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {passengerData.map((passenger, index) => (
                <div
                  key={index}
                  className="mb-6 pb-6 border-b border-slate-200 last:border-0"
                >
                  <h3 className="font-medium mb-3">Passenger {index + 1}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded"
                        value={passenger.firstName}
                        onChange={(e) =>
                          updatePassenger(index, "firstName", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded"
                        value={passenger.lastName}
                        onChange={(e) =>
                          updatePassenger(index, "lastName", e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 disabled:bg-blue-400"
              >
                {submitting
                  ? "Processing..."
                  : `Complete Booking - $${(price * passengers).toFixed(2)}`}
              </button>
            </form>
          </div>
        </div>

        {/* Price Summary */}
        <div>
          <div className="bg-white p-6 rounded shadow sticky top-4">
            <h2 className="text-xl font-semibold mb-4">Price Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>
                  Flight ({passengers} passenger{passengers > 1 ? "s" : ""})
                </span>
                <span>${(price * passengers).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Taxes & Fees</span>
                <span>$0.00</span>
              </div>
              <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-blue-600">
                  ${(price * passengers).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="py-12 text-center">
          <div className="text-xl">Loading...</div>
        </div>
      }
    >
      <BookingContent />
    </Suspense>
  );
}
