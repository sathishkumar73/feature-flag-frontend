"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthLayout from "@/components/auth/Authlayout";
import OAuthButtons from "@/components/auth/OAuthButtons";
import AuthService from "@/services/authService";
import { supabase } from "@/lib/supabaseClient";

interface LoginForm {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

const Signin: React.FC = () => {
  const router = useRouter();

  // Redirect signed-in users to /flags
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('[DEBUG] [login] useEffect supabase.auth.getSession:', { session, error });
      if (session) {
        router.replace("/flags");
      }
    });
  }, [router]);

  const [formData, setFormData] = useState<LoginForm>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      // Add a type for loginResult to avoid TS errors
      type LoginResult = {
        data?: {
          session?: {
            session?: { access_token: string; refresh_token: string }
          }
        }
      };
      const loginResult = (await AuthService.login({
        email: formData.email,
        password: formData.password,
      })) as LoginResult;
      console.log('[DEBUG] loginResult:', loginResult);

      const tokens = loginResult?.data?.session?.session;
      if (tokens && tokens.access_token && tokens.refresh_token) {
        console.log('[DEBUG] Setting session:', tokens);
        await supabase.auth.setSession({
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
        });
        // Wait a tick to ensure session is persisted
        await new Promise((res) => setTimeout(res, 100));
      }
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log('[DEBUG] post-login supabase.auth.getSession:', { session, error });
      router.replace("/flags");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Login failed";
      setErrors({ general: errorMessage });
      console.error('[DEBUG] [login] Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account to continue"
    >
      <OAuthButtons />

      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.general && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
            {errors.general}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter your email"
            className={
              errors.email
                ? "border-destructive focus-visible:ring-destructive"
                : ""
            }
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email && (
            <p id="email-error" className="text-sm text-destructive">
              {errors.email}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Enter your password"
            className={
              errors.password
                ? "border-destructive focus-visible:ring-destructive"
                : ""
            }
            aria-describedby={errors.password ? "password-error" : undefined}
          />
          {errors.password && (
            <p id="password-error" className="text-sm text-destructive">
              {errors.password}
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <Link
            href="/auth/forgot-password"
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            Forgot your password?
          </Link>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">
            Don&apos;t have an account?{" "}
          </span>
          <Link
            href="/auth/signup"
            className="text-primary hover:text-primary/80 transition-colors font-medium"
          >
            Sign up
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Signin;
