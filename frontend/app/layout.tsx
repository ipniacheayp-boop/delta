import "./globals.css";
import { ReactNode } from "react";
import Link from "next/link";

export const metadata = {
  title: "Delta Air Lines - Official Site",
  description:
    "Book flights, reserve airline tickets and find information on departures, arrivals, flight schedules, Delta destinations and our travel deals.",
};

function Header() {
  return (
    <header className="sticky top-0 z-50">
      {/* Top Red Bar */}
      <div className="bg-[#C8102E] text-white text-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-10">
            <div className="flex items-center gap-6">
              <Link href="#" className="hover:underline">
                Help
              </Link>
              <span className="hidden md:inline">|</span>
              <Link href="#" className="hidden md:block hover:underline">
                Español
              </Link>
              <span className="hidden md:inline">|</span>
              <Link href="#" className="hidden md:block hover:underline">
                Reservations
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="#" className="hover:underline">
                Log in
              </Link>
              <Link
                href="#"
                className="px-4 py-1 bg-white text-[#C8102E] font-semibold rounded hover:bg-gray-100"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-[#141413]">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <span className="text-4xl font-bold text-[#C8102E]">Δ</span>
              <span className="text-2xl font-bold text-white">Delta</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link
                href="/search"
                className="px-4 py-2 text-white font-semibold hover:bg-white/10 rounded"
              >
                SHOP
              </Link>
              <Link
                href="/search"
                className="px-4 py-2 text-white font-semibold hover:bg-white/10 rounded"
              >
                BOOK
              </Link>
              <Link
                href="#"
                className="px-4 py-2 text-white font-semibold hover:bg-white/10 rounded"
              >
                CHECK IN
              </Link>
              <Link
                href="/flight-status"
                className="px-4 py-2 text-white font-semibold hover:bg-white/10 rounded"
              >
                FLIGHT STATUS
              </Link>
              <Link
                href="/my-trips"
                className="px-4 py-2 text-white font-semibold hover:bg-white/10 rounded"
              >
                MY TRIPS
              </Link>
              <Link
                href="#"
                className="px-4 py-2 text-white font-semibold hover:bg-white/10 rounded"
              >
                DEALS
              </Link>
              <Link
                href="#"
                className="px-4 py-2 text-white font-semibold hover:bg-white/10 rounded"
              >
                VACATIONS
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button className="lg:hidden text-white p-2">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-[#141413] text-white">
      {/* Top Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          <div>
            <h3 className="font-bold text-sm mb-4 uppercase tracking-wide">
              BOOK A FLIGHT
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/search" className="text-gray-400 hover:text-white">
                  Book a Flight
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white">
                  Flight Deals
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white">
                  Flight Schedules
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white">
                  Online Check-in
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white">
                  Delta Vacations®
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-sm mb-4 uppercase tracking-wide">
              HELP
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/flight-status"
                  className="text-gray-400 hover:text-white"
                >
                  Flight Status
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white">
                  Baggage
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-sm mb-4 uppercase tracking-wide">
              SKY MILES
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="#" className="text-gray-400 hover:text-white">
                  Join Sky Miles
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white">
                  Earn Miles
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white">
                  Redeem Miles
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white">
                  Sky Miles Members
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-sm mb-4 uppercase tracking-wide">
              ABOUT DELTA
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="#" className="text-gray-400 hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white">
                  News & Press
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white">
                  Investors
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-sm mb-4 uppercase tracking-wide">
              EXPERIENCE
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="#" className="text-gray-400 hover:text-white">
                  Cabin Classes
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white">
                  Delta Sky Club®
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white">
                  In-Flight Experience
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white">
                  Entertainment
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-sm mb-4 uppercase tracking-wide">
              BECOME A PILOT
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="#" className="text-gray-400 hover:text-white">
                  Delta Flight Academy
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-[#C8102E]">Δ</span>
              <span className="text-xl font-bold">Delta</span>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-gray-400">
              <Link href="#" className="hover:text-white">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:text-white">
                Terms of Use
              </Link>
              <Link href="#" className="hover:text-white">
                Accessibility
              </Link>
              <Link href="#" className="hover:text-white">
                Sitemap
              </Link>
              <Link href="#" className="hover:text-white">
                Site Feedback
              </Link>
            </div>
            <div className="text-sm text-gray-500">
              © 2026 Delta Air Lines. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-white text-slate-900">
          <Header />
          <main>{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
