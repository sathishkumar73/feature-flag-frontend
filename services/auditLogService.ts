import { apiGet } from "@/lib/apiClient";
import { AuditLog } from "@/components/types/audit-log";

interface AuditLogsResponse {
  data: AuditLog[];
  meta: {
    totalPages: number;
  };
}

class AuditLogService {
  async fetchAuditLogs(flagId?: string, page = 1, limit = 10): Promise<AuditLogsResponse> {
    const params = {
      page,
      limit,
      ...(flagId && { flagId }),
    };
    return apiGet("/audit-logs", params);
  }
}

export default new AuditLogService();
