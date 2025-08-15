export default function BuyerDashboard() {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg p-6 space-y-4">
        <h2 className="text-2xl font-bold border-b pb-4">Buyer Dashboard</h2>
        <nav className="space-y-3">
          <a href="#" className="block hover:text-blue-600">🏠 Overview</a>
          <a href="#" className="block hover:text-blue-600">📦 My Orders</a>
          <a href="#" className="block hover:text-blue-600">⭐ Watchlist</a>
          <a href="#" className="block hover:text-blue-600">💬 Messages</a>
          <a href="#" className="block hover:text-blue-600">⚙️ Settings</a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <header className="bg-white shadow p-4 flex justify-between items-center mb-6">
          <h1 className="text-xl font-semibold">Buyer Overview</h1>
          <div>🔔 👤</div>
        </header>

        <section className="grid grid-cols-3 gap-6">
          <div className="bg-white p-6 shadow rounded-lg">Orders Summary</div>
          <div className="bg-white p-6 shadow rounded-lg">Watchlist</div>
          <div className="bg-white p-6 shadow rounded-lg">Messages</div>
        </section>
      </main>
    </div>
  );
}
