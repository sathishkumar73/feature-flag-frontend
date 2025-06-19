jest.mock('@/lib/supabaseClient');
import auditLogService from '../auditLogService';
import { apiGet } from '@/lib/apiClient';

jest.mock('@/lib/apiClient');

describe('auditLogService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetchAuditLogs calls apiGet with correct params (with flagId)', async () => {
    (apiGet as jest.Mock).mockResolvedValue({ data: [], meta: { totalPages: 1 } });
    await auditLogService.fetchAuditLogs('flag123', 2, 20);
    expect(apiGet).toHaveBeenCalledWith('/audit-logs', expect.objectContaining({
      page: 2,
      limit: 20,
      flagId: 'flag123',
    }));
  });

  it('fetchAuditLogs omits flagId if not provided', async () => {
    (apiGet as jest.Mock).mockResolvedValue({ data: [], meta: { totalPages: 1 } });
    await auditLogService.fetchAuditLogs(undefined, 1, 10);
    expect(apiGet).toHaveBeenCalledWith('/audit-logs', expect.not.objectContaining({ flagId: expect.anything() }));
  });
});
