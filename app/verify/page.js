"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Create a separate component for the verification logic
function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("Verifying...");

  useEffect(() => {
    if (!token) {
      setStatus("Invalid verification link.");
      return;
    }

    const verifyEmail = async () => {
      try {
        const res = await fetch(`/api/verify?token=${token}`);
        const data = await res.json();

        if (res.ok) {
          setStatus("✅ Email verified! Redirecting to login...");
          setTimeout(() => router.push("/login"), 2000);
        } else {
          setStatus(`❌ ${data.message}`);
        }
      } catch (err) {
        setStatus("Server error.");
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <div className="container text-center mt-5">
      <h2>{status}</h2>
    </div>
  );
}

// Main component with Suspense boundary
export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="container text-center mt-5">
        <h2>Loading...</h2>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}