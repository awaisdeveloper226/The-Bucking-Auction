"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Home, Package, Star, MessageSquare, Settings, Bell, User, DollarSign, Gavel, LogOut
} from "lucide-react";

export default function BuyerDashboard({ params }) {
  const router = useRouter();
  const { id } = params;
  const [profile, setProfile] = useState(null);
  const [activeMenu, setActiveMenu] = useState("Overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      // Ensure client-side localStorage check
      if (typeof window === "undefined") return;

      const userId = localStorage.getItem("userId");
      if (!userId || userId !== id) {
        router.replace("/login");
        return;
      }

      try {
        const res = await fetch(`/api/users/${userId}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Failed to fetch profile");

        setProfile(data);
      } catch (err) {
        console.error(err);
        setError("⚠️ Could not load profile. Please re-login.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
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

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center p-6">
        <p className="text-red-600 font-semibold mb-4 text-center">{error || "Profile not found."}</p>
        <button onClick={handleLogout} className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg">
          <LogOut size={16} /> Logout
        </button>
      </div>
    );
  }

  const activeBids = profile.activeBids || 0;
  const wonAuctions = profile.wonAuctions || 0;
  const orders = profile.orders || 0;
  const messages = profile.messages || 0;

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex flex-col p-6">
        <h2 className="text-2xl font-bold text-blue-600 border-b pb-4 mb-4">Buyer Panel</h2>
        <nav className="space-y-3 flex-1">
          {[{ name: "Overview", icon: Home }, { name: "Auctions", icon: Gavel }, { name: "Orders", icon: Package }, { name: "Watchlist", icon: Star }, { name: "Messages", icon: MessageSquare }, { name: "Payments", icon: DollarSign }, { name: "Settings", icon: Settings }].map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveMenu(item.name)}
              className={`flex items-center space-x-2 w-full p-2 rounded-lg ${
                activeMenu === item.name ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"
              }`}
            >
              <item.icon size={18} /> <span>{item.name}</span>
            </button>
          ))}
        </nav>
        <button onClick={handleLogout} className="flex items-center space-x-2 p-2 text-red-500 hover:bg-red-100 rounded-lg">
          <LogOut size={18} /> <span>Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <header className="bg-white shadow rounded-lg p-4 flex justify-between items-center mb-6">
          <h1 className="text-xl font-semibold">{activeMenu}</h1>
          <div className="flex items-center space-x-4">
            <button className="relative">
              <Bell size={20} className="text-gray-600" />
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs px-1 rounded-full">{messages}</span>
            </button>
            <button className="flex items-center space-x-2">
              <User size={20} className="text-gray-600" />
              <span className="text-sm font-medium">{profile.name}</span>
            </button>
          </div>
        </header>

        {activeMenu === "Overview" && (
          <>
            <section className="grid grid-cols-4 gap-6 mb-6">
              <div className="bg-white p-6 shadow rounded-lg">
                <h3 className="text-gray-600">Active Bids</h3>
                <p className="text-2xl font-bold text-blue-600">{activeBids}</p>
              </div>
              <div className="bg-white p-6 shadow rounded-lg">
                <h3 className="text-gray-600">Won Auctions</h3>
                <p className="text-2xl font-bold text-green-600">{wonAuctions}</p>
              </div>
              <div className="bg-white p-6 shadow rounded-lg">
                <h3 className="text-gray-600">Orders</h3>
                <p className="text-2xl font-bold text-purple-600">{orders}</p>
              </div>
              <div className="bg-white p-6 shadow rounded-lg">
                <h3 className="text-gray-600">Messages</h3>
                <p className="text-2xl font-bold text-orange-600">{messages}</p>
              </div>
            </section>
          </>
        )}

        {activeMenu === "Auctions" && (
          <div className="bg-white p-6 shadow rounded-lg">
            <h3 className="font-semibold mb-3">My Auctions</h3>
            <ul className="space-y-2">
              {profile.myAuctions?.length > 0 ? profile.myAuctions.map((item, i) => (
                <li key={i} className="flex justify-between p-2 bg-gray-50 rounded-lg">
                  <span>{item.name}</span>
                  <span>{item.status}</span>
                </li>
              )) : <li className="text-gray-500">No auctions found.</li>}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
