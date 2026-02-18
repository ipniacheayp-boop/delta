import Link from "next/link";

export default function Home() {
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
        <form className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input placeholder="From (IATA)" className="p-2 border rounded" />
          <input placeholder="To (IATA)" className="p-2 border rounded" />
          <input type="date" className="p-2 border rounded" />
          <select className="p-2 border rounded">
            <option>Economy</option>
            <option>Comfort+</option>
            <option>First</option>
          </select>
          <div className="md:col-span-4 text-right">
            <button className="mt-3 px-4 py-2 bg-blue-600 text-white rounded">
              Search
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
