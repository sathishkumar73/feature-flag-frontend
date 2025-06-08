"use client";

import React, { useState, useEffect } from "react";
import {
  Key,
  Copy,
  Plus,
  Eye,
  AlertTriangle,
  Trash2,
} from "lucide-react"; // EyeOff is no longer strictly needed if full key is removed
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

interface ApiKey {
  id: string;
  partialKey: string;
  fullKey?: string; // fullKey should only be present temporarily
  createdAt: string;
  revokedAt?: string;
  status: "active" | "revoked";
}

// Key to store the session flag in sessionStorage
const SESSION_KEY_SEEN_FLAG_PREFIX = "apiKeySeen_"; // Prefix to tie flag to specific key ID

// Helper to format date string
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const ApiKeyPage = () => {
  const [currentKey, setCurrentKey] = useState<ApiKey | null>(null);
  const [keyHistory, setKeyHistory] = useState<ApiKey[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showFullKeyModal, setShowFullKeyModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // This state tracks if the full key for the *current* active key has been revealed/confirmed
  // in the current session. This helps control the "Show" button and main display.
  const [isCurrentKeyRevealed, setIsCurrentKeyRevealed] = useState(false);

  // On mount, fetch key info from backend (simulate here)
  useEffect(() => {
    async function fetchKeys() {
      try {
        // Simulate API call: replace this with real API call
        // The plainKey would only be returned by the backend ONCE upon creation/initial fetch.
        const res = await new Promise<{ currentKey: ApiKey | null; history: ApiKey[]; plainKey?: string }>((resolve) =>
          setTimeout(() => {
            // For demonstration, let's assume `mockCurrentKey` comes with `fullKey` initially,
            // as if it was just generated or fetched for the first time.
            const initialMockFullKey = "ff_sk_abcd1234efgh5678ijkl9012mnop3456";
            const mockCurrentKey: ApiKey = {
              id: "abc123",
              partialKey: "ff_sk_****_****_****_3456",
              fullKey: initialMockFullKey, // Backend would only send this once
              createdAt: new Date().toISOString(),
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
            resolve({ currentKey: mockCurrentKey, history: mockHistory, plainKey: initialMockFullKey });
          }, 1000)
        );

        setCurrentKey(res.currentKey);
        setKeyHistory(res.history);

        // Check if the current key's full value has been seen in this session
        // This is crucial for the "visible only once per session" logic
        if (res.currentKey && res.plainKey) {
            const hasSeen = sessionStorage.getItem(`${SESSION_KEY_SEEN_FLAG_PREFIX}${res.currentKey.id}`) === "true";
            if (!hasSeen) {
                // If not seen, show the modal and mark the key as not yet revealed
                setShowFullKeyModal(true);
                setIsCurrentKeyRevealed(false);
            } else {
                // If already seen, remove fullKey from state immediately and mark as revealed
                setCurrentKey(prev => prev ? { ...prev, fullKey: undefined } : null);
                setIsCurrentKeyRevealed(true);
            }
        } else {
            // If no plainKey was returned (e.g., typical subsequent page load),
            // assume it's already "revealed" for display purposes.
            setIsCurrentKeyRevealed(true);
        }

      } catch (error) {
        toast.error("Failed to load API key data.");
      }
    }
    fetchKeys();
  }, []);

  // Copy API key to clipboard
  const copyToClipboard = async (key: string) => {
    if (!currentKey) return;
    try {
      await navigator.clipboard.writeText(key);
      toast.success("API key copied to clipboard");
      // Mark as revealed/copied for this session
      setIsCurrentKeyRevealed(true);
      sessionStorage.setItem(`${SESSION_KEY_SEEN_FLAG_PREFIX}${currentKey.id}`, "true");
      // Remove fullKey from state after copy for security
      setCurrentKey((prev) => prev ? { ...prev, fullKey: undefined } : prev);
      setShowFullKeyModal(false); // Close the modal
    } catch {
      toast.error("Failed to copy API key");
    }
  };

  // Confirm that user copied the key (if they just close the modal)
  const handleModalCloseWithoutCopy = () => {
    if (!currentKey) return;
    // If the modal is closed and the key hasn't been explicitly copied yet (i.e., fullKey still exists in state)
    // we still mark it as "seen" for this session to prevent the modal from reappearing.
    if (currentKey.fullKey) {
        setIsCurrentKeyRevealed(true);
        sessionStorage.setItem(`${SESSION_KEY_SEEN_FLAG_PREFIX}${currentKey.id}`, "true");
        setCurrentKey((prev) => prev ? { ...prev, fullKey: undefined } : prev); // Remove full key from state
    }
    setShowFullKeyModal(false);
  };


  // Generate a new API key - call backend, show modal with new plain key
  const generateNewApiKey = async () => {
    setIsGenerating(true);
    try {
      // Replace with real API call:
      const res = await new Promise<{ newKey: ApiKey; plainKey: string }>((resolve) =>
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

      // Revoke old key in history
      if (currentKey) {
        const revokedKey: ApiKey = {
          ...currentKey,
          status: "revoked" as const,
          revokedAt: new Date().toISOString(),
          fullKey: undefined,
        };
        setKeyHistory((prev) => [revokedKey, ...prev]);
        // Clear session storage flag for the old key, though not strictly necessary as it's revoked
        sessionStorage.removeItem(`${SESSION_KEY_SEEN_FLAG_PREFIX}${currentKey.id}`);
      }

      setCurrentKey(res.newKey);
      // Reset the "revealed" state for the NEW key
      setIsCurrentKeyRevealed(false);
      // Clear session storage flag for the NEW key, as it's new and unseen
      sessionStorage.removeItem(`${SESSION_KEY_SEEN_FLAG_PREFIX}${res.newKey.id}`);
      setShowFullKeyModal(true); // Always show modal for new key
      setShowConfirmDialog(false);

      toast.success("API Key Generated", {
        description:
          "Your new API key has been generated successfully. Make sure to copy it now - you won't be able to see it again!",
      });
    } catch {
      toast.error("Failed to generate new API key.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Revoke current key (simulate)
  const revokeCurrentKey = () => {
    if (!currentKey) return;
    const revokedKey: ApiKey = {
      ...currentKey,
      status: "revoked" as const,
      revokedAt: new Date().toISOString(),
      fullKey: undefined,
    };
    setKeyHistory((prev) => [revokedKey, ...prev]);
    setCurrentKey(null); // No active key
    setShowFullKeyModal(false); // Close any open modal
    setIsCurrentKeyRevealed(false); // Reset revealed state
    sessionStorage.removeItem(`${SESSION_KEY_SEEN_FLAG_PREFIX}${currentKey.id}`); // Clear session flag
    toast.success("API Key Revoked");
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Key className="h-8 w-8 text-primary" />
              API Key Management
            </h1>
            <p className="text-muted-foreground">
              Manage your Feature Flag API keys for secure integration
            </p>
          </div>
        </div>

        {/* Current API Key Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Current API Key
              <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogTrigger asChild>
                  {/* Disable generate button if there's an active key and its full value hasn't been copied/confirmed yet */}
                  <Button className="gap-2" disabled={!!currentKey && !isCurrentKeyRevealed}>
                    <Plus className="h-4 w-4" />
                    Generate New API Key
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      Generate New API Key
                    </DialogTitle>
                    <DialogDescription className="space-y-2">
                      <p>Generating a new API key will immediately revoke your current key.</p>
                      <p className="font-medium text-foreground">
                        This action cannot be undone. Make sure to update all applications using the current key.
                      </p>
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex gap-3 pt-4">
                    <Button variant="outline" onClick={() => setShowConfirmDialog(false)} className="flex-1">
                      Cancel
                    </Button>
                    <Button onClick={generateNewApiKey} disabled={isGenerating} className="flex-1">
                      {isGenerating ? "Generating..." : "Generate Key"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardTitle>
            <CardDescription>Your active API key for accessing the Feature Flag service</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentKey ? (
              <>
                {/* API Key Display */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">API Key:</span>
                    <div className="flex items-center gap-2">
                      {/* Show button only if full key is *not* already revealed for this session */}
                      {!isCurrentKeyRevealed && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowFullKeyModal(true)}
                          className="h-8 gap-1"
                          disabled={!currentKey.fullKey} // Disable if fullKey isn't even in state
                        >
                          <Eye className="h-3 w-3" />
                          Show
                        </Button>
                      )}
                      <Button variant="destructive" size="sm" onClick={revokeCurrentKey} className="h-8 gap-1">
                        <Trash2 className="h-3 w-3" />
                        Revoke
                      </Button>
                    </div>
                  </div>

                  {/* The actual key display */}
                  <div className="p-3 bg-muted rounded-lg font-mono text-sm break-all border">
                    {/* Display full key only if it's in state and not yet revealed for this session */}
                    {currentKey.fullKey && !isCurrentKeyRevealed
                      ? currentKey.fullKey
                      : currentKey.partialKey}
                  </div>

                  {/* Security Notice: only show if full key is temporarily present AND not yet revealed */}
                  {currentKey.fullKey && !isCurrentKeyRevealed && (
                    <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-amber-800 dark:text-amber-200">
                        <p className="font-medium">Security Notice</p>
                        <p>This is the only time you'll be able to see the complete API key. Make sure to copy and store it securely.</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Key Details */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <Badge variant="default" className="ml-2">
                      Active
                    </Badge>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Created:</span>
                    <span className="ml-2 text-sm">{formatDate(currentKey.createdAt)}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Active API Key</h3>
                <p className="text-muted-foreground mb-4">
                  Generate your first API key to start using the Feature Flag service
                </p>
                <Button onClick={() => setShowConfirmDialog(true)}>Generate API Key</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* API Key History */}
        <Card>
          <CardHeader>
            <CardTitle>API Key History</CardTitle>
            <CardDescription>Previous API keys and their status</CardDescription>
          </CardHeader>
          <CardContent>
            {keyHistory.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>API Key</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Revoked</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {keyHistory.map((key) => (
                    <TableRow key={key.id}>
                      <TableCell className="font-mono text-sm">{key.partialKey}</TableCell>
                      <TableCell>
                        <Badge variant={key.status === "active" ? "default" : "secondary"}>
                          {key.status === "active" ? "Active" : "Revoked"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{formatDate(key.createdAt)}</TableCell>
                      <TableCell className="text-sm">{key.revokedAt ? formatDate(key.revokedAt) : "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No API key history available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Show full key modal (for initial display or newly generated keys) */}
        <Dialog open={showFullKeyModal} onOpenChange={setShowFullKeyModal}>
            <DialogContent onEscapeKeyDown={handleModalCloseWithoutCopy}> {/* Handle ESC key */}
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Key className="h-5 w-5 text-primary" />
                        Your API Key
                    </DialogTitle>
                    <DialogDescription>
                        This is the only time you will be able to see the full API key. Please copy it securely.
                    </DialogDescription>
                </DialogHeader>
                <pre className="p-4 bg-muted rounded-md font-mono text-sm break-all">
                    {currentKey?.fullKey || "API Key not available"}
                </pre>
                <div className="flex gap-3 mt-4">
                    <Button
                        onClick={() => currentKey?.fullKey && copyToClipboard(currentKey.fullKey)}
                        className="flex-1"
                        disabled={!currentKey?.fullKey}
                    >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Key
                    </Button>
                    <Button
                        onClick={handleModalCloseWithoutCopy} // Use the combined handler
                        className="flex-1"
                        variant="outline"
                    >
                        I Have Copied / Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>

      </div>
    </div>
  );
};

export default ApiKeyPage;