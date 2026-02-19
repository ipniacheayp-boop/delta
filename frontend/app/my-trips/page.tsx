"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getBookingByPnr, cancelBooking, Booking } from "../../lib/api";

export default function MyTripsPage() {
  const router = useRouter();
  const [pnr, setPnr] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pnr) {
      setError("Please enter a booking reference");
      return;
    }

    setLoading(true);
    setError("");
    setBooking(null);

    try {
      const result = await getBookingByPnr(pnr.toUpperCase());
      setBooking(result.booking);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking not found");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!booking || !confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    setCancelling(true);
    try {
      const result = await cancelBooking(booking.id);
      setBooking(result.booking);
      alert(
        "Booking cancelled successfully. A refund will be processed within 5-7 business days.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel booking");
    } finally {
      setCancelling(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CANCELLED":
      case "REFUNDED":
        return "bg-red-100 text-red-800";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
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
              <Link
                href="/flight-status"
                className="text-slate-600 hover:text-red-600"
              >
                Flight Status
              </Link>
              <Link href="/my-trips" className="text-red-600 font-medium">
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
            My Trips
          </h1>
          <p className="text-red-100 text-lg">
            Manage your upcoming and past flights
          </p>
        </div>
      </section>

      {/* PNR Search */}
      <section className="max-w-2xl mx-auto px-4 -mt-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">
            Find Your Booking
          </h2>
          <form onSubmit={handleSearch}>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Booking Reference (PNR)
                </label>
                <input
                  type="text"
                  placeholder="e.g., ABC1234"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 uppercase"
                  value={pnr}
                  onChange={(e) => setPnr(e.target.value.toUpperCase())}
                  maxLength={6}
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:bg-red-400"
                >
                  {loading ? "Searching..." : "Find Booking"}
                </button>
              </div>
            </div>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}
        </div>
      </section>

      {/* Booking Details */}
      {booking && (
        <section className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-slate-800 text-white p-6 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold">Booking Confirmation</h2>
                <p className="text-slate-300 mt-1">
                  Reference:{" "}
                  <span className="font-mono font-bold">
                    {booking.booking_reference}
                  </span>
                </p>
              </div>
              <span
                className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(booking.status)}`}
              >
                {booking.status}
              </span>
            </div>

            {/* Flight Details */}
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Flight Details
              </h3>

              <div className="bg-slate-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">D</span>
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">
                        Delta Air Lines
                      </div>
                      <div className="text-sm text-slate-500">
                        {booking.cabin_class} Class
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-slate-800">
                      ${booking.total_price}
                    </div>
                    <div className="text-sm text-slate-500">
                      {booking.currency}
                    </div>
                  </div>
                </div>
              </div>

              {/* Trip Info */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <div className="text-sm text-slate-500 mb-1">Trip Type</div>
                  <div className="font-semibold text-slate-800 capitalize">
                    {booking.trip_type.replace("_", " ")}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-500 mb-1">
                    Payment Status
                  </div>
                  <div className="font-semibold text-slate-800 capitalize">
                    {booking.payment_status}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-500 mb-1">
                    Miles Earned
                  </div>
                  <div className="font-semibold text-slate-800">
                    {booking.miles_earned.toLocaleString()} miles
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-500 mb-1">Booked On</div>
                  <div className="font-semibold text-slate-800">
                    {formatDate(booking.created_at)}
                  </div>
                </div>
              </div>

              {/* Passengers */}
              {booking.passengers &&
                Array.isArray(booking.passengers) &&
                booking.passengers.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-slate-800 mb-3">
                      Passengers
                    </h3>
                    <div className="space-y-2">
                      {(booking.passengers as any[]).map(
                        (p: any, i: number) => (
                          <div
                            key={i}
                            className="bg-slate-50 p-3 rounded-lg flex justify-between"
                          >
                            <span className="text-slate-600">
                              Passenger {i + 1}
                            </span>
                            <span className="font-medium text-slate-800">
                              {p.firstName} {p.lastName}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}

              {/* Actions */}
              {booking.status === "CONFIRMED" && (
                <div className="flex gap-4 pt-4 border-t border-slate-200">
                  <button
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="px-6 py-2 border-2 border-red-600 text-red-600 font-semibold rounded-lg hover:bg-red-50 disabled:opacity-50"
                  >
                    {cancelling ? "Cancelling..." : "Cancel Booking"}
                  </button>
                  <button className="px-6 py-2 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700">
                    Modify Booking
                  </button>
                </div>
              )}

              {booking.status === "CANCELLED" && (
                <div className="pt-4 border-t border-slate-200">
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
                    This booking has been cancelled. A refund will be processed
                    within 5-7 business days.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Book Another */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700"
            >
              Book Another Flight
            </Link>
          </div>
        </section>
      )}

      {/* Help Section */}
      {!booking && (
        <section className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Need Help?
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg
                    className="w-6 h-6 text-slate-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <h4 className="font-medium text-slate-800">Find Booking</h4>
                <p className="text-sm text-slate-500 mt-1">
                  Use your 6-character booking reference
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg
                    className="w-6 h-6 text-slate-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                    />
                  </svg>
                </div>
                <h4 className="font-medium text-slate-800">Modify Booking</h4>
                <p className="text-sm text-slate-500 mt-1">
                  Change dates or passengers
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg
                    className="w-6 h-6 text-slate-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h4 className="font-medium text-slate-800">24/7 Support</h4>
                <p className="text-sm text-slate-500 mt-1">
                  We're here to help anytime
                </p>
              </div>
            </div>
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
