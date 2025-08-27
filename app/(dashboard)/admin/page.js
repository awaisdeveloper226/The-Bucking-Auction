"use client";
import { useState, useEffect } from "react";
import {
  Gavel,
  Package,
  Users,
  DollarSign,
  BarChart,
  Bell,
  Mail,
  MessageSquare,
  Menu,
  X,
} from "lucide-react";
import AuctionManagement from "@/components/AuctionManagement";
import LotManagement from "@/components/LotManagement";
import BidderManagement from "@/components/BidderManagement";
import PaymentsReporting from "@/components/Payments";
import NotificationsManagement from "@/components/Notifications";
import BidderChatToggle from "@/components/BidderChat";
import UserInquiries from "@/components/UserInquiries";

export default function AdminPanel() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("auctions");
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      // Close sidebar on mobile by default
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handle scroll lock when sidebar is open on mobile
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobile, sidebarOpen]);

  const menuItems = [
    { id: "auctions", label: "Auction Management", icon: <Gavel size={20} /> },
    { id: "lots", label: "Lot Management", icon: <Package size={20} /> },
    { id: "bidders", label: "Bidder Management", icon: <Users size={20} /> },
    {
      id: "payments",
      label: "Payments & Reporting",
      icon: <DollarSign size={20} />,
    },
    { id: "notifications", label: "Notifications", icon: <Bell size={20} /> },
    
    { id: "inquiries", label: "User Inquiries", icon: <Mail size={20} /> },
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    // Close sidebar on mobile when tab is selected
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleOverlayClick = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "auctions":
        return <AuctionManagement />;
      case "lots":
        return <LotManagement />;
      case "bidders":
        return <BidderManagement />;
      case "payments":
        return <PaymentsReporting />;
      case "notifications":
        return <NotificationsManagement />;
      
      case "inquiries": // ✅ Added
        return <UserInquiries />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 relative">
      {/* Mobile Menu Button - Fixed position when sidebar is closed on mobile */}
      {isMobile && !sidebarOpen && (
        <div className="md:hidden absolute top-2 left-4 ">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-10 h-10 flex items-center justify-center bg-white border border-gray-300 rounded-lg shadow-lg"
          >
            <Menu size={20} />
          </button>
        </div>
      )}

      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={handleOverlayClick}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          ${
            isMobile
              ? `fixed left-0 top-16 h-full z-50 transform transition-transform duration-300 ${
                  sidebarOpen ? "translate-x-0" : "-translate-x-full"
                } w-64`
              : `${sidebarOpen ? "w-64" : "w-16"} transition-all duration-300`
          }
          bg-white border-r shadow-lg flex flex-col
        `}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h1
            className={`text-lg font-bold ${sidebarOpen ? "block" : "hidden"}`}
          >
            Admin Panel
          </h1>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        <nav className="flex-1 p-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`flex items-center w-full px-3 py-2 rounded-lg mb-1 text-sm font-medium transition ${
                activeTab === item.id
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-200 text-gray-700"
              }`}
            >
              {item.icon}
              {sidebarOpen && <span className="ml-2">{item.label}</span>}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <main
        className={`
          flex-1 p-6 overflow-y-auto
          ${isMobile ? "w-full" : ""}
          ${isMobile && !sidebarOpen ? "pt-16" : ""}
        `}
      >
        {renderContent()}
      </main>
    </div>
  );
}
