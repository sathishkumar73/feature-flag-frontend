// utils/flag-helpers.ts

import { FeatureFlag } from '@/types/flag';

export const truncateText = (text: string, maxLength: number): string => {
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const exportFlagsToCSV = (flags: FeatureFlag[], toast: { success: (msg: string) => void; error?: (msg: string) => void }) => {
  const csvContent = [
    ['Name', 'Description', 'Environment', 'Enabled', 'Rollout %', 'Created At'].join(','),
    ...flags.map(flag => [
      flag.name,
      `"${flag.description.replace(/"/g, '""')}"`, // Handle commas/quotes in description
      flag.environment,
      flag.enabled.toString(),
      flag.rolloutPercentage.toString(),
      new Date(flag.createdAt).toLocaleDateString()
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'feature-flags.csv';
  document.body.appendChild(a); // Append for Firefox compatibility
  a.click();
  document.body.removeChild(a); // Clean up
  window.URL.revokeObjectURL(url);

  toast.success('Feature flags data has been exported to CSV.');
};