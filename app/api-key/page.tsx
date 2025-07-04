"use client";

import React from "react";

// Import custom hook and components
import { useApiKeys } from "@/hooks/useApiKeys";
import ApiKeyHeader from "@/components/ApiKeyHeader";
import CurrentApiKeyCard from "@/components/CurrentApiKeyCard";
import ApiKeyHistoryTable from "@/components/ApiKeyHistoryTable";
import NewKeyDisplayModal from "@/components/NewKeyDisplayModal";
import Loader3DCube from "@/components/ui/loader"; // Import the loader component from the correct path

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
    isLoading, // Destructure isLoading from the hook
  } = useApiKeys();

  // Show loader while loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        <Loader3DCube />
      </div>
    );
  }

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
          isLoading={isLoading} // Pass isLoading to the CurrentApiKeyCard
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
          fullKey={currentKey?.fullKey}
        />
      </div>
    </div>
  );
};

export default ApiKeyPage;