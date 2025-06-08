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

// --- API Functions ---
// These functions will be replaced with actual API calls in the future.

export const mockFetchApiKeys = async (): Promise<{ currentKey: ApiKey | null; history: ApiKey[]; plainKey?: string }> => {
  // TODO: Replace with actual API call
  return {
    currentKey: null,
    history: [],
  };
};

export const mockGenerateNewApiKey = async (): Promise<{ newKey: ApiKey; plainKey: string }> => {
  // TODO: Replace with actual API call
  throw new Error('Not implemented');
};

export const mockRevokeApiKey = async (keyId: string): Promise<void> => {
  // TODO: Replace with actual API call
  throw new Error('Not implemented');
};