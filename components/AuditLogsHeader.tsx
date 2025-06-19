"use client";
import React from 'react';

const AuditLogsHeader: React.FC = () => {
  return (
    <div className="space-y-2">
      <h1 className="text-3xl font-bold text-foreground">Audit Logs</h1>
      <p className="text-muted-foreground">
        Track all feature flag changes and user activities across your organization
      </p>
    </div>
  );
};

export default AuditLogsHeader;