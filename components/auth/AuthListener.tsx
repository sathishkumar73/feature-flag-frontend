import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";

interface AuthListenerProps {
  children: React.ReactNode;
}

const AuthListener: React.FC<AuthListenerProps> = ({ children }) => {
  const prevSession = useRef<any>(null);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          // Only upsert if there was no previous session (i.e., a real sign-in)
          if (!prevSession.current) {
            try {
              await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/upsert`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                  email: session.user.email,
                  id: session.user.id,
                }),
              });
            } catch (err) {
              console.error("Backend upsert failed:", err);
            }
          }
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