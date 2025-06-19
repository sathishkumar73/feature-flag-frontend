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
  const markKeyAsRevealed = useCallback((keyId: string | number | undefined) => {
    if (typeof keyId === 'undefined' || keyId === null) {
      toast.error('API key is not available. Please refresh and try again.');
      return;
    }
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
        // Support new backend: if data.history is missing, fetch history separately
        let history = data.history;
        if (!history) {
          // fallback: fetch history from /api-keys/history if available
          try {
            history = await apiGet<ApiKey[]>("/api-keys/history");
          } catch {}
        }
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
        setKeyHistory(history || []);
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
      if (!currentKey || typeof currentKey.id === 'undefined' || currentKey.id === null) {
        toast.error('API key is not available. Please refresh and try again.');
        return;
      }
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
    if (currentKey && typeof currentKey.id !== 'undefined' && currentKey.id !== null) {
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
      const data = await apiPost<{ newKey?: ApiKey; apiKey?: ApiKey; key?: ApiKey; plainKey: string }>("/api-keys/generate", {});
      // Handle backend response where apiKey is a string (the plain key)
      let newKey = data.newKey || data.key;
      let plainKey = data.plainKey;
      if (!newKey && typeof data.apiKey === 'string') {
        // Backend returns { apiKey: <plainKey> }
        newKey = { id: Date.now(), hashedKey: '', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        plainKey = data.apiKey;
      } else if (!newKey && typeof data.apiKey === 'object') {
        newKey = data.apiKey;
      }
      if (!newKey || typeof plainKey !== 'string') {
        console.error('[APIKEY] Invalid newKey or plainKey from backend:', data);
        toast.error("API key could not be generated. Please try again or contact support.");
        setIsGenerating(false);
        return;
      }
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
        } catch (err) {
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
      console.error('[APIKEY] Error generating new API key:', error);
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
      // Ensure id is sent as a string for backend validation
      await apiPut("/api-keys/revoke", { id: String(currentKey.id) });
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
