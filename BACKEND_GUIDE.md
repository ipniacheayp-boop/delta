# ✈️ Delta Replica — Complete Backend Guide
> Full Supabase backend for your `flight-buddy-now` repo

---

## 🗂️ File Structure — Copy These Into Your Repo

```
flight-buddy-now/
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql   ← All 10 database tables
│   │   ├── 002_seed_data.sql        ← Airports, aircraft, deals
│   │   ├── 003_rls_policies.sql     ← Row-level security
│   │   └── 004_functions.sql        ← Stored procedures
│   └── functions/
│       ├── search-flights/
│       │   └── index.ts             ← Flight search Edge Function
│       ├── create-booking/
│       │   └── index.ts             ← Booking creation Edge Function
│       └── cancel-booking/
│           └── index.ts             ← Booking cancellation Edge Function
└── src/
    ├── types/
    │   └── database.ts              ← All TypeScript types
    ├── lib/
    │   └── supabase.ts              ← Supabase client singleton
    ├── api/
    │   └── index.ts                 ← All API functions
    └── hooks/
        └── index.ts                 ← React hooks (useAuth, useFlightSearch, etc.)
```

---

## 🗄️ Database Tables (10 total)

| Table                   | Purpose                                     |
|-------------------------|---------------------------------------------|
| `airports`              | 12 seeded airports (JFK, LAX, CDG, NRT…)   |
| `aircraft`              | 5 aircraft types with seat configs          |
| `flights`               | Scheduled flights with pricing + seat count |
| `profiles`              | User profiles extending Supabase auth       |
| `bookings`              | Booking records with reference number       |
| `booking_flights`       | Links bookings → flights (multi-city ready) |
| `passengers`            | Passenger details per booking               |
| `deals`                 | Active flight deals / promotions            |
| `skymiles_transactions` | Miles earn/redeem/expire history            |
| `notifications`         | In-app notifications with realtime          |

---

## 🚀 Setup Steps

### Step 1 — Run Migrations in Order
Go to your **Supabase Dashboard → SQL Editor** and run each file in order:
```
001_initial_schema.sql   ← first
002_seed_data.sql        ← second
003_rls_policies.sql     ← third
004_functions.sql        ← fourth
```

### Step 2 — Update Your .env
```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### Step 3 — Deploy Edge Functions
```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_ID

# Deploy all edge functions
supabase functions deploy search-flights
supabase functions deploy create-booking
supabase functions deploy cancel-booking
```

### Step 4 — Enable Email Auth
In Supabase Dashboard → Authentication → Providers → enable **Email**

### Step 5 — Add Sample Flights (via SQL Editor)
```sql
-- Add some sample flights (adjust dates as needed)
INSERT INTO flights (flight_number, origin_id, destination_id, aircraft_id,
  departure_time, arrival_time, status,
  price_main, price_comfort_plus, price_first_class, price_delta_one,
  seats_main_available, seats_comfort_plus_available, seats_first_class_available)
SELECT
  'DL' || (100 + ROW_NUMBER() OVER())::TEXT,
  o.id, d.id, a.id,
  NOW() + INTERVAL '3 days' + (ROW_NUMBER() OVER() * INTERVAL '2 hours'),
  NOW() + INTERVAL '3 days' + (ROW_NUMBER() OVER() * INTERVAL '2 hours') + INTERVAL '9 hours',
  'scheduled',
  299 + (RANDOM() * 200)::INT,
  399 + (RANDOM() * 200)::INT,
  699 + (RANDOM() * 300)::INT,
  1299 + (RANDOM() * 500)::INT,
  120, 30, 16
FROM airports o, airports d, aircraft a
WHERE o.iata_code = 'JFK' AND d.iata_code = 'CDG'
LIMIT 5;
```

---

## 🔌 Using the Hooks in Your Components

```tsx
import { useAuth, useFlightSearch, useDeals, useBookings } from "../hooks";

// Auth
const { user, signIn, signUp, signOut, isAuthenticated } = useAuth();

// Search flights
const { search, results, loading, error } = useFlightSearch();
await search({ origin: "JFK", destination: "CDG", departDate: "2026-04-01",
               passengers: 1, cabinClass: "main", tripType: "round_trip" });

// Deals (auto-fetches on mount)
const { deals, loading } = useDeals();

// Bookings (auto-fetches for logged-in user)
const { bookings, cancel } = useBookings();
```

---

## 🛡️ Security Features

- **Row Level Security (RLS)** — users can only read/write their own data
- **JWT Auth** — all Edge Functions verify the user's JWT before acting
- **Service Role** — seat decrement and miles award use service role (not accessible from frontend)
- **Public read** — airports, flights, aircraft, and deals are publicly readable
- **Deals filter** — expired deals are automatically hidden via RLS policy

---

## ⚡ Realtime Features

The `useNotifications` hook subscribes to realtime Postgres changes, so users see booking confirmations and flight updates **instantly** without refreshing.

---

## 🎯 Backend Feature Coverage

| Feature              | How It Works                                      |
|----------------------|---------------------------------------------------|
| User Registration    | Supabase Auth + auto-creates `profiles` row       |
| Flight Search        | Edge Function → queries flights table with joins  |
| Booking Creation     | Edge Function → creates booking + awards miles    |
| Booking Cancellation | Edge Function → cancels + reverses miles          |
| SkyMiles             | Auto-earned on booking, reversed on cancellation  |
| Deals                | Seeded in DB, filtered by active + valid date     |
| Notifications        | Written by Edge Functions, realtime on frontend   |
| My Trips             | RLS-protected query on bookings + flights join    |
