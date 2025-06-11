import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

interface AuthListenerProps {
  children: React.ReactNode;
}

const AuthListener: React.FC<AuthListenerProps> = ({ children }) => {
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session) {
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
    );
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return <>{children}</>;
};

export default AuthListener; 