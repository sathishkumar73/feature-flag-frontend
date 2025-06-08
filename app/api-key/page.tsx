"use client";

import React from "react";

// Import custom hook and components
import { useApiKeys } from "@/hooks/useApiKeys";
import ApiKeyHeader from "@/components/ApiKeyHeader";
import CurrentApiKeyCard from "@/components/CurrentApiKeyCard";
import ApiKeyHistoryTable from "@/components/ApiKeyHistoryTable";
import NewKeyDisplayModal from "@/components/NewKeyDisplayModal";

const ApiKeyPage = () => {
  const {
    currentKey,
    keyHistory,
    isGenerating,
    showNewKeyModal,
    setShowNewKeyModal,
    isCurrentKeyRevealed,
    generateNewApiKey,
    revokeCurrentKey,
    handleCopyKey,
    handleModalCloseConfirmation,
  } = useApiKeys();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Page Header */}
        <ApiKeyHeader />

        {/* Current API Key Section */}
        <CurrentApiKeyCard
          currentKey={currentKey}
          isGenerating={isGenerating}
          isCurrentKeyRevealed={isCurrentKeyRevealed}
          onGenerateNewKey={generateNewApiKey}
          onRevokeKey={revokeCurrentKey}
          onShowNewKeyModal={() => setShowNewKeyModal(true)} // Pass the setter to open the modal
        />

        {/* API Key History */}
        <ApiKeyHistoryTable keyHistory={keyHistory} />

        {/* Show full key modal (for initial display or newly generated keys) */}
        <NewKeyDisplayModal
          isOpen={showNewKeyModal}
          onClose={handleModalCloseConfirmation} // This handles both "I Have Copied" and simple modal close
          onCopyKey={handleCopyKey}
          fullKey={currentKey?.fullKey} // Pass the fullKey from state to the modal
        />
      </div>
    </div>
  );
};

export default ApiKeyPage;