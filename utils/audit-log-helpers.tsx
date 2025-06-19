"use client";
import { AuditLog } from '@/components/types/audit-log';
import { toast } from 'sonner';
import { Plus, Edit3, Trash2 } from 'lucide-react';
import React from 'react';

export const formatTimestamp = (timestamp: string): string => {
  return new Date(timestamp).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

export const copyToClipboard = async (text: string, label: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} has been copied to your clipboard.`);
  } catch (err) {
    toast.error('Unable to copy to clipboard.');
  }
};

export const exportAuditLogsToCSV = (logs: AuditLog[], toast: { success: (msg: string) => void; error?: (msg: string) => void }) => {
  const csvContent = [
    'Created At,Action,Flag Name,Flag ID,Details,Performed By',
    ...logs.map(log =>
      `"${log.createdAt}",` +
      `"${log.action}",` +
      `"${log.flagName.replace(/"/g, '""')}",` +
      `"${log.flagId}",` +
      `"${(log.details ?? '').replace(/"/g, '""')}",` +
      `"${log.performedBy?.name ?? ''}"`
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a); // Required for Firefox
  a.click();
  document.body.removeChild(a); // Clean up
  window.URL.revokeObjectURL(url);

  toast.success('Audit logs have been exported to CSV.');
};

export const getActionIcon = (action: AuditLog['action']): React.ReactNode => {
  switch (action) {
    case 'Create': return <Plus className="h-3 w-3" />;
    case 'Update': return <Edit3 className="h-3 w-3" />;
    case 'Delete': return <Trash2 className="h-3 w-3" />;
    default: return null;
  }
};

export const getActionColor = (action: AuditLog['action']): string => {
  switch (action) {
    case 'Create': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
    case 'Update': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
    case 'Delete': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
    default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800';
  }
};