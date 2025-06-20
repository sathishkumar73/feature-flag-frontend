"use client";
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, Copy, Clock, User, Tag, FileText } from 'lucide-react';
import { AuditLog } from '@/components/types/audit-log';
import { toast } from 'sonner';
import {
  formatTimestamp,
  getActionIcon,
  getActionColor,
} from '@/utils/audit-log-helpers';

const formatJSON = (data: unknown) => {
  try {
    if (typeof data === 'string') {
      if (data.trim().startsWith('{') || data.trim().startsWith('[')) {
        data = JSON.parse(data);
      }
    }
    return JSON.stringify(data, null, 2);
  } catch {
    return typeof data === 'string' ? data : JSON.stringify(data);
  }
};

interface AuditLogDetailsModalProps {
  log: AuditLog | null;
  isOpen: boolean;
  onClose: () => void;
}

const AuditLogDetailsModal: React.FC<AuditLogDetailsModalProps> = ({ log, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  if (!log) return null;
  
  const handleCopyDetails = () => {
    const detailsText = typeof log.details === 'string' 
      ? log.details 
      : JSON.stringify(log.details, null, 2);
    navigator.clipboard.writeText(detailsText);
    toast.success('Details copied to clipboard');
  };

  const handleTabChange = (value: string) => {
    console.log("Tab changed to:", value);
    setActiveTab(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Eye className="h-5 w-5" />
            Audit Log Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          {/* Manual tab implementation since the Tabs component has issues */}
          <div className="flex border-b mb-4">
            <button
              onClick={() => handleTabChange('overview')}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'overview' 
                  ? 'border-b-2 border-primary text-primary' 
                  : 'text-muted-foreground'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => handleTabChange('json')}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'json' 
                  ? 'border-b-2 border-primary text-primary' 
                  : 'text-muted-foreground'
              }`}
            >
              JSON Data
            </button>
          </div>

          {activeTab === 'overview' && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-6">
                {/* Timestamp Card */}
                <Card>
                  <CardContent className="p-4 flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm font-medium">Timestamp</span>
                    </div>
                    <div className="text-sm font-mono">{formatTimestamp(log.createdAt)}</div>
                  </CardContent>
                </Card>
                
                {/* User Card */}
                <Card>
                  <CardContent className="p-4 flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <User className="h-4 w-4" />
                      <span className="text-sm font-medium">User</span>
                    </div>
                    <div className="text-sm font-medium">{log.performedBy?.name || 'Unknown User'}</div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Action Card */}
              <Card>
                <CardContent className="p-4 flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm font-medium">Action</span>
                  </div>
                  <Badge
                    className={`inline-flex items-center gap-1 ${getActionColor(log.action)}`}
                  >
                    {getActionIcon(log.action)}
                    {log.action}
                  </Badge>
                </CardContent>
              </Card>
              
              {/* Flag Details */}
              <Card>
                <CardContent className="p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Tag className="h-4 w-4" />
                    <span className="text-sm font-medium">Flag Details</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-muted-foreground">Name</div>
                      <div className="text-sm">{log.flagName}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">ID</div>
                      <div className="text-sm truncate font-mono">{log.flagId}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {activeTab === 'json' && (
            <div className="py-4">
              <Card>
                <CardContent className="p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm font-medium">JSON Details</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8" 
                      onClick={handleCopyDetails}
                    >
                      <Copy className="h-3 w-3 mr-1" /> Copy
                    </Button>
                  </div>
                  
                  <pre className="bg-muted text-sm p-4 rounded-md overflow-x-auto whitespace-pre-wrap">
                    <code className="text-foreground">
                      {formatJSON(log.details)}
                    </code>
                  </pre>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AuditLogDetailsModal;