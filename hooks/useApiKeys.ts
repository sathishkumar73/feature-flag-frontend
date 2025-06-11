import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { ApiKey } from "@/components/types/api-key";
import { SESSION_KEY_SEEN_FLAG_PREFIX } from "@/components/types/api-key.helpers";
import { supabase } from "@/lib/supabaseClient";

export const useApiKeys = () => {
  const [currentKey, setCurrentKey] = useState<ApiKey | null>(null);
  const [keyHistory, setKeyHistory] = useState<ApiKey[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [isCurrentKeyRevealed, setIsCurrentKeyRevealed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const getAccessToken = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setAccessToken(session?.access_token || null);
    };
    getAccessToken();
  }, []);

  // Helper: fetch wrapper with auth header
  const authFetch = useCallback(
    async (input: RequestInfo, init?: RequestInit) => {
      if (!accessToken) {
        throw new Error("No access token available");
      }
      const headers = new Headers(init?.headers || {});
      headers.set("Authorization", `Bearer ${accessToken}`);
      headers.set("Content-Type", "application/json");

      const response = await fetch(input, { ...init, headers });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || response.statusText);
      }
      return response.json();
    },
    [accessToken]
  );

  // Mark a key as revealed (seen) in session storage
  const markKeyAsRevealed = useCallback((keyId: string) => {
    sessionStorage.setItem(`${SESSION_KEY_SEEN_FLAG_PREFIX}${keyId}`, "true");
    setIsCurrentKeyRevealed(true);
    setCurrentKey((prev) => (prev ? { ...prev, fullKey: undefined } : null));
  }, []);

  // Fetch keys on mount or when accessToken changes
  useEffect(() => {
    if (!accessToken) {
      setIsLoading(false);
      setCurrentKey(null);
      setKeyHistory([]);
      return;
    }

    async function fetchKeys() {
      try {
        setIsLoading(true);

        // 1. Fetch current active API key + plainKey
        const data = await authFetch("http://localhost:4000/api-keys");
        // data: { apiKey: ApiKey, plainKey: string }

        // 2. Fetch key history separately (adjust endpoint as per your backend)
        // const historyData = await authFetch(
        //   "http://localhost:4000/api-keys/history"
        // );
        // // historyData: ApiKey[]

        // setCurrentKey(data.apiKey);
        // setKeyHistory(historyData || []);

        if (data.apiKey) {
          const hasSeen =
            sessionStorage.getItem(
              `${SESSION_KEY_SEEN_FLAG_PREFIX}${data.apiKey.id}`
            ) === "true";
          if (!hasSeen && data.plainKey) {
            setCurrentKey({ ...data.apiKey, fullKey: data.plainKey });
            setShowNewKeyModal(true);
            setIsCurrentKeyRevealed(false);
          } else {
            setCurrentKey((prev) =>
              prev ? { ...prev, fullKey: undefined } : null
            );
            setIsCurrentKeyRevealed(true);
          }
        }
      } catch (error) {
        toast.error("Failed to load API key data.");
        setCurrentKey(null);
        setKeyHistory([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchKeys();
  }, [accessToken, authFetch, markKeyAsRevealed]);

  // Copy key to clipboard and mark as revealed
  const handleCopyKey = useCallback(
    (key: string) => {
      if (!currentKey) return;
      navigator.clipboard
        .writeText(key)
        .then(() => {
          toast.success("API key copied to clipboard");
          markKeyAsRevealed(currentKey.id);
          setShowNewKeyModal(false);
        })
        .catch(() => {
          toast.error("Failed to copy API key");
        });
    },
    [currentKey, markKeyAsRevealed]
  );

  // Close modal confirmation
  const handleModalCloseConfirmation = useCallback(() => {
    if (currentKey) {
      markKeyAsRevealed(currentKey.id);
    }
    setShowNewKeyModal(false);
  }, [currentKey, markKeyAsRevealed]);

  // Generate new API key
  const generateNewApiKey = useCallback(async () => {
    if (!accessToken) {
      toast.error("You must be logged in to generate a new API key");
      return;
    }
    setIsGenerating(true);
    try {
      // POST to /api-keys to generate new key
      // Backend returns { newKey: ApiKey, plainKey: string }
      const data = await authFetch("http://localhost:4000/api-keys", {
        method: "POST",
      });
      const { newKey, plainKey } = data;

      // Revoke old key if exists (optional call)
      if (currentKey) {
        try {
          await authFetch(`http://localhost:4000/api-keys/${currentKey.id}`, {
            method: "DELETE",
          });

          const revokedKey: ApiKey = {
            ...currentKey,
            status: "revoked" as const,
            revokedAt: new Date().toISOString(),
            fullKey: undefined,
          };
          setKeyHistory((prev) => [revokedKey, ...prev]);
          sessionStorage.removeItem(
            `${SESSION_KEY_SEEN_FLAG_PREFIX}${currentKey.id}`
          );
        } catch {
          // ignore revoke failure
        }
      }

      setCurrentKey({ ...newKey, fullKey: plainKey });
      setIsCurrentKeyRevealed(false);
      sessionStorage.removeItem(`${SESSION_KEY_SEEN_FLAG_PREFIX}${newKey.id}`);
      setShowNewKeyModal(true);

      toast.success("API Key Generated", {
        description:
          "Your new API key has been generated successfully. Make sure to copy it now - you won't be able to see it again!",
      });
    } catch {
      toast.error("Failed to generate new API key.");
    } finally {
      setIsGenerating(false);
    }
  }, [accessToken, currentKey, authFetch, markKeyAsRevealed]);

  // Revoke current API key
  const revokeCurrentKey = useCallback(async () => {
    if (!accessToken) {
      toast.error("You must be logged in to revoke an API key");
      return;
    }
    if (!currentKey) return;
    try {
      await authFetch(`http://localhost:4000/api-keys/${currentKey.id}`, {
        method: "DELETE",
      });

      const revokedKey: ApiKey = {
        ...currentKey,
        status: "revoked" as const,
        revokedAt: new Date().toISOString(),
        fullKey: undefined,
      };
      setKeyHistory((prev) => [revokedKey, ...prev]);
      setCurrentKey(null);
      setIsCurrentKeyRevealed(false);
      sessionStorage.removeItem(
        `${SESSION_KEY_SEEN_FLAG_PREFIX}${currentKey.id}`
      );
      toast.success("API Key Revoked");
    } catch {
      toast.error("Failed to revoke API key.");
    }
  }, [accessToken, currentKey, authFetch]);

  return {
    currentKey,
    keyHistory,
    isGenerating,
    showNewKeyModal,
    setShowNewKeyModal,
    isCurrentKeyRevealed,
    isLoading,
    generateNewApiKey,
    revokeCurrentKey,
    handleCopyKey,
    handleModalCloseConfirmation,
  };
};
