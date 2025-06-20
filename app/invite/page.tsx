"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import InvalidInvitePage from "./InvalidInvitePage";
import ValidInvitePage from "./ValidInvitePage";

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
    // If logged in, ignore invite and go to home
    if (userEmail) {
      router.replace("/");
      return;
    }
    const token = searchParams.get("token");
    if (token) {
      saveInviteToken(token, "localStorage");
      // For now, just statically mark as valid if token exists
      setStatus('valid');
    } else {
      setStatus('invalid');
    }
  }, [searchParams, router, userEmail]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      {status === 'pending' && <div>Checking invite token...</div>}
      {status === 'invalid' && <InvalidInvitePage />}
      {status === 'valid' && (
        <ValidInvitePage />
      )}
    </div>
  );
}
