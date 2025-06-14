import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { ApiKey } from "@/components/types/api-key";
import { SESSION_KEY_SEEN_FLAG_PREFIX } from "@/components/types/api-key.helpers";
import { supabase } from "@/lib/supabaseClient";
import { apiGet, apiPost, apiDelete, apiPut } from "@/lib/apiClient";

export type ApiKeyWithFullKey = ApiKey & { fullKey?: string };

export const useApiKeys = () => {
  const [currentKey, setCurrentKey] = useState<ApiKeyWithFullKey | null>(null);
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

  // Mark a key as revealed (seen) in session storage
  const markKeyAsRevealed = useCallback((keyId: string | number) => {
    sessionStorage.setItem(`${SESSION_KEY_SEEN_FLAG_PREFIX}${String(keyId)}`, "true");
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
        const data = await apiGet<{ apiKey: ApiKey | null; history: ApiKey[]; plainKey?: string }>("/api-keys");
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
            setCurrentKey({ ...data.apiKey, fullKey: undefined });
            setIsCurrentKeyRevealed(true);
            setShowNewKeyModal(false);
          }
        } else {
          setCurrentKey(null);
          setShowNewKeyModal(false);
          setIsCurrentKeyRevealed(false);
        }
        setKeyHistory(data.history || []);
      } catch (error: unknown) {
        toast.error(error instanceof Error ? error.message : "Failed to load API key data.");
        setCurrentKey(null);
        setKeyHistory([]);
        setShowNewKeyModal(false);
        setIsCurrentKeyRevealed(false);
      } finally {
        setIsLoading(false);
      }
    }
    fetchKeys();
  }, [accessToken, markKeyAsRevealed]);

  // Copy key to clipboard and mark as revealed
  const handleCopyKey = useCallback(
    (key: string) => {
      if (!currentKey) return;
      navigator.clipboard
        .writeText(key)
        .then(() => {
          toast.success("API key copied to clipboard");
          markKeyAsRevealed(String(currentKey.id));
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
      markKeyAsRevealed(String(currentKey.id));
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
      const data = await apiPost<{ newKey: ApiKey; plainKey: string }>("/api-keys", {});
      const { newKey, plainKey } = data;
      if (currentKey) {
        try {
          await apiDelete(`/api-keys/${currentKey.id}`);
          const revokedKey: ApiKeyWithFullKey = {
            ...currentKey,
            isActive: false,
            fullKey: undefined,
          };
          setKeyHistory((prev) => [revokedKey, ...prev]);
          sessionStorage.removeItem(
            `${SESSION_KEY_SEEN_FLAG_PREFIX}${String(currentKey.id)}`
          );
        } catch {
          // ignore revoke failure
        }
      }
      setCurrentKey({ ...newKey, fullKey: plainKey });
      setIsCurrentKeyRevealed(false);
      sessionStorage.removeItem(`${SESSION_KEY_SEEN_FLAG_PREFIX}${String(newKey.id)}`);
      setShowNewKeyModal(true);
      toast.success("API Key Generated", {
        description:
          "Your new API key has been generated successfully. Make sure to copy it now - you won't be able to see it again!",
      });
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to generate new API key.");
    } finally {
      setIsGenerating(false);
    }
  }, [accessToken, currentKey, markKeyAsRevealed]);

  // Revoke current API key
  const revokeCurrentKey = useCallback(async () => {
    if (!accessToken) {
      toast.error("You must be logged in to revoke an API key");
      return;
    }
    if (!currentKey) return;
    try {
      await apiPut("/api-keys/revoke", { id: currentKey.id });
      const revokedKey: ApiKeyWithFullKey = {
        ...currentKey,
        isActive: false,
        fullKey: undefined,
      };
      setKeyHistory((prev) => [revokedKey, ...prev]);
      setCurrentKey(null);
      setIsCurrentKeyRevealed(false);
      sessionStorage.removeItem(
        `${SESSION_KEY_SEEN_FLAG_PREFIX}${String(currentKey.id)}`
      );
      toast.success("API Key Revoked");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to revoke API key.");
    }
  }, [accessToken, currentKey]);

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
