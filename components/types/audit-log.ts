export interface AuditLog {
  id: string;
  timestamp: string; // ISO date string
  user: string;
  userEmail: string;
  action: 'Create' | 'Update' | 'Delete';
  entity: string; // e.g., flag name
  entityId: string; // e.g., flag ID
  details: string; // short summary
  status: 'Success' | 'Failure';
  fullDetails?: string;
  metadata?: Record<string, string | number | boolean | null>;
}

export type AuditLogActionFilter = 'all' | AuditLog['action'];
export type AuditLogStatusFilter = 'all' | AuditLog['status'];
export type AuditLogSortField = 'timestamp' | 'user';
export type AuditLogSortOrder = 'asc' | 'desc';