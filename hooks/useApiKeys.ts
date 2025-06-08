import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { ApiKey } from "@/components/types/api-key";
import {
  SESSION_KEY_SEEN_FLAG_PREFIX,
  mockFetchApiKeys,
  mockGenerateNewApiKey,
  mockRevokeApiKey,
  copyToClipboard as utilCopyToClipboard, // Rename to avoid conflict
} from "@/components/types/api-key.helpers";

export const useApiKeys = () => {
  const [currentKey, setCurrentKey] = useState<ApiKey | null>(null);
  const [keyHistory, setKeyHistory] = useState<ApiKey[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showNewKeyModal, setShowNewKeyModal] = useState(false); // Controls the "show full key once" modal
  const [isCurrentKeyRevealed, setIsCurrentKeyRevealed] = useState(false); // Tracks if current active key's full value has been confirmed/seen this session
  const [isLoading, setIsLoading] = useState(true);

  // Function to mark a key as "seen" in session storage and update state
  const markKeyAsRevealed = useCallback((keyId: string) => {
    sessionStorage.setItem(`${SESSION_KEY_SEEN_FLAG_PREFIX}${keyId}`, "true");
    setIsCurrentKeyRevealed(true);
    setCurrentKey(prev => prev ? { ...prev, fullKey: undefined } : null); // Remove fullKey from state
  }, []);

  // Effect to fetch initial API key data on mount
  useEffect(() => {
    async function fetchKeys() {
      try {
        setIsLoading(true);
        const { currentKey: fetchedCurrentKey, history: fetchedHistory, plainKey: initialPlainKey } = await mockFetchApiKeys();

        setCurrentKey(fetchedCurrentKey);
        setKeyHistory(fetchedHistory);

        // Logic for the "show full key once" modal on initial load
        if (fetchedCurrentKey) {
          const hasSeen = sessionStorage.getItem(`${SESSION_KEY_SEEN_FLAG_PREFIX}${fetchedCurrentKey.id}`) === "true";
          if (!hasSeen && initialPlainKey) {
            // If the backend sent a plainKey AND it hasn't been seen yet, show the modal
            // The plainKey is temporarily stored in currentKey.fullKey for the modal
            setCurrentKey({ ...fetchedCurrentKey, fullKey: initialPlainKey });
            setShowNewKeyModal(true);
            setIsCurrentKeyRevealed(false);
          } else {
            // If already seen, ensure fullKey is undefined and set as revealed
            setCurrentKey(prev => prev ? { ...prev, fullKey: undefined } : null);
            setIsCurrentKeyRevealed(true);
          }
        }
      } catch (error) {
        toast.error("Failed to load API key data.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchKeys();
  }, [markKeyAsRevealed]); // Add markKeyAsRevealed to dependencies to prevent stale closure

  // Function to handle copying the key from the modal
  const handleCopyKey = useCallback((key: string) => {
    if (currentKey) {
      utilCopyToClipboard(key, "API key copied to clipboard");
      markKeyAsRevealed(currentKey.id); // Mark the current key as revealed
      setShowNewKeyModal(false); // Close the modal
    }
  }, [currentKey, markKeyAsRevealed]);

  // Function to handle modal close when user confirms they've copied it
  const handleModalCloseConfirmation = useCallback(() => {
    if (currentKey) {
      markKeyAsRevealed(currentKey.id); // Mark the current key as revealed
    }
    setShowNewKeyModal(false);
  }, [currentKey, markKeyAsRevealed]);

  // Generate a new API key
  const generateNewApiKey = useCallback(async () => {
    setIsGenerating(true);
    try {
      const { newKey, plainKey } = await mockGenerateNewApiKey();

      // Revoke old key if exists
      if (currentKey) {
        // Simulate backend revocation (optional: await mockRevokeApiKey(currentKey.id);)
        const revokedKey: ApiKey = {
          ...currentKey,
          status: "revoked" as const,
          revokedAt: new Date().toISOString(),
          fullKey: undefined, // Ensure fullKey is removed from revoked key
        };
        setKeyHistory((prev) => [revokedKey, ...prev]);
        sessionStorage.removeItem(`${SESSION_KEY_SEEN_FLAG_PREFIX}${currentKey.id}`);
      }

      // Set new key as current
      setCurrentKey({ ...newKey, fullKey: plainKey }); // Temporarily store fullKey for modal display
      setIsCurrentKeyRevealed(false); // Reset revealed state for the NEW key
      sessionStorage.removeItem(`${SESSION_KEY_SEEN_FLAG_PREFIX}${newKey.id}`); // Ensure new key is not marked as seen

      setShowNewKeyModal(true); // Always show modal for a newly generated key

      toast.success("API Key Generated", {
        description: "Your new API key has been generated successfully. Make sure to copy it now - you won't be able to see it again!",
      });
    } catch {
      toast.error("Failed to generate new API key.");
    } finally {
      setIsGenerating(false);
    }
  }, [currentKey, markKeyAsRevealed]); // currentKey is a dependency because we need its ID to revoke it

  // Revoke current key
  const revokeCurrentKey = useCallback(async () => {
    if (!currentKey) return;
    try {
      await mockRevokeApiKey(currentKey.id); // Simulate backend call

      const revokedKey: ApiKey = {
        ...currentKey,
        status: "revoked" as const,
        revokedAt: new Date().toISOString(),
        fullKey: undefined, // Ensure fullKey is removed from revoked key
      };
      setKeyHistory((prev) => [revokedKey, ...prev]);
      setCurrentKey(null); // No active key
      setIsCurrentKeyRevealed(false); // Reset revealed state
      sessionStorage.removeItem(`${SESSION_KEY_SEEN_FLAG_PREFIX}${currentKey.id}`); // Clear session flag
      toast.success("API Key Revoked");
    } catch {
      toast.error("Failed to revoke API key.");
    }
  }, [currentKey]);

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