"use client";
import React from 'react';
import { Eye, Trash2, Plus, AlertTriangle, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ApiKey } from '@/components/types/api-key';
import { formatDate } from '@/components/types/api-key.helpers';
import GenerateKeyConfirmDialog from '@/components/GenerateKeyConfirmDialog'; // Import the new dialog component

interface CurrentApiKeyCardProps {
  currentKey: ApiKey | null;
  isGenerating: boolean;
  isCurrentKeyRevealed: boolean;
  onGenerateNewKey: () => void;
  onRevokeKey: () => void;
  onShowNewKeyModal: () => void;
}

const CurrentApiKeyCard: React.FC<CurrentApiKeyCardProps> = ({
  currentKey,
  isGenerating,
  isCurrentKeyRevealed,
  onGenerateNewKey,
  onRevokeKey,
  onShowNewKeyModal,
}) => {
  // Determine if the "Generate New API Key" button should be disabled
  // It's disabled if there's an active key whose full value hasn't been confirmed/revealed yet.
  const isGenerateButtonDisabled = !!currentKey && !isCurrentKeyRevealed;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Current API Key
          <GenerateKeyConfirmDialog
            onConfirm={onGenerateNewKey}
            isGenerating={isGenerating}
            isDisabled={isGenerateButtonDisabled}
          />
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
                  {/* Show button only if the full key is temporarily present AND not yet revealed for this session */}
                  {currentKey.fullKey && !isCurrentKeyRevealed && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onShowNewKeyModal}
                      className="h-8 gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      Show
                    </Button>
                  )}
                  <Button variant="destructive" size="sm" onClick={onRevokeKey} className="h-8 gap-1">
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
            <Button onClick={() => onGenerateNewKey()} disabled={isGenerating}>Generate API Key</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CurrentApiKeyCard;