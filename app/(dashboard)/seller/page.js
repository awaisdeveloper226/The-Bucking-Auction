"use client";
import { useState } from "react";
import {
  Home,
  Package,
  Gavel,
  DollarSign,
  MessageSquare,
  Settings,
  Bell,
  User,
  LogOut,
  BarChart3,
  Calendar,
} from "lucide-react";

export default function SellerDashboard() {
  const [activeMenu, setActiveMenu] = useState("Overview");

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex flex-col p-6">
        <h2 className="text-2xl font-bold text-blue-600 border-b pb-4 mb-4">
          Seller Panel
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
            onClick={() => setActiveMenu("Products")}
            className={`flex items-center space-x-2 w-full p-2 rounded-lg ${
              activeMenu === "Products"
                ? "bg-blue-100 text-blue-600"
                : "hover:bg-gray-100"
            }`}
          >
            <Package size={18} /> <span>Manage Products</span>
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
            onClick={() => setActiveMenu("Sales")}
            className={`flex items-center space-x-2 w-full p-2 rounded-lg ${
              activeMenu === "Sales"
                ? "bg-blue-100 text-blue-600"
                : "hover:bg-gray-100"
            }`}
          >
            <BarChart3 size={18} /> <span>Sales</span>
          </button>
          <button
            onClick={() => setActiveMenu("Earnings")}
            className={`flex items-center space-x-2 w-full p-2 rounded-lg ${
              activeMenu === "Earnings"
                ? "bg-blue-100 text-blue-600"
                : "hover:bg-gray-100"
            }`}
          >
            <DollarSign size={18} /> <span>Earnings</span>
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
                5
              </span>
            </button>
            <button className="flex items-center space-x-2">
              <User size={20} className="text-gray-600" />
              <span className="text-sm font-medium">Seller John</span>
            </button>
          </div>
        </header>

        {/* Overview Section */}
        {activeMenu === "Overview" && (
          <>
            {/* Stats Cards */}
            <section className="grid grid-cols-4 gap-6 mb-6">
              <div className="bg-white p-6 shadow rounded-lg">
                <h3 className="text-gray-600">Active Auctions</h3>
                <p className="text-2xl font-bold text-blue-600">6</p>
              </div>
              <div className="bg-white p-6 shadow rounded-lg">
                <h3 className="text-gray-600">Products Listed</h3>
                <p className="text-2xl font-bold text-green-600">24</p>
              </div>
              <div className="bg-white p-6 shadow rounded-lg">
                <h3 className="text-gray-600">Pending Orders</h3>
                <p className="text-2xl font-bold text-purple-600">4</p>
              </div>
              <div className="bg-white p-6 shadow rounded-lg">
                <h3 className="text-gray-600">Total Earnings</h3>
                <p className="text-2xl font-bold text-yellow-600">$8,450</p>
              </div>
            </section>

            {/* Auctions & Messages */}
            <section className="grid grid-cols-2 gap-6">
              <div className="bg-white p-6 shadow rounded-lg">
                <h3 className="font-semibold mb-3">Upcoming Auctions</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span>Lot 12 – Quarter Horse</span>
                    <span className="text-blue-600">Tomorrow</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Dairy Cow Lot 5</span>
                    <span className="text-blue-600">2 Days</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Sheep Lot 9</span>
                    <span className="text-blue-600">Next Week</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white p-6 shadow rounded-lg">
                <h3 className="font-semibold mb-3">Recent Messages</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span>Buyer123</span>
                    <span className="text-gray-500">Is Lot 5 available?</span>
                  </li>
                  <li className="flex justify-between">
                    <span>AuctioneerMike</span>
                    <span className="text-gray-500">Schedule updated.</span>
                  </li>
                  <li className="flex justify-between">
                    <span>FarmerJoe</span>
                    <span className="text-gray-500">Interested in calves.</span>
                  </li>
                </ul>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
