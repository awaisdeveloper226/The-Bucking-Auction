export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-200 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-6 space-y-4">
        <h2 className="text-2xl font-bold border-b border-gray-700 pb-4">Admin Panel</h2>
        <nav className="space-y-3">
          <a href="#" className="block hover:text-green-400">📋 User Management</a>
          <a href="#" className="block hover:text-green-400">📦 Product Control</a>
          <a href="#" className="block hover:text-green-400">📅 Auction Monitoring</a>
          <a href="#" className="block hover:text-green-400">⚙️ Settings</a>
          <a href="#" className="block hover:text-green-400">📊 Reports</a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <header className="bg-white shadow p-4 flex justify-between items-center mb-6">
          <h1 className="text-xl font-semibold">Admin Overview</h1>
          <div>🔔 👤</div>
        </header>

        <section className="grid grid-cols-3 gap-6">
          <div className="bg-white p-6 shadow rounded-lg">Users Summary</div>
          <div className="bg-white p-6 shadow rounded-lg">Products Summary</div>
          <div className="bg-white p-6 shadow rounded-lg">System Logs</div>
        </section>
      </main>
    </div>
  );
}
