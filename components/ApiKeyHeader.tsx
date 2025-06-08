"use client";
import React from 'react';
import { Key } from 'lucide-react';

const ApiKeyHeader: React.FC = () => {
  return (
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
  );
};

export default ApiKeyHeader;