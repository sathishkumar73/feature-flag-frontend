"use client";
import React, { useState, useMemo } from 'react';
import { Calendar, Download, Search, Filter, ChevronUp, ChevronDown, Copy, Eye, CheckCircle, XCircle, Plus, Edit3, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

// Types for our audit log data
interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  userEmail: string;
  action: 'Create' | 'Update' | 'Delete';
  entity: string;
  entityId: string;
  details: string;
  status: 'Success' | 'Failure';
  fullDetails?: string;
  metadata?: Record<string, any>;
}

// Full dummy audit logs data
const mockAuditLogs: AuditLog[] = [
  {
    id: '1',
    timestamp: '2024-06-08T10:30:00Z',
    user: 'John Doe',
    userEmail: 'john.doe@company.com',
    action: 'Create',
    entity: 'new-checkout-flow',
    entityId: 'flag_001',
    details: 'Created new feature flag for checkout optimization',
    status: 'Success',
    fullDetails:
      'Feature flag "new-checkout-flow" was created with default targeting rules. Initial rollout set to 0% with gradual rollout planned.',
    metadata: { environment: 'production', rolloutPercentage: 0 },
  },
  {
    id: '2',
    timestamp: '2024-06-08T09:15:00Z',
    user: 'Sarah Wilson',
    userEmail: 'sarah.wilson@company.com',
    action: 'Update',
    entity: 'dark-mode-toggle',
    entityId: 'flag_002',
    details: 'Updated targeting rules for dark mode feature',
    status: 'Success',
    fullDetails:
      'Modified targeting rules to include beta user segment. Rollout percentage increased from 25% to 50%.',
    metadata: { environment: 'production', previousRollout: 25, newRollout: 50 },
  },
  {
    id: '3',
    timestamp: '2024-06-08T08:45:00Z',
    user: 'Mike Chen',
    userEmail: 'mike.chen@company.com',
    action: 'Delete',
    entity: 'legacy-payment-method',
    entityId: 'flag_003',
    details: 'Removed deprecated payment method flag',
    status: 'Failure',
    fullDetails:
      'Failed to delete flag due to active dependencies. Flag is still referenced in checkout service.',
    metadata: { environment: 'production', dependencies: ['checkout-service', 'payment-processor'] },
  },
  {
    id: '4',
    timestamp: '2024-06-07T16:20:00Z',
    user: 'Lisa Rodriguez',
    userEmail: 'lisa.rodriguez@company.com',
    action: 'Update',
    entity: 'mobile-app-redesign',
    entityId: 'flag_004',
    details: 'Enabled flag for mobile app redesign',
    status: 'Success',
    fullDetails:
      'Feature flag enabled for mobile app redesign. Targeting iOS users in US region with 100% rollout.',
    metadata: { environment: 'production', platform: 'iOS', region: 'US', rollout: 100 },
  },
  {
    id: '5',
    timestamp: '2024-06-07T14:10:00Z',
    user: 'Alex Thompson',
    userEmail: 'alex.thompson@company.com',
    action: 'Create',
    entity: 'ai-recommendations',
    entityId: 'flag_005',
    details: 'Created AI-powered recommendation engine flag',
    status: 'Success',
    fullDetails:
      'New feature flag for AI recommendations system. Initially disabled with plans for gradual rollout.',
    metadata: { environment: 'staging', aiModel: 'gpt-4', rollout: 0 },
  },
];

