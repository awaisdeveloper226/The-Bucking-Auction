"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";

export default function SellerDashboard({ params }) {
  const router = useRouter();
  const { id } = params;
  const [activeMenu, setActiveMenu] = useState("Overview");
  const [sellerData, setSellerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSeller = async () => {
      // Ensure client-side
      if (typeof window === "undefined") return;

      const userId = localStorage.getItem("userId");
      if (!userId || userId !== id) {
        router.replace("/login");
        return;
      }

      try {
        const res = await fetch(`/api/users/${userId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch seller data");
        setSellerData(data);
      } catch (err) {
        console.error(err);
        setError("⚠️ Could not load profile. Please re-login.");
      } finally {
        setLoading(false);
      }
    };

    fetchSeller();
  }, [id, router]);

  const handleLogout = () => {
    localStorage.removeItem("userId");
    router.replace("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-gray-500 text-lg">
        Loading...
      </div>
    );
  }

  if (error || !sellerData) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center p-6">
        <p className="text-red-600 font-semibold mb-4 text-center">{error || "Seller not found."}</p>
        <button onClick={handleLogout} className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg">
          <LogOut size={16} /> Logout
        </button>
      </div>
    );
  }

  const {
    activeAuctions = 0,
    productsCount = 0,
    pendingOrders = 0,
    totalEarnings = 0,
    notifications = 0,
    upcomingAuctions = [],
    recentMessages = [],
    name,
  } = sellerData;

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex flex-col p-6">
        <h2 className="text-2xl font-bold text-blue-600 border-b pb-4 mb-4">Seller Panel</h2>
        <nav className="space-y-3 flex-1">
          {[
            { name: "Overview", icon: Home },
            { name: "Products", icon: Package },
            { name: "Auctions", icon: Gavel },
            { name: "Sales", icon: BarChart3 },
            { name: "Earnings", icon: DollarSign },
            { name: "Messages", icon: MessageSquare },
            { name: "Settings", icon: Settings },
          ].map((menu) => {
            const Icon = menu.icon;
            return (
              <button
                key={menu.name}
                onClick={() => setActiveMenu(menu.name)}
                className={`flex items-center space-x-2 w-full p-2 rounded-lg ${
                  activeMenu === menu.name ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"
                }`}
              >
                <Icon size={18} /> <span>{menu.name}</span>
              </button>
            );
          })}
        </nav>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 p-2 text-red-500 hover:bg-red-100 rounded-lg"
        >
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
                {notifications}
              </span>
            </button>
            <button className="flex items-center space-x-2">
              <User size={20} className="text-gray-600" />
              <span className="text-sm font-medium">{name}</span>
            </button>
          </div>
        </header>

        {/* Overview Section */}
        {activeMenu === "Overview" && (
          <>
            <section className="grid grid-cols-4 gap-6 mb-6">
              <div className="bg-white p-6 shadow rounded-lg">
                <h3 className="text-gray-600">Active Auctions</h3>
                <p className="text-2xl font-bold text-blue-600">{activeAuctions}</p>
              </div>
              <div className="bg-white p-6 shadow rounded-lg">
                <h3 className="text-gray-600">Products Listed</h3>
                <p className="text-2xl font-bold text-green-600">{productsCount}</p>
              </div>
              <div className="bg-white p-6 shadow rounded-lg">
                <h3 className="text-gray-600">Pending Orders</h3>
                <p className="text-2xl font-bold text-purple-600">{pendingOrders}</p>
              </div>
              <div className="bg-white p-6 shadow rounded-lg">
                <h3 className="text-gray-600">Total Earnings</h3>
                <p className="text-2xl font-bold text-yellow-600">${totalEarnings}</p>
              </div>
            </section>

            <section className="grid grid-cols-2 gap-6">
              <div className="bg-white p-6 shadow rounded-lg">
                <h3 className="font-semibold mb-3">Upcoming Auctions</h3>
                <ul className="space-y-2 text-sm">
                  {upcomingAuctions.length
                    ? upcomingAuctions.map((auction, idx) => (
                        <li key={idx} className="flex justify-between">
                          <span>{auction.title}</span>
                          <span className="text-blue-600">{auction.date}</span>
                        </li>
                      ))
                    : <li className="text-gray-500">No upcoming auctions</li>}
                </ul>
              </div>
              <div className="bg-white p-6 shadow rounded-lg">
                <h3 className="font-semibold mb-3">Recent Messages</h3>
                <ul className="space-y-2 text-sm">
                  {recentMessages.length
                    ? recentMessages.map((msg, idx) => (
                        <li key={idx} className="flex justify-between">
                          <span>{msg.sender}</span>
                          <span className="text-gray-500">{msg.content}</span>
                        </li>
                      ))
                    : <li className="text-gray-500">No messages</li>}
                </ul>
              </div>
            </section>
          </>
        )}

        {/* Additional Menus (Products, Auctions, Sales, Earnings, Messages, Settings) */}
        {activeMenu === "Products" && (
          <div className="bg-white p-6 shadow rounded-lg">
            <h3 className="font-semibold mb-3">My Products</h3>
            <ul className="space-y-2">
              {sellerData.products?.length
                ? sellerData.products.map((prod, idx) => (
                    <li key={idx} className="flex justify-between p-2 bg-gray-50 rounded-lg">
                      <span>{prod.name}</span>
                      <span>{prod.status}</span>
                    </li>
                  ))
                : <li className="text-gray-500">No products found.</li>}
            </ul>
          </div>
        )}

        {activeMenu === "Auctions" && (
          <div className="bg-white p-6 shadow rounded-lg">
            <h3 className="font-semibold mb-3">My Auctions</h3>
            <ul className="space-y-2">
              {sellerData.myAuctions?.length
                ? sellerData.myAuctions.map((auc, idx) => (
                    <li key={idx} className="flex justify-between p-2 bg-gray-50 rounded-lg">
                      <span>{auc.name}</span>
                      <span>{auc.status}</span>
                    </li>
                  ))
                : <li className="text-gray-500">No auctions found.</li>}
            </ul>
          </div>
        )}

        {activeMenu === "Sales" && (
          <div className="bg-white p-6 shadow rounded-lg">
            <h3 className="font-semibold mb-3">Sales Overview</h3>
            <p>Total sales data will go here.</p>
          </div>
        )}

        {activeMenu === "Earnings" && (
          <div className="bg-white p-6 shadow rounded-lg">
            <h3 className="font-semibold mb-3">Earnings Details</h3>
            <p>Total earnings: ${totalEarnings}</p>
          </div>
        )}

        {activeMenu === "Messages" && (
          <div className="bg-white p-6 shadow rounded-lg">
            <h3 className="font-semibold mb-3">Messages</h3>
            <ul className="space-y-2 text-sm">
              {recentMessages.length
                ? recentMessages.map((msg, idx) => (
                    <li key={idx} className="flex justify-between">
                      <span>{msg.sender}</span>
                      <span className="text-gray-500">{msg.content}</span>
                    </li>
                  ))
                : <li className="text-gray-500">No messages</li>}
            </ul>
          </div>
        )}

        {activeMenu === "Settings" && (
          <div className="bg-white p-6 shadow rounded-lg">
            <h3 className="font-semibold mb-3">Settings</h3>
            <p>Settings panel content here.</p>
          </div>
        )}
      </main>
    </div>
  );
}
