"use client";
import { useState } from "react";
import {
  Home,
  Package,
  Star,
  MessageSquare,
  Settings,
  Bell,
  User,
  DollarSign,
  Gavel,
  LogOut,
} from "lucide-react";

export default function BuyerDashboard() {
  const [activeMenu, setActiveMenu] = useState("Overview");

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex flex-col p-6">
        <h2 className="text-2xl font-bold text-blue-600 border-b pb-4 mb-4">
          Buyer Panel
        </h2>
        <nav className="space-y-3 flex-1">
          <button
            onClick={() => setActiveMenu("Overview")}
            className={`flex items-center space-x-2 w-full p-2 rounded-lg ${
              activeMenu === "Overview"
                ? "bg-blue-100 text-blue-600"
                : "hover:bg-gray-100"
            }`}
          >
            <Home size={18} /> <span>Overview</span>
          </button>
          <button
            onClick={() => setActiveMenu("Auctions")}
            className={`flex items-center space-x-2 w-full p-2 rounded-lg ${
              activeMenu === "Auctions"
                ? "bg-blue-100 text-blue-600"
                : "hover:bg-gray-100"
            }`}
          >
            <Gavel size={18} /> <span>My Auctions</span>
          </button>
          <button
            onClick={() => setActiveMenu("Orders")}
            className={`flex items-center space-x-2 w-full p-2 rounded-lg ${
              activeMenu === "Orders"
                ? "bg-blue-100 text-blue-600"
                : "hover:bg-gray-100"
            }`}
          >
            <Package size={18} /> <span>Orders</span>
          </button>
          <button
            onClick={() => setActiveMenu("Watchlist")}
            className={`flex items-center space-x-2 w-full p-2 rounded-lg ${
              activeMenu === "Watchlist"
                ? "bg-blue-100 text-blue-600"
                : "hover:bg-gray-100"
            }`}
          >
            <Star size={18} /> <span>Watchlist</span>
          </button>
          <button
            onClick={() => setActiveMenu("Messages")}
            className={`flex items-center space-x-2 w-full p-2 rounded-lg ${
              activeMenu === "Messages"
                ? "bg-blue-100 text-blue-600"
                : "hover:bg-gray-100"
            }`}
          >
            <MessageSquare size={18} /> <span>Messages</span>
          </button>
          <button
            onClick={() => setActiveMenu("Payments")}
            className={`flex items-center space-x-2 w-full p-2 rounded-lg ${
              activeMenu === "Payments"
                ? "bg-blue-100 text-blue-600"
                : "hover:bg-gray-100"
            }`}
          >
            <DollarSign size={18} /> <span>Payments</span>
          </button>
          <button
            onClick={() => setActiveMenu("Settings")}
            className={`flex items-center space-x-2 w-full p-2 rounded-lg ${
              activeMenu === "Settings"
                ? "bg-blue-100 text-blue-600"
                : "hover:bg-gray-100"
            }`}
          >
            <Settings size={18} /> <span>Settings</span>
          </button>
        </nav>
        <button className="flex items-center space-x-2 p-2 text-red-500 hover:bg-red-100 rounded-lg">
          <LogOut size={18} /> <span>Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {/* Topbar */}
        <header className="bg-white shadow rounded-lg p-4 flex justify-between items-center mb-6">
          <h1 className="text-xl font-semibold">{activeMenu}</h1>
          <div className="flex items-center space-x-4">
            <button className="relative">
              <Bell size={20} className="text-gray-600" />
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs px-1 rounded-full">
                3
              </span>
            </button>
            <button className="flex items-center space-x-2">
              <User size={20} className="text-gray-600" />
              <span className="text-sm font-medium">John Doe</span>
            </button>
          </div>
        </header>

        {/* Dashboard Overview */}
        {activeMenu === "Overview" && (
          <section className="grid grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-6 shadow rounded-lg">
              <h3 className="text-gray-600">Active Bids</h3>
              <p className="text-2xl font-bold text-blue-600">12</p>
            </div>
            <div className="bg-white p-6 shadow rounded-lg">
              <h3 className="text-gray-600">Won Auctions</h3>
              <p className="text-2xl font-bold text-green-600">5</p>
            </div>
            <div className="bg-white p-6 shadow rounded-lg">
              <h3 className="text-gray-600">Orders</h3>
              <p className="text-2xl font-bold text-purple-600">8</p>
            </div>
            <div className="bg-white p-6 shadow rounded-lg">
              <h3 className="text-gray-600">Messages</h3>
              <p className="text-2xl font-bold text-orange-600">4</p>
            </div>
          </section>
        )}

        {/* Example Extra Sections */}
        {activeMenu === "Overview" && (
          <section className="grid grid-cols-2 gap-6">
            <div className="bg-white p-6 shadow rounded-lg">
              <h3 className="font-semibold mb-3">Upcoming Auctions</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span>Premium Angus Bull</span>
                  <span className="text-blue-600">Tomorrow</span>
                </li>
                <li className="flex justify-between">
                  <span>Sheep Lot A</span>
                  <span className="text-blue-600">2 Days</span>
                </li>
                <li className="flex justify-between">
                  <span>Horse Lot X</span>
                  <span className="text-blue-600">Next Week</span>
                </li>
              </ul>
            </div>
            <div className="bg-white p-6 shadow rounded-lg">
              <h3 className="font-semibold mb-3">Recent Orders</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span>Lot #21</span>
                  <span className="text-green-600">Completed</span>
                </li>
                <li className="flex justify-between">
                  <span>Lot #18</span>
                  <span className="text-yellow-600">Pending</span>
                </li>
              </ul>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
