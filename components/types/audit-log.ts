export interface AuditLogRequestParams {
  flagId?: string;
}

export interface AuditLogsTableProps {
  auditLogs: AuditLog[];
  loading: boolean;
  error: string | null;
}

export interface AuditLog {
  action: string;
  flagId: string;
  flagName: string;
  performedBy: string;
  details?: string | null;
  createdAt: Date;
  id: string;
}