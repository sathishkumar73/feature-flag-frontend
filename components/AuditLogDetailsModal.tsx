"use client";
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import { AuditLog } from '@/components/types/audit-log';
import {
  formatTimestamp,
  getActionIcon,
  getActionColor,
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
              <div className="text-sm text-foreground font-mono">{formatTimestamp(log.createdAt)}</div>
            </div>
          </div>

          {/* User Information */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">User</label>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-foreground">{log.performedBy?.name}</div>
              </div>
            </div>
          </div>

          {/* Action */}
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
          </div>

          {/* Details */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Summary</label>
            <div className="text-sm text-foreground">{log.details}</div>
          </div>

          {/* Flag Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Flag Name</label>
            <div className="text-sm text-foreground">{log.flagName}</div>
          </div>

          {/* Flag ID */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Flag ID</label>
            <div className="text-sm text-foreground">{log.flagId}</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuditLogDetailsModal;