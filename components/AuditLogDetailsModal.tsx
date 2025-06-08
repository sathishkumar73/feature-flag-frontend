"use client";
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Copy } from 'lucide-react';
import { AuditLog } from '@/components/types/audit-log';
import {
  formatTimestamp,
  copyToClipboard,
  getActionIcon,
  getActionColor,
  getStatusIcon,
  getStatusColor,
} from '@/utils/audit-log-helpers';

interface AuditLogDetailsModalProps {
  log: AuditLog | null;
  isOpen: boolean;
  onClose: () => void;
}

const AuditLogDetailsModal: React.FC<AuditLogDetailsModalProps> = ({ log, isOpen, onClose }) => {
  if (!log) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Audit Log Details
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Timestamp</label>
              <div className="text-sm text-foreground font-mono">{formatTimestamp(log.timestamp)}</div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <div
                className={`flex items-center gap-1 text-sm font-medium ${getStatusColor(
                  log.status
                )}`}
              >
                {getStatusIcon(log.status)}
                {log.status}
              </div>
            </div>
          </div>

          {/* User Information */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">User</label>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-foreground">{log.user}</div>
                <div className="text-xs text-muted-foreground">{log.userEmail}</div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(log.userEmail, 'User email')}
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
                className={`inline-flex items-center gap-1 ${getActionColor(log.action)}`}
              >
                {getActionIcon(log.action)}
                {log.action}
              </Badge>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Entity</label>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-foreground">{log.entity}</div>
                  <div className="text-xs text-muted-foreground font-mono">{log.entityId}</div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(log.entityId, 'Entity ID')}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Summary</label>
            <div className="text-sm text-foreground">{log.details}</div>
          </div>

          {/* Full Details */}
          {log.fullDetails && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Full Details</label>
              <div className="text-sm text-foreground bg-muted p-3 rounded-md">{log.fullDetails}</div>
            </div>
          )}

          {/* Metadata */}
          {log.metadata && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Metadata</label>
              <div className="text-xs text-foreground bg-muted p-3 rounded-md font-mono">
                <pre>{JSON.stringify(log.metadata, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuditLogDetailsModal;