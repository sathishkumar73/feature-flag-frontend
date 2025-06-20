"use client";

import React from 'react';
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { AppSidebar } from "@/components/Sidebar";
import "./globals.css";
import { Toaster } from "sonner";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Loader3DCube from "@/components/ui/loader";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Session } from '@supabase/supabase-js';
import AuthListener from '@/components/auth/AuthListener';
import { useSessionRedirect } from "@/hooks/useSessionRedirect";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import NotInvitedPage from "@/app/NotInvitedPage";
import { apiGet } from "@/lib/apiClient";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const isAuthRoute = pathname?.startsWith("/auth");
  const isInviteRoute = pathname === "/invite";
  const segments = pathname.split("/").filter(Boolean);

  useSessionRedirect();

  useEffect(() => {
    if (isAuthRoute || isInviteRoute) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(async (result) => {
      const { data: { session } } = result;
      setSession(session);

      const token = localStorage.getItem("gr_invite_token");

      if (token) {
        setLoading(false);
        return;
      }

      if (session?.user?.email) {
        try {
          const res = await apiGet<{ found: boolean; invite_token?: string }>(
            "/wait-list-signup/invite-token",
            { email: session.user.email }
          );

          if (res.found && res.invite_token) {
            localStorage.setItem("gr_invite_token", res.invite_token);
            localStorage.setItem("gr_is_beta_user", "true");
            window.location.reload();
          } else {
            localStorage.setItem("gr_is_beta_user", "false");
            setLoading(false);
          }
        } catch (err) {
          localStorage.setItem("gr_is_beta_user", "false");
          console.error("Failed to fetch invite token:", err);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }).catch(() => {
      setLoading(false);
    });
  }, [isAuthRoute, isInviteRoute, pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setShowLogoutModal(false);
    router.replace("/auth/login");
  };

  if (isInviteRoute) {
    return (
      <html lang="en">
        <body>
          {children}
        </body>
      </html>
    );
  }

  if (pathname === "/") {
    if (loading) {
      return (
        <html lang="en">
          <body className="flex items-center justify-center min-h-screen">
            <AuthListener>
              <Loader3DCube />
              <Toaster />
            </AuthListener>
          </body>
        </html>
      );
    }
    if (session) {
      if (typeof window !== 'undefined') {
        window.location.replace('/flags');
      }
      return (
        <html lang="en">
          <body>
            <div style={{ padding: 40, textAlign: 'center' }}>
              <h1>Redirecting to your dashboard...</h1>
            </div>
          </body>
        </html>
      );
    }
    if (typeof window !== 'undefined') {
      window.location.replace('/auth/login');
    }
    return (
      <html lang="en">
        <body>
          <div style={{ padding: 40, textAlign: 'center' }}>
            <h1>Redirecting to signup...</h1>
          </div>
        </body>
      </html>
    );
  }

  if (loading) {
    return (
      <html lang="en">
        <body className="flex items-center justify-center min-h-screen">
          <AuthListener>
            <Loader3DCube />
            <Toaster />
          </AuthListener>
        </body>
      </html>
    );
  }

  if (isAuthRoute) {
    return (
      <html lang="en">
        <body>
          <AuthListener>
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
            <Toaster />
          </AuthListener>
        </body>
      </html>
    );
  }

  if (!isAuthRoute && !isInviteRoute && typeof window !== 'undefined' && !localStorage.getItem("gr_invite_token")) {
    return (
      <html lang="en">
        <body>
          <NotInvitedPage />
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body className="flex">
        <AuthListener>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4">
                <div className="flex items-center gap-2">
                  <SidebarTrigger className="-ml-1" />
                  <Separator orientation="vertical" className="mr-2 h-4" />
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem>
                        <BreadcrumbLink href="/">Home</BreadcrumbLink>
                      </BreadcrumbItem>
                      {segments.map((segment, idx) => {
                        const href = "/" + segments.slice(0, idx + 1).join("/");
                        const isLast = idx === segments.length - 1;
                        return (
                          <React.Fragment key={href}>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                              {isLast ? (
                                <BreadcrumbPage>
                                  {segment.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                                </BreadcrumbPage>
                              ) : (
                                <BreadcrumbLink href={href}>
                                  {segment.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                                </BreadcrumbLink>
                              )}
                            </BreadcrumbItem>
                          </React.Fragment>
                        );
                      })}
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>

                {session && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={() => setShowLogoutModal(true)}
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </Button>

                    <Dialog open={showLogoutModal} onOpenChange={setShowLogoutModal}>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Confirm Logout</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to logout? You will need to log in again to access the app.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="flex gap-2 justify-end">
                          <Button variant="outline" onClick={() => setShowLogoutModal(false)}>
                            Cancel
                          </Button>
                          <Button variant="destructive" onClick={handleLogout}>
                            Logout
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </>
                )}
              </header>
              <div className="flex flex-1 flex-col gap-4">
                <main className="flex-1 bg-white min-h-screen">
                  <ErrorBoundary>
                    {children}
                  </ErrorBoundary>
                </main>
              </div>
            </SidebarInset>
          </SidebarProvider>
          <Toaster />
        </AuthListener>
      </body>
    </html>
  );
}
