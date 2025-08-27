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
  Plus,
  Minus,
} from "lucide-react";
import Image from "next/image";

export default function BuyerDashboard({ params }) {
  const { id } = params;
  const [profile, setProfile] = useState(null);
  const [activeMenu, setActiveMenu] = useState("Overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [auction, setAuction] = useState(null);
  const [lots, setLots] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [watchlist, setWatchlist] = useState([]);
  const [showModal, setShowModal] = useState(false); // For success modal

  const router = useRouter();

  const handleCardClick = (lotId) => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      router.push("/register"); // redirect if not logged in
    } else {
      router.push(`/sale-ring/${lotId}`); // go to lot page if logged in
    }
  };

  // 🔹 Toggle Watchlist
  const toggleWatchlist = (lot) => {
    let updatedList;
    if (watchlist.find((w) => w._id === lot._id)) {
      updatedList = watchlist.filter((w) => w._id !== lot._id);
    } else {
      updatedList = [...watchlist, lot];
    }
    setWatchlist(updatedList);
    localStorage.setItem("watchlist", JSON.stringify(updatedList));
  };

  useEffect(() => {
    const storedWatchlist = localStorage.getItem("watchlist");
    if (storedWatchlist) {
      setWatchlist(JSON.parse(storedWatchlist));
    }
  }, []);

  useEffect(() => {
    const fetchAuctionAndLots = async () => {
      try {
        // 1. Get published auction
        const auctionRes = await fetch("/api/auctions");
        const auctionData = await auctionRes.json();

        let auctions = [];
        if (auctionData.success && auctionData.auctions) {
          auctions = auctionData.auctions;
        } else if (Array.isArray(auctionData)) {
          auctions = auctionData;
        } else if (
          auctionData.auctions &&
          Array.isArray(auctionData.auctions)
        ) {
          auctions = auctionData.auctions;
        }

        const activeAuction = auctions.find((a) => a.status === "published");

        if (activeAuction) {
          setAuction(activeAuction);

          // 2. Get lots
          const lotRes = await fetch(
            `/api/lots?auctionId=${activeAuction._id}`
          );
          const lotData = await lotRes.json();

          let fetchedLots = [];
          if (Array.isArray(lotData)) {
            fetchedLots = lotData;
          } else if (lotData.lots && Array.isArray(lotData.lots)) {
            fetchedLots = lotData.lots;
          }

          const auctionLots = fetchedLots.filter(
            (lot) =>
              lot.auctionId === activeAuction._id ||
              lot.auctionId?._id === activeAuction._id
          );

          setLots(auctionLots);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAuctionAndLots();
  }, []);

  const filteredLots = lots.filter((lot) =>
    lot.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const fetchProfile = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId || userId !== id) {
        router.replace("/login");
        return;
      }

      try {
        const res = await fetch(`/api/bidders`);
        const data = await res.json();

        const user = data.find((u) => u.id === userId);
        if (!user) {
          router.replace("/login");
          return;
        }
        setProfile(user);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, router]);

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
    { name: "Profile", icon: User },
    { name: "Lots", icon: Package },
    { name: "Watchlist", icon: Star },
    { name: "Settings", icon: Settings },
  ];

  const stats = [
    {
      title: "Active Lots",
      value: lots.filter((lot) => lot.status === "active").length,
      icon: Gavel,
      color: "blue",
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
          </div>
        </div>

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
                  <button
                    onClick={() => setActiveMenu("Lots")}
                    className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition text-left"
                  >
                    <Gavel className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 flex-shrink-0" />
                    <span className="font-medium text-blue-900 text-sm sm:text-base">
                      Browse Live Lots
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveMenu("Watchlist")}
                    className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-green-50 hover:bg-green-100 rounded-lg transition text-left"
                  >
                    <Star className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 flex-shrink-0" />
                    <span className="font-medium text-green-900 text-sm sm:text-base">
                      View Watchlist
                    </span>
                  </button>
                </div>
              </section>
            </>
          )}

          {/* Profile Tab */}
          {activeMenu === "Profile" && profile && (
            <div className="max-w-md mx-auto bg-white shadow-sm rounded-lg border p-6 mt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                My Profile
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-gray-700">Name:</span>{" "}
                  {profile.name}
                </div>
                <div>
                  <span className="font-medium text-gray-700">Email:</span>{" "}
                  {profile.email}
                </div>
                <div>
                  <span className="font-medium text-gray-700">
                    Bidding Number:
                  </span>{" "}
                  {profile.biddingNumber || "N/A"}
                </div>
                <div>
                  <span className="font-medium text-gray-700">Status:</span>{" "}
                  {profile.status}
                </div>
                <div>
                  <span className="font-medium text-gray-700">Phone:</span>{" "}
                  {profile.phone}
                </div>
                <div>
                  <span className="font-medium text-gray-700">Address:</span>{" "}
                  {profile.address}
                </div>
                
              </div>
            </div>
          )}

          {/* Lots Tab */}
          {activeMenu === "Lots" && (
            <>
              {auction && (
                <div className="max-w-6xl mx-auto px-4 py-6">
                  <h2 className="text-3xl font-bold text-[#335566] text-center mb-7 ">
                    Live Auction Lots – Place Your Bids Now!
                  </h2>
                  <div className="flex justify-center">
                    <input
                      type="text"
                      placeholder="Search lots..."
                      className="w-full max-w-lg border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#6ED0CE] text-black"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="bg-[#6ED0CE] hover:bg-[#4DB1B1] text-[#335566] px-4 py-2 rounded-r-lg font-semibold">
                      Search
                    </button>
                  </div>
                </div>
              )}

              <div className="max-w-6xl mx-auto px-4 py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLots.map((lot) => {
                  const isInWatchlist = watchlist.find(
                    (w) => w._id === lot._id
                  );
                  return (
                    <div
                      key={lot._id}
                      className="group relative block bg-white border rounded-lg overflow-hidden shadow hover:shadow-lg transition"
                    >
                      <div
                        onClick={() => handleCardClick(lot._id)}
                        className="cursor-pointer"
                      >
                        <div className="relative">
                          {lot.photos?.[0] && (
                            <Image
                              src={lot.photos[0]}
                              alt={lot.title}
                              width={400}
                              height={280}
                              className="w-full h-48 object-contain group-hover:scale-105 transition-transform"
                            />
                          )}
                          <span
                            className={`absolute top-2 left-2 px-2 py-1 text-xs font-semibold rounded ${
                              lot.status === "active"
                                ? "bg-green-500 text-white"
                                : "bg-gray-500 text-white"
                            }`}
                          >
                            {lot.status}
                          </span>
                        </div>
                        <div className="p-4">
                          <h3 className="text-lg font-semibold text-[#335566] group-hover:text-[#4DB1B1] transition-colors">
                            {lot.title}
                          </h3>
                          <p className="text-gray-700 mt-2">
                            Current Bid:{" "}
                            <span className="font-bold">
                              ${lot.currentBid || lot.startingBid}
                            </span>
                          </p>
                          <button className="mt-4 w-full bg-[#335566] hover:bg-[#4a6f7d] text-white py-2 rounded font-medium transition">
                            View Lot
                          </button>
                        </div>
                      </div>
                      {/* Watchlist Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWatchlist(lot);
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow hover:bg-gray-100 transition"
                        title={
                          isInWatchlist
                            ? "Remove from Watchlist"
                            : "Add to Watchlist"
                        }
                      >
                        {isInWatchlist ? (
                          <Minus className="h-4 w-4 text-red-600" />
                        ) : (
                          <Plus className="h-4 w-4 text-green-600" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Watchlist Tab */}
          {activeMenu === "Watchlist" && (
            <>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                Watchlist
              </h3>
              {watchlist.length === 0 ? (
                <p className="text-gray-600 text-sm sm:text-base">
                  No lots added to your watchlist yet.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {watchlist.map((lot) => (
                    <div
                      key={lot._id}
                      onClick={() => handleCardClick(lot._id)}
                      className="cursor-pointer group block bg-white border rounded-lg overflow-hidden shadow hover:shadow-lg transition"
                    >
                      <div className="relative">
                        {lot.photos?.[0] && (
                          <Image
                            src={lot.photos[0]}
                            alt={lot.title}
                            width={400}
                            height={280}
                            className="w-full h-48 object-contain group-hover:scale-105 transition-transform"
                          />
                        )}
                        <span
                          className={`absolute top-2 left-2 px-2 py-1 text-xs font-semibold rounded ${
                            lot.status === "active"
                              ? "bg-green-500 text-white"
                              : "bg-gray-500 text-white"
                          }`}
                        >
                          {lot.status}
                        </span>
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-[#335566] group-hover:text-[#4DB1B1] transition-colors">
                          {lot.title}
                        </h3>
                        <p className="text-gray-700 mt-2">
                          Current Bid:{" "}
                          <span className="font-bold">
                            ${lot.currentBid || lot.startingBid}
                          </span>
                        </p>
                        <button className="mt-4 w-full bg-[#335566] hover:bg-[#4a6f7d] text-white py-2 rounded font-medium transition">
                          View Lot
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Settings Tab */}
          {activeMenu === "Settings" && (
            <div className="max-w-md mx-auto bg-white shadow-sm rounded-lg border p-6 mt-17">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Change Password
              </h3>

              {/* ✅ Success Modal */}
              {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                  <div className="bg-white rounded-2xl shadow-lg p-6 max-w-sm w-full text-center">
                    <h4 className="text-xl font-semibold text-green-600 mb-2">
                      🎉 Password Updated!
                    </h4>
                    <p className="text-gray-600 mb-4">
                      Your password has been changed successfully.
                    </p>
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}

              <form
                className="space-y-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const oldPassword = e.target.oldPassword.value;
                  const newPassword = e.target.newPassword.value;
                  const confirmPassword = e.target.confirmPassword.value;

                  if (newPassword !== confirmPassword) {
                    alert("New passwords do not match!");
                    return;
                  }

                  try {
                    const userId = localStorage.getItem("userId");
                    if (!userId) {
                      alert("User not logged in!");
                      return;
                    }

                    const res = await fetch("/api/auth/change-password", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        userId,
                        oldPassword,
                        newPassword,
                      }),
                    });

                    const data = await res.json();
                    if (res.ok) {
                      setShowModal(true); // ✅ Show modal on success
                      e.target.reset();
                    } else {
                      alert(data.message || "Password update failed");
                    }
                  } catch (err) {
                    console.error("Password update error:", err);
                    alert("Something went wrong. Please try again.");
                  }
                }}
              >
                {/* Old Password */}
                <div>
                  <label
                    htmlFor="oldPassword"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Old Password
                  </label>
                  <input
                    type="password"
                    id="oldPassword"
                    name="oldPassword"
                    placeholder="Enter your old password"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* New Password */}
                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    placeholder="Enter a new password"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="Re-enter new password"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition"
                >
                  Update Password
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
