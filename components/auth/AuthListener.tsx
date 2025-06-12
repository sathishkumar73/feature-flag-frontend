import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Session } from "@supabase/supabase-js";

interface AuthListenerProps {
  children: React.ReactNode;
}

const AuthListener: React.FC<AuthListenerProps> = ({ children }) => {
  const prevSession = useRef<Session | null>(null);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          // Only upsert if there was no previous session (i.e., a real sign-in)
          // if (!prevSession.current) {
          //   try {
          //     await apiPost(
          //       "/auth/upsert",
          //       {
          //         email: session.user.email,
          //         id: session.user.id,
          //       }
          //     );
          //   } catch (err) {
          //     console.error("Backend upsert failed:", err);
          //   }
          // }
        }
        // Update previous session ref for next event
        prevSession.current = session;
      }
    );
    // On mount, get the current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      prevSession.current = session;
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return <>{children}</>;
};

export default AuthListener;