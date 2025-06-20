"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import InvalidInvitePage from "./InvalidInvitePage";
import ValidInvitePage from "./ValidInvitePage";
import InviteTokenChecking from "./InviteTokenChecking";
import { apiPut } from "@/lib/apiClient";

// Utility to store/retrieve invite token
type StorageType = "localStorage" | "cookie";
const INVITE_TOKEN_KEY = "inviteToken";

function saveInviteToken(token: string, type: StorageType = "localStorage") {
  if (type === "localStorage") {
    window.localStorage.setItem(INVITE_TOKEN_KEY, token);
  } else {
    document.cookie = `${INVITE_TOKEN_KEY}=${token}; path=/;`;
  }
}

export default function InvitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userEmail = useSupabaseUser();
  const [status, setStatus] = useState<'pending'|'valid'|'invalid'>('pending');

  useEffect(() => {
    if (userEmail) {
      router.replace("/");
      return;
    }
    const token = searchParams.get("token");
    if (token) {
      saveInviteToken(token, "localStorage");
      setStatus('pending');
      apiPut<{ valid: boolean; email?: string; error?: string }>(
        "/wait-list-signup/verify-invite",
        { token }
      )
        .then((res) => {
          if (res.valid && res.email) {
            setStatus('valid');
          } else {
            setStatus('invalid');
          }
        })
        .catch(() => {
          setStatus('invalid');
        });
    } else {
      setStatus('invalid');
    }
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
