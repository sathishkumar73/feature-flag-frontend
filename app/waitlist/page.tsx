"use client";

import Loader3DCube from "@/components/ui/loader";
import { useWaitlist } from "@/hooks/useWaitlist";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";

import WaitlistTable from "./WaitlistTable";

export default function WaitlistPage() {
  const email = useSupabaseUser();
  const { data, loading, error } = useWaitlist(email || undefined);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader3DCube />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-start bg-background py-12">
      <div className="w-full max-w-5xl px-4">
        <h1 className="text-2xl font-bold mb-2">Waitlist Users</h1>
        <p className="mb-6 text-muted-foreground">
          Manage users who have signed up for the waitlist. Change their status, view details, and export data as needed.
        </p>
        <WaitlistTable data={data} error={error} />
      </div>
    </div>
  );
}