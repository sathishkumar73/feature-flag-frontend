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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const isAuthRoute = pathname?.startsWith("/auth");

  const segments = pathname.split("/").filter(Boolean);

  useEffect(() => {
    console.log('[DEBUG] Pathname:', pathname, 'AuthRoute:', isAuthRoute);
    let winPath = '';
    if (typeof window !== 'undefined') {
      winPath = window.location.pathname;
      console.log('[DEBUG] window.location.pathname:', winPath);
      // Log cookies for debugging session/cookie issues
      console.log('[DEBUG] document.cookie:', document.cookie);
      // Log user agent and platform
      console.log('[DEBUG] navigator.userAgent:', navigator.userAgent);
      console.log('[DEBUG] navigator.platform:', navigator.platform);
      // Log localStorage and sessionStorage keys
      try {
        console.log('[DEBUG] localStorage keys:', Object.keys(localStorage));
        console.log('[DEBUG] sessionStorage keys:', Object.keys(sessionStorage));
        // Log the actual Supabase auth token value
        const sbToken = localStorage.getItem('sb-cdfhghmnbrmqjpoxqpit-auth-token');
        console.log('[DEBUG] sb-cdfhghmnbrmqjpoxqpit-auth-token:', sbToken);
      } catch (e) {
        console.log('[DEBUG] localStorage/sessionStorage not available:', e);
      }
    }
    if (!pathname || !winPath) {
      console.log('[DEBUG] Pathname or window.location.pathname is empty, skipping session check.');
      return;
    }
    if (!isAuthRoute) {
      supabase.auth.getSession().then((result) => {
        console.log('[DEBUG] supabase.auth.getSession FULL result:', result);
        const { data: { session }, error } = result;
        console.log('[DEBUG] supabase.auth.getSession result:', { session, error });
        if (error) {
          console.error('[DEBUG] supabase.auth.getSession error:', error);
        }
        if (!session) {
          console.log('[DEBUG] No session found, redirecting to /auth/login');
          router.replace("/auth/login");
        } else {
          setSession(session);
        }
        setLoading(false);
      }).catch((err) => {
        console.error('[DEBUG] Error in supabase.auth.getSession:', err);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [isAuthRoute, router, pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setShowLogoutModal(false);
    router.replace("/auth/login");
  };

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
            {children}
            <Toaster />
          </AuthListener>
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
                <main className="flex-1 bg-white min-h-screen">{children}</main>
              </div>
            </SidebarInset>
          </SidebarProvider>
          <Toaster />
        </AuthListener>
      </body>
    </html>
  );
}
