// components/AuditLogsTable.tsx
import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CardContent } from '@/components/ui/card';
import { AuditLog, AuditLogSortField, AuditLogSortOrder } from '@/components/types/audit-log';
import {
  formatTimestamp,
  getActionIcon,
  getActionColor,
} from '@/utils/audit-log-helpers';

interface AuditLogsTableProps {
  logs: AuditLog[];
  sortField: AuditLogSortField;
  sortOrder: AuditLogSortOrder;
  onSort: (field: AuditLogSortField) => void;
  onViewDetails: (log: AuditLog) => void;
  totalFilteredLogsCount: number;
  paginatedLogsCount: number;
}

const AuditLogsTable: React.FC<AuditLogsTableProps> = ({
  logs,
  sortField,
  sortOrder,
  onSort,
  onViewDetails,
  totalFilteredLogsCount,
  paginatedLogsCount,
}) => {
  return (
    <CardContent>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-foreground">Audit Trail</h2>
        <div className="text-sm text-muted-foreground">
          Showing {paginatedLogsCount} of {totalFilteredLogsCount} logs
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse" role="table" aria-label="Audit logs table">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-3 font-medium text-foreground">
                <button
                  onClick={() => onSort('createdAt')}
                  className="flex items-center gap-1 hover:text-primary transition-colors"
                  aria-label="Sort by date"
                >
                  Date
                  {sortField === 'createdAt' && (
                    sortOrder === 'desc' ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />
                  )}
                </button>
              </th>
              <th className="text-left p-3 font-medium text-foreground">Action</th>
              <th className="text-left p-3 font-medium text-foreground">Details</th>
              {/* <th className="text-left p-3 font-medium text-foreground">Performed By</th> */}
              {/* Commented out the Actions column in the Audit Logs table */}
              {/* <th className="text-left p-3 font-medium text-foreground">Actions</th> */}
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center p-8 text-muted-foreground">
                  No audit logs found matching your criteria.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-border hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => onViewDetails(log)}
                  role="row"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      onViewDetails(log);
                    }
                  }}
                  aria-label={`View details for ${log.action} action by ${log.performedBy?.name}`}
                >
                  <td className="p-3 text-sm text-foreground">{formatTimestamp(log.createdAt)}</td>
                  <td className="p-3">
                    <Badge className={`inline-flex items-center gap-1 ${getActionColor(log.action)}`}>
                      {getActionIcon(log.action)}
                      {log.action}
                    </Badge>
                  </td>
                  <td className="p-3 text-sm text-foreground max-w-xs truncate">{log.details}</td>
                  {/* <td className="p-3">
                    <div className="text-sm font-medium text-foreground">
                      {log.performedBy?.name}
                    </div>
                  </td> */}
                  {/* Commented out the Actions cell in the table body */}
                  {/* <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(log.flagId, 'Flag ID');
                        }}
                        aria-label="Copy flag ID"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewDetails(log);
                        }}
                        aria-label="View details"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  </td> */}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </CardContent>
  );
};

export default AuditLogsTable;