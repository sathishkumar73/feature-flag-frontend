"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthLayout from "@/components/auth/Authlayout";
import { supabase } from "@/lib/supabaseClient";

const ResetPassword = () => {
  const router = useRouter();

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Parse access_token and refresh_token from URL hash fragment
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.substring(1); // remove '#'
      const params = new URLSearchParams(hash);
      const token = params.get("access_token");
      const refresh = params.get("refresh_token");

      if (token) {
        setAccessToken(token);
        setRefreshToken(refresh);
      }
      // If token missing, no error set here
    }
  }, []);

  const validateForm = (): boolean => {
    setError(null);
    if (!password) {
      setError("Password is required.");
      return false;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (!accessToken) {
      // Redirect to forgot-password if no token
      router.replace("/auth/forgot-password");
      return;
    }

    setIsLoading(true);
    setError(null);
    setMessage(null);

    // Set the session manually with the reset token and refresh token if available
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken || "",
    });

    if (sessionError) {
      setError(sessionError.message);
      setIsLoading(false);
      return;
    }

    // Now update the user password
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
    } else {
      setMessage(
        "Password has been reset successfully! Redirecting to login..."
      );
      setTimeout(() => router.replace("/auth/signin"), 3000);
    }

    setIsLoading(false);
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your new password below"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
            {error}
          </div>
        )}
        {message && (
          <div className="p-3 text-sm text-primary bg-primary/10 border border-primary/20 rounded-md">
            {message}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Resetting password..." : "Reset Password"}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;
