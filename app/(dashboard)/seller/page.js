export default function SellerDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-900 text-white p-6 space-y-4">
        <h2 className="text-2xl font-bold border-b border-blue-700 pb-4">Seller Dashboard</h2>
        <nav className="space-y-3">
          <a href="#" className="block hover:text-yellow-300">📊 Sales Overview</a>
          <a href="#" className="block hover:text-yellow-300">📦 Manage Products</a>
          <a href="#" className="block hover:text-yellow-300">📅 Auction Schedule</a>
          <a href="#" className="block hover:text-yellow-300">💬 Messages</a>
          <a href="#" className="block hover:text-yellow-300">⚙️ Settings</a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <header className="bg-white shadow p-4 flex justify-between items-center mb-6">
          <h1 className="text-xl font-semibold">Seller Overview</h1>
          <div>🔔 👤</div>
        </header>

        <section className="grid grid-cols-3 gap-6">
          <div className="bg-white p-6 shadow rounded-lg">Active Auctions</div>
          <div className="bg-white p-6 shadow rounded-lg">Pending Orders</div>
          <div className="bg-white p-6 shadow rounded-lg">Messages</div>
        </section>
      </main>
    </div>
  );
}