const AuditLogs = () => {
  // State management
  const [logs] = useState<AuditLog[]>(mockAuditLogs);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<'timestamp' | 'user'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const logsPerPage = 10;

  // Filtering and sorting logic
  const filteredAndSortedLogs = useMemo(() => {
    let filtered = logs.filter(log => {
      const matchesSearch =
        log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userEmail.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesAction = actionFilter === 'all' || log.action === actionFilter;
      const matchesStatus = statusFilter === 'all' || log.status === statusFilter;

      return matchesSearch && matchesAction && matchesStatus;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'timestamp') {
        comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      } else if (sortField === 'user') {
        comparison = a.user.localeCompare(b.user);
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [logs, searchTerm, actionFilter, statusFilter, sortField, sortOrder]);

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedLogs.length / logsPerPage);
  const paginatedLogs = filteredAndSortedLogs.slice(
    (currentPage - 1) * logsPerPage,
    currentPage * logsPerPage
  );

  // Utility functions
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} has been copied to your clipboard.`);
    } catch (err) {
      toast.error('Unable to copy to clipboard.');
    }
  };

  const exportLogs = () => {
    const csv = [
      'Timestamp,User,Action,Entity,Details,Status',
      ...filteredAndSortedLogs.map(log =>
        `"${log.timestamp}","${log.user}","${log.action}","${log.entity}","${log.details}","${log.status}"`
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success('Audit logs have been exported to CSV.');
  };

  const handleSort = (field: 'timestamp' | 'user') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'Create': return <Plus className="h-3 w-3" />;
      case 'Update': return <Edit3 className="h-3 w-3" />;
      case 'Delete': return <Trash2 className="h-3 w-3" />;
      default: return null;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'Create': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
      case 'Update': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
      case 'Delete': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'Success'
      ? 'text-green-600 dark:text-green-400'
      : 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Audit Logs</h1>
        <p className="text-muted-foreground">
          Track all feature flag changes and user activities across your organization
        </p>
      </div>

      {/* Filters and Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="space-y-2">
              <label htmlFor="search" className="text-sm font-medium text-foreground">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by user, flag, or details..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Action Filter */}
            <div className="space-y-2">
              <label htmlFor="action-filter" className="text-sm font-medium text-foreground">
                Action Type
              </label>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger id="action-filter" className="w-full">
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="Create">Create</SelectItem>
                  <SelectItem value="Update">Update</SelectItem>
                  <SelectItem value="Delete">Delete</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label htmlFor="status-filter" className="text-sm font-medium text-foreground">
                Status
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status-filter" className="w-full">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Success">Success</SelectItem>
                  <SelectItem value="Failure">Failure</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Export Button */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Export</label>
              <Button
                onClick={exportLogs}
                variant="outline"
                className="w-full"
                aria-label="Export audit logs to CSV"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Audit Trail</CardTitle>
            <div className="text-sm text-muted-foreground">
              Showing {paginatedLogs.length} of {filteredAndSortedLogs.length} logs
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse" role="table" aria-label="Audit logs table">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 font-medium text-foreground">
                    <button
                      onClick={() => handleSort('timestamp')}
                      className="flex items-center gap-1 hover:text-primary transition-colors"
                      aria-label="Sort by timestamp"
                    >
                      Timestamp
                      {sortField === 'timestamp' && (
                        sortOrder === 'desc' ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />
                      )}
                    </button>
                  </th>
                  <th className="text-left p-3 font-medium text-foreground">
                    <button
                      onClick={() => handleSort('user')}
                      className="flex items-center gap-1 hover:text-primary transition-colors"
                      aria-label="Sort by user"
                    >
                      User
                      {sortField === 'user' && (
                        sortOrder === 'desc' ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />
                      )}
                    </button>
                  </th>
                  <th className="text-left p-3 font-medium text-foreground">Action</th>
                  <th className="text-left p-3 font-medium text-foreground">Entity</th>
                  <th className="text-left p-3 font-medium text-foreground">Details</th>
                  <th className="text-left p-3 font-medium text-foreground">Status</th>
                  <th className="text-left p-3 font-medium text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-8 text-muted-foreground">
                      No audit logs found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b border-border hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedLog(log)}
                      role="row"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setSelectedLog(log);
                        }
                      }}
                      aria-label={`View details for ${log.action} action on ${log.entity} by ${log.user}`}
                    >
                      <td className="p-3 text-sm text-foreground">{formatTimestamp(log.timestamp)}</td>
                      <td className="p-3">
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-foreground">{log.user}</div>
                          <div className="text-xs text-muted-foreground">{log.userEmail}</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge className={`inline-flex items-center gap-1 ${getActionColor(log.action)}`}>
                          {getActionIcon(log.action)}
                          {log.action}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-foreground">{log.entity}</div>
                          <div className="text-xs text-muted-foreground font-mono">{log.entityId}</div>
                        </div>
                      </td>
                      <td className="p-3 text-sm text-foreground max-w-xs truncate">{log.details}</td>
                      <td className="p-3">
                        <div className={`flex items-center gap-1 text-sm font-medium ${getStatusColor(log.status)}`}>
                          {log.status === 'Success' ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                          {log.status}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(log.entityId, 'Entity ID');
                            }}
                            aria-label="Copy entity ID"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLog(log);
                            }}
                            aria-label="View details"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Log Modal */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Audit Log Details
            </DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Timestamp</label>
                  <div className="text-sm text-foreground font-mono">{formatTimestamp(selectedLog.timestamp)}</div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div
                    className={`flex items-center gap-1 text-sm font-medium ${getStatusColor(
                      selectedLog.status
                    )}`}
                  >
                    {selectedLog.status === 'Success' ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    {selectedLog.status}
                  </div>
                </div>
              </div>

              {/* User Information */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">User</label>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-foreground">{selectedLog.user}</div>
                    <div className="text-xs text-muted-foreground">{selectedLog.userEmail}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(selectedLog.userEmail, 'User email')}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Action and Entity */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Action</label>
                  <Badge
                    className={`inline-flex items-center gap-1 ${getActionColor(selectedLog.action)}`}
                  >
                    {getActionIcon(selectedLog.action)}
                    {selectedLog.action}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Entity</label>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-foreground">{selectedLog.entity}</div>
                      <div className="text-xs text-muted-foreground font-mono">{selectedLog.entityId}</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(selectedLog.entityId, 'Entity ID')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Summary</label>
                <div className="text-sm text-foreground">{selectedLog.details}</div>
              </div>

              {/* Full Details */}
              {selectedLog.fullDetails && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Full Details</label>
                  <div className="text-sm text-foreground bg-muted p-3 rounded-md">{selectedLog.fullDetails}</div>
                </div>
              )}

              {/* Metadata */}
              {selectedLog.metadata && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Metadata</label>
                  <div className="text-xs text-foreground bg-muted p-3 rounded-md font-mono">
                    <pre>{JSON.stringify(selectedLog.metadata, null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AuditLogs;
