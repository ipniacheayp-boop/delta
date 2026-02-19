"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departDate, setDepartDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [tripType, setTripType] = useState<"one_way" | "round_trip">(
    "round_trip",
  );
  const [cabinClass, setCabinClass] = useState("main");
  const [passengers, setPassengers] = useState(1);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Build query params for search results page
      const params = new URLSearchParams({
        origin: origin.toUpperCase(),
        destination: destination.toUpperCase(),
        departDate,
        tripType,
        cabinClass,
        passengers: passengers.toString(),
      });

      if (tripType === "round_trip" && returnDate) {
        params.set("returnDate", returnDate);
      }

      router.push(`/search?${params.toString()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12">
      <header className="mb-8">
        <h1 className="text-4xl font-bold">YourAir — Flights Made Simple</h1>
        <p className="text-slate-600">
          Search flights, manage bookings, and more.
        </p>
      </header>

      <section className="bg-white p-6 rounded shadow mb-6">
        <h2 className="text-2xl font-semibold mb-4">Search Flights</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSearch}
          className="grid grid-cols-1 md:grid-cols-4 gap-3"
        >
          {/* Trip Type */}
          <div className="md:col-span-4 flex gap-4 mb-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="tripType"
                value="round_trip"
                checked={tripType === "round_trip"}
                onChange={(e) => setTripType(e.target.value as "round_trip")}
              />
              Round Trip
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="tripType"
                value="one_way"
                checked={tripType === "one_way"}
                onChange={(e) => setTripType(e.target.value as "one_way")}
              />
              One Way
            </label>
          </div>

          {/* Origin */}
          <input
            placeholder="From (IATA, e.g. ATL)"
            className="p-2 border rounded"
            value={origin}
            onChange={(e) => setOrigin(e.target.value.toUpperCase())}
            maxLength={3}
            required
          />

          {/* Destination */}
          <input
            placeholder="To (IATA, e.g. LAX)"
            className="p-2 border rounded"
            value={destination}
            onChange={(e) => setDestination(e.target.value.toUpperCase())}
            maxLength={3}
            required
          />

          {/* Departure Date */}
          <input
            type="date"
            className="p-2 border rounded"
            value={departDate}
            onChange={(e) => setDepartDate(e.target.value)}
            required
          />

          {/* Return Date (only for round trip) */}
          {tripType === "round_trip" && (
            <input
              type="date"
              className="p-2 border rounded"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              required={tripType === "round_trip"}
            />
          )}

          {/* Cabin Class */}
          <select
            className="p-2 border rounded"
            value={cabinClass}
            onChange={(e) => setCabinClass(e.target.value)}
          >
            <option value="main">Economy</option>
            <option value="comfort_plus">Comfort+</option>
            <option value="first_class">First Class</option>
            <option value="delta_one">Delta One</option>
          </select>

          {/* Passengers */}
          <input
            type="number"
            min="1"
            max="9"
            className="p-2 border rounded"
            value={passengers}
            onChange={(e) => setPassengers(parseInt(e.target.value) || 1)}
            required
          />

          <div className="md:col-span-4 text-right">
            <button
              type="submit"
              disabled={loading}
              className="mt-3 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400"
            >
              {loading ? "Searching..." : "Search Flights"}
            </button>
          </div>
        </form>
      </section>

      <section className="grid md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded shadow">Promotional banner</div>
        <div className="bg-white p-6 rounded shadow">Deals</div>
        <div className="bg-white p-6 rounded shadow">
          Destination inspiration
        </div>
      </section>

      <footer className="mt-12 text-sm text-slate-500">
        <Link href="/admin">Admin Panel</Link>
      </footer>
    </div>
  );
}
