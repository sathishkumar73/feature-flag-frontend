"use client";

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // State to track if we are checking auth
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  // Check if current route starts with /auth to skip sidebar and guard
  const isAuthRoute = pathname?.startsWith("/auth");

  useEffect(() => {
    // Only check auth for non-auth routes
    if (!isAuthRoute) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
          // If no session, redirect to login
          router.replace("/auth/login");
        } else {
          setSession(session);
        }
        setLoading(false);
      });
    } else {
      // No auth check needed on auth pages
      setLoading(false);
    }
  }, [isAuthRoute, router]);

  if (loading) {
    // Show a loading spinner or placeholder while checking auth
    return (
      <html lang="en">
        <body className="flex items-center justify-center min-h-screen">
          <p>Loading...</p>
          <Toaster />
        </body>
      </html>
    );
  }

  if (isAuthRoute) {
    // Render auth pages without sidebar
    return (
      <html lang="en">
        <body>
          {children}
          <Toaster />
        </body>
      </html>
    );
  }

  // Render app layout with sidebar and breadcrumb for authenticated users
  return (
    <html lang="en">
      <body className="flex">
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/">Home</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Feature Flags</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </header>
            <div className="flex flex-1 flex-col gap-4">
              <main className="flex-1 bg-white min-h-screen">{children}</main>
            </div>
          </SidebarInset>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
