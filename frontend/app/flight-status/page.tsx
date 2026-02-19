"use client";

import { useState } from "react";
import Link from "next/link";
import {
  getFlightStatusByNumber,
  getFlightStatusByRoute,
  FlightStatusResult,
} from "../../lib/api";

export default function FlightStatusPage() {
  const [searchType, setSearchType] = useState<"flight" | "route">("flight");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [flights, setFlights] = useState<FlightStatusResult[]>([]);
  const [searched, setSearched] = useState(false);

  // Flight number search
  const [flightNumber, setFlightNumber] = useState("");

  // Route search
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFlights([]);
    setSearched(false);

    if (searchType === "flight" && !flightNumber) {
      setError("Please enter a flight number");
      return;
    }

    if (searchType === "route" && (!origin || !destination)) {
      setError("Please enter origin and destination");
      return;
    }

    setLoading(true);

    try {
      let result;
      if (searchType === "flight") {
        result = await getFlightStatusByNumber(flightNumber);
      } else {
        result = await getFlightStatusByRoute(
          origin,
          destination,
          date || undefined,
        );
      }
      setFlights(result.flights);
      setSearched(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to search flight status",
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ON_TIME":
      case "SCHEDULED":
        return "bg-green-100 text-green-800 border-green-200";
      case "DELAYED":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      case "DEPARTED":
      case "ARRIVED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "BOARDING":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">D</span>
              </div>
              <span className="text-2xl font-bold text-slate-800">Delta</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-slate-600 hover:text-red-600">
                Book
              </Link>
              <Link href="/flight-status" className="text-red-600 font-medium">
                Flight Status
              </Link>
              <Link
                href="/my-trips"
                className="text-slate-600 hover:text-red-600"
              >
                My Trips
              </Link>
              <Link href="/admin" className="text-slate-600 hover:text-red-600">
                Admin
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-red-600 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Flight Status
          </h1>
          <p className="text-red-100 text-lg">Track your flight in real-time</p>
        </div>
      </section>

      {/* Search Form */}
      <section className="max-w-4xl mx-auto px-4 -mt-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Search Type Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setSearchType("flight")}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                searchType === "flight"
                  ? "bg-red-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              By Flight Number
            </button>
            <button
              type="button"
              onClick={() => setSearchType("route")}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                searchType === "route"
                  ? "bg-red-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              By Route
            </button>
          </div>

          <form onSubmit={handleSearch}>
            {searchType === "flight" ? (
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Flight Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., DL1234"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    value={flightNumber}
                    onChange={(e) =>
                      setFlightNumber(e.target.value.toUpperCase())
                    }
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:bg-red-400"
                  >
                    {loading ? "Searching..." : "Search"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    From
                  </label>
                  <input
                    type="text"
                    placeholder="ATL"
                    maxLength={3}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value.toUpperCase())}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    To
                  </label>
                  <input
                    type="text"
                    placeholder="LAX"
                    maxLength={3}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    value={destination}
                    onChange={(e) =>
                      setDestination(e.target.value.toUpperCase())
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Date (optional)
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-4 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:bg-red-400"
                  >
                    {loading ? "Searching..." : "Search"}
                  </button>
                </div>
              </div>
            )}
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}
        </div>
      </section>

      {/* Results */}
      {searched && (
        <section className="max-w-4xl mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">
            {flights.length > 0
              ? `${flights.length} Flight${flights.length > 1 ? "s" : ""} Found`
              : "No Flights Found"}
          </h2>

          {flights.length === 0 && !error && (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-slate-600">
                No flights match your search criteria. Please try different
                search terms.
              </p>
            </div>
          )}

          <div className="space-y-4">
            {flights.map((flight) => (
              <div
                key={flight.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    {/* Flight Info */}
                    <div className="flex items-center gap-8">
                      <div>
                        <div className="text-lg font-bold text-slate-800">
                          {flight.flightNumber}
                        </div>
                        <div className="text-sm text-slate-500">
                          Delta Air Lines
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        {/* Departure */}
                        <div className="text-center">
                          <div className="text-2xl font-bold text-slate-800">
                            {formatTime(flight.departureTime)}
                          </div>
                          <div className="text-lg font-medium text-slate-600">
                            {flight.originIata}
                          </div>
                          <div className="text-sm text-slate-500">
                            {formatDate(flight.departureTime)}
                          </div>
                        </div>

                        {/* Duration indicator */}
                        <div className="text-center px-4">
                          <div className="text-sm text-slate-500">
                            {flight.status === "CANCELLED"
                              ? "Cancelled"
                              : "Scheduled"}
                          </div>
                          <div className="w-24 border-t-2 border-slate-300 my-2"></div>
                          <div className="text-xs text-slate-500">
                            {flight.status === "ARRIVED"
                              ? "Arrived"
                              : "Departure"}
                          </div>
                        </div>

                        {/* Arrival */}
                        <div className="text-center">
                          <div className="text-2xl font-bold text-slate-800">
                            {formatTime(flight.arrivalTime)}
                          </div>
                          <div className="text-lg font-medium text-slate-600">
                            {flight.destinationIata}
                          </div>
                          <div className="text-sm text-slate-500">
                            {formatDate(flight.arrivalTime)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="text-right">
                      <span
                        className={`inline-block px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(
                          flight.status,
                        )}`}
                      >
                        {flight.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>

                  {/* Timeline Progress Bar */}
                  {flight.status !== "CANCELLED" &&
                    flight.status !== "SCHEDULED" && (
                      <div className="mt-6">
                        <div className="relative">
                          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-500 ${
                                flight.status === "ARRIVED"
                                  ? "w-full bg-green-500"
                                  : flight.status === "DEPARTED"
                                    ? "w-2/3 bg-blue-500"
                                    : flight.status === "BOARDING"
                                      ? "w-1/3 bg-purple-500"
                                      : "w-1/6 bg-yellow-500"
                              }`}
                            ></div>
                          </div>
                          <div className="flex justify-between mt-2 text-xs text-slate-500">
                            <span>Scheduled</span>
                            <span>Boarding</span>
                            <span>Departed</span>
                            <span>Arrived</span>
                          </div>
                        </div>
                      </div>
                    )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-slate-800 text-slate-400 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>© 2024 Delta Air Lines. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
