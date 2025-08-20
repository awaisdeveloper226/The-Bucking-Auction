"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    cellPhone: "",
    emailAddress: "",
    physicalAddress: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Registration failed");
        setLoading(false);
        return;
      }

      setSuccessData({ biddingNumber: data?.user?.biddingNumber });
      setShowModal(true);
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Create an Account
        </h2>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {["firstName","lastName","cellPhone","emailAddress","physicalAddress"].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-600 capitalize">
                {field.replace("cellPhone","Cell Phone").replace("emailAddress","Email").replace("physicalAddress","Address")}
              </label>
              <input
                type={field.includes("email") ? "email" : "text"}
                name={field}
                value={form[field]}
                onChange={handleChange}
                placeholder={`Enter your ${field}`}
                required
                className="mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-gray-600">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              minLength={6}
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white py-2 rounded-lg transition ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600 text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-2xl shadow-lg text-center w-96 animate-fadeIn">
            <h3 className="text-2xl font-bold text-green-600 mb-4">
              🎉 Registration Successful!
            </h3>
            <p className="text-gray-600 mb-4">
              Please check your email inbox to verify your account before logging in.
            </p>
            {successData?.biddingNumber && (
              <>
                <p className="text-lg font-semibold text-blue-600 mb-2">
                  Your Bidding Number: {successData.biddingNumber}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  By accepting a bidding number, you acknowledge and agree to the Terms & Conditions of The Bucking Auction as outlined on our website. Please note that these terms may be updated at any time without prior notice.
                </p>
              </>
            )}
            <button
              onClick={() => {
                setShowModal(false);
                router.push("/login");
              }}
              className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg"
            >
              Continue to Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
