"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import InvalidInvitePage from "./InvalidInvitePage";
import ValidInvitePage from "./ValidInvitePage";
import InviteTokenChecking from "./InviteTokenChecking";
import { apiPut } from "@/lib/apiClient";

function InvitePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userEmail = useSupabaseUser();
  const [status, setStatus] = useState<'pending'|'valid'|'invalid'>('pending');

  useEffect(() => {
    // Only use ?token=...
    const inviteToken = searchParams.get("token");
    if (inviteToken) {
      localStorage.setItem("gr_invite_token", inviteToken);
      setStatus('pending');
      // Always verify and set gr_is_beta_user, even if logged in
      apiPut<{ valid: boolean; email?: string; error?: string }>(
        "/wait-list-signup/verify-invite",
        { token: inviteToken }
      )
        .then((res) => {
          if (res.valid && res.email) {
            localStorage.setItem("gr_is_beta_user", "true");
            setStatus('valid');
          } else {
            localStorage.setItem("gr_is_beta_user", "false");
            setStatus('invalid');
          }
        })
        .catch(() => {
          localStorage.setItem("gr_is_beta_user", "false");
          setStatus('invalid');
        });
      return;
    }
    // If logged in and no token in URL, redirect to home
    if (userEmail) {
      router.replace("/");
      return;
    }
    setStatus('invalid');
  }, [searchParams, router, userEmail]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      {status === 'pending' && <InviteTokenChecking />}
      {status === 'invalid' && <InvalidInvitePage />}
      {status === 'valid' && (
        <ValidInvitePage />
      )}
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <InvitePageContent />
    </Suspense>
  );
}
