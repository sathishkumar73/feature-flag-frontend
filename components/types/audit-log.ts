import { User } from "./user";

export interface AuditLog {
  id: string;
  action: string;
  flagId: string;
  flagName: string;
  performedById?: string | null;
  performedBy?: User | null;
  details?: string | null;
  createdAt: string;
}

export interface AuditLogCreateRequest {
  action: string;
  flagId: string;
  flagName: string;
  performedById?: string;
  details?: string;
}

export type AuditLogActionFilter = 'all' | AuditLog['action'];
export type AuditLogSortField = 'timestamp' | 'user';
export type AuditLogSortOrder = 'asc' | 'desc';