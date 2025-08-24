"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Home,
  Package,
  Star,
  Settings,
  User,
  Gavel,
  LogOut,
  Menu,
  X,
} from "lucide-react";

export default function BuyerDashboard({ params }) {
  const router = useRouter();
  const { id } = params;
  const [profile, setProfile] = useState(null);
  const [activeMenu, setActiveMenu] = useState("Overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
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
        setError("⚠️ Could not load profile. Please re-login.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, router]);

  // 🚀 Lock body scroll when sidebar is open (mobile only)
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  const handleLogout = () => {
    localStorage.removeItem("userId");
    router.replace("/login");
  };

  const menuItems = [
    { name: "Overview", icon: Home },
    { name: "Auctions", icon: Gavel },
    { name: "Orders", icon: Package },
    { name: "Watchlist", icon: Star },
    { name: "Settings", icon: Settings },
  ];

  const stats = [
    {
      title: "Active Bids",
      value: profile?.activeBids || 0,
      icon: Gavel,
      color: "blue",
    },
    {
      title: "Won Auctions",
      value: profile?.wonAuctions || 0,
      icon: Star,
      color: "green",
    },
    {
      title: "Orders",
      value: profile?.orders || 0,
      icon: Package,
      color: "purple",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50 px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-base sm:text-lg">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50 p-4 py-8">
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 w-full max-w-sm text-center">
          <div className="mx-auto flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-red-100 mb-4">
            <X className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
          </div>
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
            Access Error
          </h2>
          <p className="text-red-600 mb-4 sm:mb-6 text-sm sm:text-base">
            {error || "Profile not found."}
          </p>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg transition text-sm sm:text-base"
          >
            <LogOut size={14} className="sm:w-4 sm:h-4" />
            <span>Return to Login</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50 pt-16 pb-20 sm:pt-20 sm:pb-24 lg:pt-0 lg:pb-0">
      {/* Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-full lg:h-screen w-64 sm:w-72 lg:w-64 xl:w-72 bg-white shadow-lg flex flex-col transform transition-transform duration-300 ease-in-out z-50 lg:z-auto lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex justify-between items-center p-3 sm:p-4 border-b lg:hidden">
          <h2 className="text-base sm:text-lg font-bold text-blue-600">
            Dashboard
          </h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>

        <div className="hidden lg:block p-4 xl:p-6 border-b">
          <h2 className="text-xl xl:text-2xl font-bold text-blue-600">
            Buyer Dashboard
          </h2>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 sm:p-4 lg:p-4 xl:p-6 overflow-y-auto">
          <div className="space-y-1 sm:space-y-2">
            {menuItems.map(({ name, icon: Icon }) => (
              <button
                key={name}
                onClick={() => {
                  setActiveMenu(name);
                  setSidebarOpen(false);
                }}
                className={`flex items-center gap-2 sm:gap-3 w-full p-2.5 sm:p-3 rounded-lg text-left transition ${
                  activeMenu === name
                    ? "bg-blue-100 text-blue-700 shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon
                  size={16}
                  className={`sm:w-[18px] sm:h-[18px] ${
                    activeMenu === name
                      ? "text-blue-600"
                      : "group-hover:text-gray-700"
                  }`}
                />
                <span className="font-medium text-sm sm:text-base">{name}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Logout */}
        <div className="p-3 sm:p-4 lg:p-4 xl:p-6 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 sm:gap-3 w-full p-2.5 sm:p-3 text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <LogOut size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span className="font-medium text-sm sm:text-base">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white shadow-sm border-b fixed top-16 left-0 right-0 z-30">
          <div className="flex items-center justify-between p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg flex-shrink-0"
              >
                <Menu size={18} className="sm:w-5 sm:h-5" />
              </button>
              <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                {activeMenu}
              </h1>
            </div>
            <button className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg flex-shrink-0">
              <User
                size={16}
                className="sm:w-[18px] sm:h-[18px] text-gray-600"
              />
            </button>
          </div>
        </div>

        {/* Desktop Header */}
        <header className="hidden lg:block bg-white shadow-sm rounded-lg mx-4 xl:mx-6 mt-4 xl:mt-6 mb-4 xl:mb-6">
          <div className="flex justify-between items-center p-3 xl:p-4">
            <h1 className="text-lg xl:text-xl font-semibold text-gray-900">
              {activeMenu}
            </h1>
            <button className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition">
              <User size={18} className="xl:w-5 xl:h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                {profile.name}
              </span>
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="p-3 sm:p-4 lg:p-4 xl:p-6 space-y-4 sm:space-y-6 flex-1 lg:mt-0 mt-16 overflow-auto">
          {/* Overview */}
          {activeMenu === "Overview" && (
            <>
              {/* Stats */}
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 xl:gap-6">
                {stats.map(({ title, value, icon: Icon, color }) => (
                  <div
                    key={title}
                    className="bg-white p-3 sm:p-4 xl:p-6 shadow-sm rounded-lg border hover:shadow-md transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-gray-600 text-xs sm:text-sm font-medium truncate">
                          {title}
                        </h3>
                        <p
                          className={`text-xl sm:text-2xl xl:text-3xl font-bold text-${color}-600 mt-1`}
                        >
                          {value}
                        </p>
                      </div>
                      <div
                        className={`p-1.5 sm:p-2 bg-${color}-100 rounded-lg flex-shrink-0 ml-2`}
                      >
                        <Icon
                          className={`h-4 w-4 sm:h-5 sm:w-5 xl:h-6 xl:w-6 text-${color}-600`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </section>

              {/* Quick Actions */}
              <section className="bg-white rounded-lg shadow-sm border p-3 sm:p-4 xl:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <button onClick={() =>  router.push("/sale-ring")} className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition text-left">
                    <Gavel className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 flex-shrink-0" />
                    <span className="font-medium text-blue-900 text-sm sm:text-base">
                      Browse Auctions
                    </span>
                  </button>
                  <button className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-green-50 hover:bg-green-100 rounded-lg transition text-left">
                    <Star className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 flex-shrink-0" />
                    <span className="font-medium text-green-900 text-sm sm:text-base">
                      View Watchlist
                    </span>
                  </button>
                  <button className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition text-left sm:col-span-2 lg:col-span-1">
                    <Package className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 flex-shrink-0" />
                    <span className="font-medium text-purple-900 text-sm sm:text-base">
                      Track Orders
                    </span>
                  </button>
                </div>
              </section>
            </>
          )}

          {/* Placeholder for other sections */}
          {["Auctions", "Orders", "Watchlist", "Settings"].includes(
            activeMenu
          ) && (
            <div className="bg-white shadow-sm rounded-lg border p-4 sm:p-6 text-center">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                {activeMenu}
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                This section is coming soon...
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}