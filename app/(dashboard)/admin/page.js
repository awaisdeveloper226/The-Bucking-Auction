"use client";
import { useState } from "react";

export default function AdminDashboard() {
  const [active, setActive] = useState("overview");

  const menuItems = [
    { id: "overview", label: "📊 Admin Overview" },
    { id: "users", label: "📋 User Management" },
    { id: "products", label: "📦 Product Control" },
    { id: "auctions", label: "📅 Auction Monitoring" },
    { id: "reports", label: "📈 Reports" },
    { id: "settings", label: "⚙️ Settings" },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r shadow-lg">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-green-600">Admin Panel</h2>
        </div>
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={`w-full text-left px-4 py-2 rounded-lg transition 
                ${
                  active === item.id
                    ? "bg-green-600 text-white shadow"
                    : "text-gray-700 hover:bg-green-100"
                }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <header className="bg-white shadow p-4 flex justify-between items-center mb-6 rounded-lg">
          <h1 className="text-xl font-semibold text-gray-800">
            {menuItems.find((m) => m.id === active)?.label.replace(/^[^ ]+ /, "")}
          </h1>
          <div className="flex space-x-4 text-xl">
            <span>🔔</span>
            <span>👤</span>
          </div>
        </header>

        {/* Dynamic Sections */}
         {active === "overview" && (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 shadow rounded-lg">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Users</h2>
              <p className="text-2xl font-bold text-green-600">1,245</p>
              <p className="text-sm text-gray-500">+12% from last month</p>
            </div>
            <div className="bg-white p-6 shadow rounded-lg">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Products</h2>
              <p className="text-2xl font-bold text-green-600">856</p>
              <p className="text-sm text-gray-500">+8% this week</p>
            </div>
            <div className="bg-white p-6 shadow rounded-lg">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Ongoing Auctions</h2>
              <p className="text-2xl font-bold text-green-600">32</p>
              <p className="text-sm text-gray-500">5 ending today</p>
            </div>
          </section>
        )}

        {active === "users" && (
          <section className="bg-white p-6 shadow rounded-lg">
            <h2 className="text-lg font-bold mb-4">Manage Users</h2>
            <p>Here admin can view, edit, suspend or verify users.</p>
          </section>
        )}

        {active === "products" && (
          <section className="bg-white p-6 shadow rounded-lg">
            <h2 className="text-lg font-bold mb-4">Manage Products</h2>
            <p>Here admin can approve, reject, or edit listed products.</p>
          </section>
        )}

        {active === "auctions" && (
          <section className="bg-white p-6 shadow rounded-lg">
            <h2 className="text-lg font-bold mb-4">Monitor Auctions</h2>
            <p>Live and scheduled auctions appear here with controls.</p>
          </section>
        )}

        {active === "reports" && (
          <section className="bg-white p-6 shadow rounded-lg">
            <h2 className="text-lg font-bold mb-4">Reports & Analytics</h2>
            <p>Generate financial, user, and product reports.</p>
          </section>
        )}

        {active === "settings" && (
          <section className="bg-white p-6 shadow rounded-lg">
            <h2 className="text-lg font-bold mb-4">System Settings</h2>
            <p>Control system preferences, roles, and security settings.</p>
          </section>
        )}
      </main>
    </div>
  );
}
