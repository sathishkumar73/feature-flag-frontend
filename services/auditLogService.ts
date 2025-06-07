import { BaseService } from "@/services/baseService";
import { AuditLog } from "@/components/types/audit-log";

interface AuditLogsResponse {
  data: AuditLog[];
  meta: {
    totalPages: number;
  };
}

class AuditLogService extends BaseService {
  async fetchAuditLogs(flagId?: string, page = 1, limit = 10): Promise<AuditLogsResponse> {
    const params = {
      page,
      limit,
      ...(flagId && { flagId }),
    };

    return this.get("/audit-logs", params);
  }
}

export default new AuditLogService();
