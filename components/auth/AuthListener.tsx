import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { apiPost } from "@/lib/apiClient";
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
          if (!prevSession.current) {
            (async () => {
              try {
                await apiPost(
                  "/auth/upsert",
                  {
                    email: session.user.email,
                    id: session.user.id,
                  }
                );
              } catch (err) {
                console.error("[AuthListener] Backend upsert failed (non-blocking):", err);
              }
            })();
          }
        }
        prevSession.current = session;
      }
    );
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