"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function VerifyEmail() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Parse hash fragment from URL (everything after #)
    const hash = window.location.hash.substring(1); // Remove leading '#'
    const params = new URLSearchParams(hash);

    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");

    if (!access_token || !refresh_token) {
      setError("Verification failed: missing tokens.");
      setLoading(false);
      return;
    }

    // Set Supabase session with extracted tokens
    supabase.auth.setSession({
      access_token,
      refresh_token,
    }).then(({ error }) => {
      if (error) {
        setError("Failed to set session: " + error.message);
        setLoading(false);
      } else {
        // Redirect to dashboard or home page after successful verification
        router.replace("/flags");
      }
    });
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-center text-lg">Verifying your email...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-center text-red-600 font-semibold">{error}</p>
      </div>
    );
  }

  return null; // Optionally render nothing while redirecting
}
