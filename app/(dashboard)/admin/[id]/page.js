"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Home,
  User,
  Package,
  Gavel,
  BarChart3,
  Settings,
  Bell,
  LogOut,
} from "lucide-react";

export default function AdminDashboard({ params }) {
  const router = useRouter();
  const { id } = params;
  const [activeMenu, setActiveMenu] = useState("Overview");
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAdmin = async () => {
      if (typeof window === "undefined") return;

      const userId = localStorage.getItem("userId");
      if (!userId || userId !== id) {
        router.replace("/login");
        return;
      }

      try {
        const res = await fetch(`/api/users/${userId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch admin data");
        setAdminData(data);
      } catch (err) {
        console.error(err);
        setError("⚠️ Could not load profile. Please re-login.");
      } finally {
        setLoading(false);
      }
    };

    fetchAdmin();
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

  if (error || !adminData) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center p-6">
        <p className="text-red-600 font-semibold mb-4 text-center">{error || "Admin not found."}</p>
        <button onClick={handleLogout} className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg">
          <LogOut size={16} /> Logout
        </button>
      </div>
    );
  }

  const {
    totalUsers = 0,
    totalProducts = 0,
    ongoingAuctions = 0,
    notifications = 0,
    name,
  } = adminData;

  const menuItems = [
    { name: "Overview", icon: Home },
    { name: "Users", icon: User },
    { name: "Products", icon: Package },
    { name: "Auctions", icon: Gavel },
    { name: "Reports", icon: BarChart3 },
    { name: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex flex-col p-6">
        <h2 className="text-2xl font-bold text-green-600 border-b pb-4 mb-4">Admin Panel</h2>
        <nav className="space-y-3 flex-1">
          {menuItems.map((menu) => {
            const Icon = menu.icon;
            return (
              <button
                key={menu.name}
                onClick={() => setActiveMenu(menu.name)}
                className={`flex items-center space-x-2 w-full p-2 rounded-lg ${
                  activeMenu === menu.name ? "bg-green-100 text-green-600" : "hover:bg-gray-100"
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
          <section className="grid grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-6 shadow rounded-lg">
              <h3 className="text-gray-600">Total Users</h3>
              <p className="text-2xl font-bold text-green-600">{totalUsers}</p>
            </div>
            <div className="bg-white p-6 shadow rounded-lg">
              <h3 className="text-gray-600">Products</h3>
              <p className="text-2xl font-bold text-blue-600">{totalProducts}</p>
            </div>
            <div className="bg-white p-6 shadow rounded-lg">
              <h3 className="text-gray-600">Ongoing Auctions</h3>
              <p className="text-2xl font-bold text-purple-600">{ongoingAuctions}</p>
            </div>
            <div className="bg-white p-6 shadow rounded-lg">
              <h3 className="text-gray-600">Notifications</h3>
              <p className="text-2xl font-bold text-yellow-600">{notifications}</p>
            </div>
          </section>
        )}

        {/* Users */}
        {activeMenu === "Users" && (
          <div className="bg-white p-6 shadow rounded-lg">
            <h3 className="font-semibold mb-3">Manage Users</h3>
            <p>View, edit, suspend, or verify users.</p>
          </div>
        )}

        {/* Products */}
        {activeMenu === "Products" && (
          <div className="bg-white p-6 shadow rounded-lg">
            <h3 className="font-semibold mb-3">Manage Products</h3>
            <p>Approve, reject, or edit listed products.</p>
          </div>
        )}

        {/* Auctions */}
        {activeMenu === "Auctions" && (
          <div className="bg-white p-6 shadow rounded-lg">
            <h3 className="font-semibold mb-3">Monitor Auctions</h3>
            <p>Live and scheduled auctions with controls.</p>
          </div>
        )}

        {/* Reports */}
        {activeMenu === "Reports" && (
          <div className="bg-white p-6 shadow rounded-lg">
            <h3 className="font-semibold mb-3">Reports & Analytics</h3>
            <p>Generate financial, user, and product reports.</p>
          </div>
        )}

        {/* Settings */}
        {activeMenu === "Settings" && (
          <div className="bg-white p-6 shadow rounded-lg">
            <h3 className="font-semibold mb-3">Settings</h3>
            <p>Control preferences, roles, and security settings.</p>
          </div>
        )}
      </main>
    </div>
  );
}
