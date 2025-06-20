import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

/**
 * Custom hook to handle session check and redirect to /auth/login if not authenticated.
 * Only runs on non-auth routes.
 */
export function useSessionRedirect() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let winPath = '';
    if (typeof window !== 'undefined') {
      winPath = window.location.pathname;
    }
    if (!pathname || !winPath) {
      return;
    }
    const isAuthRoute = pathname.startsWith("/auth");
    const isInviteRoute = pathname === "/invite";
    if (!isAuthRoute && !isInviteRoute) {
      supabase.auth.getSession().then((result) => {
        const { data: { session } } = result;
        if (!session) {
          router.replace("/auth/login");
        }
      });
    }
  }, [pathname, router]);
}
