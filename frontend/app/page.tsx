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
  const [activeTab, setActiveTab] = useState("book");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
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
    <div>
      {/* Hero Section - Dark Background */}
      <section className="relative bg-[#141413] min-h-[650px]">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d]"></div>
          {/* Subtle pattern overlay */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-rule='evenodd'/%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          {/* Hero Text */}
          <div className="text-center mb-10">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight">
              Let's Go
            </h1>
            <p className="text-xl text-gray-300">
              Book flights, check status, manage trips and more
            </p>
          </div>

          {/* Search Widget - Delta Style */}
          <div className="bg-white rounded-lg shadow-2xl max-w-5xl mx-auto overflow-hidden">
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab("book")}
                className={`flex-1 py-5 px-6 font-bold text-center transition-colors ${
                  activeTab === "book"
                    ? "bg-[#C8102E] text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                BOOK A FLIGHT
              </button>
              <button
                onClick={() => setActiveTab("status")}
                className={`flex-1 py-5 px-6 font-bold text-center transition-colors ${
                  activeTab === "status"
                    ? "bg-[#C8102E] text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                FLIGHT STATUS
              </button>
              <button
                onClick={() => setActiveTab("checkin")}
                className={`flex-1 py-5 px-6 font-bold text-center transition-colors ${
                  activeTab === "checkin"
                    ? "bg-[#C8102E] text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                CHECK IN
              </button>
              <button
                onClick={() => setActiveTab("trips")}
                className={`flex-1 py-5 px-6 font-bold text-center transition-colors ${
                  activeTab === "trips"
                    ? "bg-[#C8102E] text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                MY TRIPS
              </button>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="p-8">
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}

              {activeTab === "book" && (
                <>
                  {/* Trip Type */}
                  <div className="flex flex-wrap gap-6 mb-8">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="tripType"
                        value="round_trip"
                        checked={tripType === "round_trip"}
                        onChange={(e) =>
                          setTripType(e.target.value as "round_trip")
                        }
                        className="w-4 h-4 text-[#C8102E] accent-[#C8102E]"
                      />
                      <span className="font-semibold text-gray-700">
                        Round Trip
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="tripType"
                        value="one_way"
                        checked={tripType === "one_way"}
                        onChange={(e) =>
                          setTripType(e.target.value as "one_way")
                        }
                        className="w-4 h-4 text-[#C8102E] accent-[#C8102E]"
                      />
                      <span className="font-semibold text-gray-700">
                        One Way
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-[#C8102E] accent-[#C8102E]"
                        defaultChecked
                      />
                      <span className="font-semibold text-gray-700">
                        Flexible Dates
                      </span>
                    </label>
                  </div>

                  {/* Search Fields - Delta Style Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                    {/* From */}
                    <div className="relative">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                        From
                      </label>
                      <input
                        placeholder="From (e.g. ATL)"
                        className="w-full p-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#C8102E] font-semibold text-lg text-gray-800 placeholder-gray-400"
                        value={origin}
                        onChange={(e) =>
                          setOrigin(e.target.value.toUpperCase())
                        }
                        maxLength={3}
                        required
                      />
                    </div>

                    {/* To */}
                    <div className="relative">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                        To
                      </label>
                      <input
                        placeholder="To (e.g. LAX)"
                        className="w-full p-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#C8102E] font-semibold text-lg text-gray-800 placeholder-gray-400"
                        value={destination}
                        onChange={(e) =>
                          setDestination(e.target.value.toUpperCase())
                        }
                        maxLength={3}
                        required
                      />
                    </div>

                    {/* Depart */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                        Depart
                      </label>
                      <input
                        type="date"
                        className="w-full p-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#C8102E] font-semibold text-lg text-gray-800"
                        value={departDate}
                        onChange={(e) => setDepartDate(e.target.value)}
                        required
                      />
                    </div>

                    {/* Return */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                        Return
                      </label>
                      <input
                        type="date"
                        className="w-full p-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#C8102E] font-semibold text-lg text-gray-800 disabled:bg-gray-100"
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        required={tripType === "round_trip"}
                        disabled={tripType === "one_way"}
                      />
                    </div>

                    {/* Travelers & Class */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                        Travelers & Class
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="1"
                          max="9"
                          className="w-20 p-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#C8102E] font-semibold text-lg text-center"
                          value={passengers}
                          onChange={(e) =>
                            setPassengers(parseInt(e.target.value) || 1)
                          }
                          required
                        />
                        <select
                          className="flex-1 p-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#C8102E] font-semibold text-gray-700"
                          value={cabinClass}
                          onChange={(e) => setCabinClass(e.target.value)}
                        >
                          <option value="main">Economy</option>
                          <option value="comfort_plus">Comfort+</option>
                          <option value="first_class">First Class</option>
                          <option value="delta_one">Delta One</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Search Button */}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-10 py-4 bg-[#C8102E] text-white font-bold text-lg rounded-lg hover:bg-[#a00d25] transition-colors shadow-lg disabled:bg-gray-400"
                    >
                      {loading ? "SEARCHING..." : "SEARCH"}
                    </button>
                  </div>
                </>
              )}

              {activeTab === "status" && (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">
                    Enter your flight number to check status
                  </p>
                  <div className="flex justify-center gap-4 max-w-md mx-auto">
                    <input
                      placeholder="Flight Number (e.g. DL123)"
                      className="flex-1 p-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#C8102E] font-semibold text-lg"
                    />
                    <Link
                      href="/flight-status"
                      className="px-8 py-4 bg-[#C8102E] text-white font-bold rounded-lg hover:bg-[#a00d25] transition-colors"
                    >
                      SEARCH
                    </Link>
                  </div>
                </div>
              )}

              {activeTab === "checkin" && (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">Check in for your flight</p>
                  <div className="flex justify-center gap-4 max-w-md mx-auto">
                    <input
                      placeholder="Confirmation #"
                      className="flex-1 p-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#C8102E] font-semibold text-lg"
                    />
                    <button
                      type="button"
                      className="px-8 py-4 bg-[#C8102E] text-white font-bold rounded-lg hover:bg-[#a00d25] transition-colors"
                    >
                      CHECK IN
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "trips" && (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">
                    Manage your upcoming trips
                  </p>
                  <div className="flex justify-center gap-4 max-w-md mx-auto">
                    <input
                      placeholder="Confirmation # or Ticket #"
                      className="flex-1 p-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#C8102E] font-semibold text-lg"
                    />
                    <Link
                      href="/my-trips"
                      className="px-8 py-4 bg-[#C8102E] text-white font-bold rounded-lg hover:bg-[#a00d25] transition-colors"
                    >
                      VIEW
                    </Link>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* Quick Links - Gray Background */}
      <section className="bg-[#f4f4f4] py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/search"
              className="group bg-white p-8 rounded shadow-sm hover:shadow-xl transition-all duration-300 text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-[#C8102E] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-lg text-gray-800 group-hover:text-[#C8102E] transition-colors">
                Book a Flight
              </h3>
            </Link>

            <Link
              href="/flight-status"
              className="group bg-white p-8 rounded shadow-sm hover:shadow-xl transition-all duration-300 text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-[#1d1d1f] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-lg text-gray-800 group-hover:text-[#C8102E] transition-colors">
                Flight Status
              </h3>
            </Link>

            <Link
              href="/my-trips"
              className="group bg-white p-8 rounded shadow-sm hover:shadow-xl transition-all duration-300 text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-[#1d1d1f] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-lg text-gray-800 group-hover:text-[#C8102E] transition-colors">
                My Trips
              </h3>
            </Link>

            <Link
              href="#"
              className="group bg-white p-8 rounded shadow-sm hover:shadow-xl transition-all duration-300 text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-[#1d1d1f] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-lg text-gray-800 group-hover:text-[#C8102E] transition-colors">
                Check In
              </h3>
            </Link>
          </div>
        </div>
      </section>

      {/* Deals Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">
            Explore Top Deals
          </h2>
          <p className="text-lg text-gray-600 text-center mb-16 max-w-2xl mx-auto">
            Find the best flight deals and discover your next adventure with
            Delta
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Deal Card 1 */}
            <div className="group cursor-pointer">
              <div className="relative h-80 rounded-xl overflow-hidden mb-4">
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-10"></div>
                <div className="absolute top-4 left-4 bg-[#C8102E] text-white px-4 py-1 text-sm font-bold rounded">
                  DEAL
                </div>
                <div className="w-full h-full bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 flex items-center justify-center">
                  <span className="text-white text-8xl">✈️</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                  <h3 className="text-2xl font-bold text-white mb-1">
                    Paris from $499
                  </h3>
                  <p className="text-gray-200">Round trip including taxes</p>
                </div>
              </div>
              <h3 className="font-bold text-xl text-gray-900 group-hover:text-[#C8102E] transition-colors">
                Discover the City of Light
              </h3>
              <p className="text-gray-600 mt-1">
                Experience romance, art, and cuisine in Paris
              </p>
            </div>

            {/* Deal Card 2 */}
            <div className="group cursor-pointer">
              <div className="relative h-80 rounded-xl overflow-hidden mb-4">
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-10"></div>
                <div className="absolute top-4 left-4 bg-[#C8102E] text-white px-4 py-1 text-sm font-bold rounded">
                  DEAL
                </div>
                <div className="w-full h-full bg-gradient-to-br from-green-400 via-green-500 to-green-600 flex items-center justify-center">
                  <span className="text-white text-8xl">🏝️</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                  <h3 className="text-2xl font-bold text-white mb-1">
                    Hawaii from $599
                  </h3>
                  <p className="text-gray-200">Round trip including taxes</p>
                </div>
              </div>
              <h3 className="font-bold text-xl text-gray-900 group-hover:text-[#C8102E] transition-colors">
                Escape to Paradise
              </h3>
              <p className="text-gray-600 mt-1">
                Relax on beautiful beaches in Hawaii
              </p>
            </div>

            {/* Deal Card 3 */}
            <div className="group cursor-pointer">
              <div className="relative h-80 rounded-xl overflow-hidden mb-4">
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-10"></div>
                <div className="absolute top-4 left-4 bg-[#C8102E] text-white px-4 py-1 text-sm font-bold rounded">
                  DEAL
                </div>
                <div className="w-full h-full bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white text-8xl">🎭</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                  <h3 className="text-2xl font-bold text-white mb-1">
                    London from $449
                  </h3>
                  <p className="text-gray-200">Round trip including taxes</p>
                </div>
              </div>
              <h3 className="font-bold text-xl text-gray-900 group-hover:text-[#C8102E] transition-colors">
                British Adventure Awaits
              </h3>
              <p className="text-gray-600 mt-1">
                Explore history and culture in London
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SkyMiles Banner */}
      <section className="bg-[#1d1d1f] py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Join Sky Miles®
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
            Earn miles on every flight and unlock a world of rewards and
            benefits with Delta SkyMiles
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="px-10 py-4 bg-[#C8102E] text-white font-bold text-lg rounded-lg hover:bg-[#a00d25] transition-colors">
              Join Today
            </button>
            <button className="px-10 py-4 border-2 border-white text-white font-bold text-lg rounded-lg hover:bg-white hover:text-[#1d1d1f] transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">
            Experience Delta
          </h2>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center p-6">
              <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-4xl">💺</span>
              </div>
              <h3 className="font-bold text-xl mb-3 text-gray-900">Comfort+</h3>
              <p className="text-gray-600">
                Extra legroom, priority boarding, and complimentary beverages
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-4xl">🌟</span>
              </div>
              <h3 className="font-bold text-xl mb-3 text-gray-900">
                Delta One
              </h3>
              <p className="text-gray-600">
                Premium cabin experience with lie-flat seats
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-4xl">🏠</span>
              </div>
              <h3 className="font-bold text-xl mb-3 text-gray-900">
                Delta Sky Club
              </h3>
              <p className="text-gray-600">
                Relax and refresh before your flight
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-4xl">📺</span>
              </div>
              <h3 className="font-bold text-xl mb-3 text-gray-900">
                Entertainment
              </h3>
              <p className="text-gray-600">
                Hundreds of movies and shows free on every flight
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
