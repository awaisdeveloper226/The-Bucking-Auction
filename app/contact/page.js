// app/contact/page.js
"use client";

import { useState } from "react";
import { Mail, User, MessageSquare, Send, Loader2, CheckCircle2, XCircle } from "lucide-react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [status, setStatus] = useState({ message: "", type: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ message: "Sending your message...", type: "info" });

    // Simulate sending form
    setTimeout(() => {
      setLoading(false);
      setStatus({ message: "✅ Message sent successfully!", type: "success" });
      setFormData({ name: "", email: "", message: "" });

      // Auto-hide success message
      setTimeout(() => setStatus({ message: "", type: "" }), 3000);
    }, 1200);
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8 sm:p-10 transition-all duration-300 hover:shadow-2xl">
        
        {/* Heading */}
        <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">
          Contact Us
        </h1>
        <p className="text-center text-gray-600 mb-10 max-w-xl mx-auto">
          Have questions or feedback? Fill out the form below, and we’ll get back to you shortly.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="John Doe"
                className="pl-10 pr-4 py-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#6ED0CE] focus:ring focus:ring-[#6ED0CE]/50"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className="pl-10 pr-4 py-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#6ED0CE] focus:ring focus:ring-[#6ED0CE]/50"
              />
            </div>
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-1">
              Your Message
            </label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-4 text-gray-400" size={18} />
              <textarea
                id="message"
                name="message"
                rows="5"
                value={formData.message}
                onChange={handleChange}
                required
                placeholder="Write your message here..."
                className="pl-10 pr-4 py-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#6ED0CE] focus:ring focus:ring-[#6ED0CE]/50"
              ></textarea>
            </div>
          </div>

          {/* Submit */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#6ED0CE] text-white py-3 px-4 rounded-md shadow hover:bg-[#4DB1B1] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6ED0CE] flex items-center justify-center gap-2 transition-all duration-300"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Send Message
                </>
              )}
            </button>
          </div>
        </form>

        {/* Status Message */}
        {status.message && (
          <div
            className={`mt-6 p-3 rounded-md text-center text-sm font-medium flex items-center justify-center gap-2 transition-all duration-300
              ${status.type === "success" ? "bg-green-50 text-green-700" : ""}
              ${status.type === "info" ? "bg-blue-50 text-blue-700" : ""}
              ${status.type === "error" ? "bg-red-50 text-red-700" : ""}`}
          >
            {status.type === "success" && <CheckCircle2 size={18} />}
            {status.type === "error" && <XCircle size={18} />}
            {status.message}
          </div>
        )}
      </div>
    </div>
  );
}
