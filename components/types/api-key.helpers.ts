import { toast } from "sonner";
import { ApiKey } from "@/components/types/api-key";

// Key to store the session flag in sessionStorage
export const SESSION_KEY_SEEN_FLAG_PREFIX = "apiKeySeen_";

// Helper to format date string
export const formatDate = (dateString: string): string => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Copy API key to clipboard
export const copyToClipboard = async (text: string, successMessage?: string, errorMessage?: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(successMessage || "Copied to clipboard!");
  } catch {
    toast.error(errorMessage || "Failed to copy to clipboard.");
  }
};

// --- Mock API Functions (for simulation) ---
// In a real app, these would be actual API calls.

export const mockFetchApiKeys = async (): Promise<{ currentKey: ApiKey | null; history: ApiKey[]; plainKey?: string }> => {
  return new Promise((resolve) =>
    setTimeout(() => {
      // Simulate that 'initialMockFullKey' is returned ONLY if the current key has NOT been seen yet
      // or if it's a new session.
      const existingKeyId = "abc123";
      const initialMockFullKey = "ff_sk_abcd1234efgh5678ijkl9012mnop3456";
      const hasKeyBeenSeenInSession = sessionStorage.getItem(`${SESSION_KEY_SEEN_FLAG_PREFIX}${existingKeyId}`) === "true";

      const mockCurrentKey: ApiKey = {
        id: existingKeyId,
        partialKey: "ff_sk_****_****_****_3456",
        fullKey: hasKeyBeenSeenInSession ? undefined : initialMockFullKey, // Only include fullKey if not seen
        createdAt: "2024-06-07T15:00:00Z", // Fixed timestamp for consistency
        status: "active",
      };
      const mockHistory: ApiKey[] = [
        {
          id: "1",
          partialKey: "ff_sk_****_****_****_1a2b",
          createdAt: "2024-06-05T10:30:00Z",
          revokedAt: "2024-06-06T14:20:00Z",
          status: "revoked",
        },
        {
          id: "2",
          partialKey: "ff_sk_****_****_****_3c4d",
          createdAt: "2024-06-04T09:15:00Z",
          revokedAt: "2024-06-05T10:30:00Z",
          status: "revoked",
        },
      ];
      resolve({
        currentKey: mockCurrentKey,
        history: mockHistory,
        plainKey: hasKeyBeenSeenInSession ? undefined : initialMockFullKey // Only plainKey if it hasn't been seen
      });
    }, 1000)
  );
};

export const mockGenerateNewApiKey = async (): Promise<{ newKey: ApiKey; plainKey: string }> => {
  return new Promise((resolve) =>
    setTimeout(() => {
      const newFullKey = `ff_sk_${Math.random()
        .toString(36)
        .substring(2, 15)}_${Math.random()
        .toString(36)
        .substring(2, 15)}_${Math.random()
        .toString(36)
        .substring(2, 15)}_${Math.random().toString(36).substring(2, 6)}`;

      const newPartialKey = `ff_sk_****_****_****_${newFullKey.slice(-4)}`;
      const newKeyId = Date.now().toString(); // New unique ID for the new key

      resolve({
        newKey: {
          id: newKeyId,
          partialKey: newPartialKey,
          fullKey: newFullKey, // Full key is present only immediately after creation
          createdAt: new Date().toISOString(),
          status: "active",
        },
        plainKey: newFullKey,
      });
    }, 1500)
  );
};

// Simulate API call for revoking a key
export const mockRevokeApiKey = async (keyId: string): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, 500));
};