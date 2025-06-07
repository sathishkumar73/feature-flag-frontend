"use client";

import React, { useState, useEffect } from "react";
import {
  Key,
  Copy,
  Plus,
  Eye,
  EyeOff,
  AlertTriangle,
  Trash2,
} from "lucide-react";
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
import { toast } from "sonner"

interface ApiKey {
  id: string;
  partialKey: string;
  fullKey?: string;
  createdAt: string;
  revokedAt?: string;
  status: "active" | "revoked";
}

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
  const [showFullKey, setShowFullKey] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    // Replace with your real API call
    const mockHistory: ApiKey[] = [
      {
        id: "1",
        partialKey: "ff_sk_****_****_****_7a3b",
        createdAt: "2024-06-05T10:30:00Z",
        revokedAt: "2024-06-06T14:20:00Z",
        status: "revoked",
      },
      {
        id: "2",
        partialKey: "ff_sk_****_****_****_9c2d",
        createdAt: "2024-06-04T09:15:00Z",
        revokedAt: "2024-06-05T10:30:00Z",
        status: "revoked",
      },
    ];
    setKeyHistory(mockHistory);
  }, []);

  const generateNewApiKey = async () => {
    setIsGenerating(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newFullKey = `ff_sk_${Math.random()
        .toString(36)
        .substring(2, 15)}_${Math.random()
        .toString(36)
        .substring(2, 15)}_${Math.random()
        .toString(36)
        .substring(2, 15)}_${Math.random().toString(36).substring(2, 6)}`;
      const newPartialKey = `ff_sk_****_****_****_${newFullKey.slice(-4)}`;

      const newKey: ApiKey = {
        id: Date.now().toString(),
        partialKey: newPartialKey,
        fullKey: newFullKey,
        createdAt: new Date().toISOString(),
        status: "active",
      };

      if (currentKey) {
        const revokedKey = {
          ...currentKey,
          status: "revoked",
          revokedAt: new Date().toISOString(),
          fullKey: undefined,
        };
        setKeyHistory((prev) => [revokedKey as ApiKey, ...prev]);
      }

      setCurrentKey(newKey);
      setShowFullKey(true);
      setShowConfirmDialog(false);

      toast.success("API Key Generated", {
        description:
          "Your new API key has been generated successfully. Make sure to copy it now - you won't be able to see it again!",
      });
    } catch (error) {
      toast.error("Error", {
        description: "Failed to generate new API key. Please try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied!", {
        description: "API key copied to clipboard",
      });
    } catch (error) {
      toast.error("Error", {
        description: "Failed to copy to clipboard",
      });
    }
  };

  const revokeCurrentKey = () => {
    if (currentKey) {
      const revokedKey = {
        ...currentKey,
        status: "revoked",
        revokedAt: new Date().toISOString(),
        fullKey: undefined,
      };
      setKeyHistory((prev) => [revokedKey as ApiKey, ...prev]);
      setCurrentKey(null);
      setShowFullKey(false);

      toast.success("API Key Revoked", {
        description: "Your API key has been revoked successfully.",
      });
    }
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
                  <Button className="gap-2">
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
                      <Button variant="ghost" size="sm" onClick={() => setShowFullKey(!showFullKey)} className="h-8 gap-1">
                        {showFullKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        {showFullKey ? "Hide" : "Show"}
                      </Button>
                      <Button variant="destructive" size="sm" onClick={revokeCurrentKey} className="h-8 gap-1">
                        <Trash2 className="h-3 w-3" />
                        Revoke
                      </Button>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="p-3 bg-muted rounded-lg font-mono text-sm break-all border">
                      {showFullKey && currentKey.fullKey ? currentKey.fullKey : currentKey.partialKey}
                    </div>
                    {showFullKey && currentKey.fullKey && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(currentKey.fullKey!)}
                        className="absolute top-2 right-2 h-7 gap-1"
                      >
                        <Copy className="h-3 w-3" />
                        Copy
                      </Button>
                    )}
                  </div>

                  {showFullKey && currentKey.fullKey && (
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
      </div>
    </div>
  );
};

export default ApiKeyPage;
