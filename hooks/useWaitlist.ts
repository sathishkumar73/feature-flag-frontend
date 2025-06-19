"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/apiClient";

export interface WaitListSignup {
  id: string;
  name: string;
  email: string;
  status: "APPROVED" | "PENDING" | "REVOKED";
  company?: string;
  role?: string;
  challenges?: string;
  created_at: string;
}

export function useWaitlist(email: string | undefined) {
  const [data, setData] = useState<WaitListSignup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!email) return;
    setLoading(true);
    setError(null);
    apiGet<WaitListSignup[]>("/wait-list-signup", {}, { signal: undefined, headers: { "x-user-email": email } })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [email]);

  return { data, loading, error };
}
