// Tests for useAuditLogs hook
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuditLogs } from '../useAuditLogs';

// Mock API client
jest.mock('../../lib/apiClient', () => ({
  apiGet: jest.fn(),
}));

// Mock supabase
jest.mock('../../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: { access_token: 'token' } }, error: null }),
    },
  },
}));

const { apiGet } = require('../../lib/apiClient');

// Helper: create a full AuditLog object
const makeLog = (overrides = {}) => ({
  id: '1',
  action: 'CREATE',
  flagId: 'flag-1',
  flagName: 'Flag 1',
  performedById: 'user-1',
  performedBy: { id: 'user-1', name: 'Test User', email: 'test@example.com' },
  details: 'Created flag',
  createdAt: '2025-06-12T12:00:00Z',
  ...overrides,
});

describe('useAuditLogs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with default state', async () => {
    const { result } = renderHook(() => useAuditLogs(5, 'http://localhost'));
    expect(result.current.searchTerm).toBe('');
    expect(result.current.actionFilter).toBe('all');
    expect(result.current.sortField).toBe('createdAt');
    expect(result.current.sortOrder).toBe('desc');
    expect(result.current.currentPage).toBe(1);
    expect(result.current.isLoadingLogs).toBe(true);
    expect(Array.isArray(result.current.paginatedLogs)).toBe(true);
  });

  it('fetches audit logs (success)', async () => {
    apiGet.mockResolvedValueOnce([
      makeLog({ id: '1', action: 'CREATE' }),
      makeLog({ id: '2', action: 'UPDATE', flagName: 'Flag 2' }),
    ]);
    const { result } = renderHook(() => useAuditLogs(5, 'http://localhost'));
    await waitFor(() => expect(result.current.isLoadingLogs).toBe(false));
    expect(result.current.paginatedLogs.length).toBe(2);
  });

  it('fetches audit logs (error)', async () => {
    apiGet.mockRejectedValueOnce(new Error('API error'));
    const { result } = renderHook(() => useAuditLogs(5, 'http://localhost'));
    await waitFor(() => expect(result.current.isLoadingLogs).toBe(false));
    expect(result.current.error).toBe('API error');
    expect(result.current.paginatedLogs.length).toBe(0);
  });

  it('filters, sorts, and paginates logs', async () => {
    apiGet.mockResolvedValueOnce([
      makeLog({ id: '1', flagName: 'Alpha', action: 'CREATE', createdAt: '2025-06-10T10:00:00Z' }),
      makeLog({ id: '2', flagName: 'Beta', action: 'UPDATE', createdAt: '2025-06-11T11:00:00Z' }),
      makeLog({ id: '3', flagName: 'Gamma', action: 'DELETE', createdAt: '2025-06-12T12:00:00Z' }),
    ]);
    const { result } = renderHook(() => useAuditLogs(2, 'http://localhost'));
    await waitFor(() => expect(result.current.isLoadingLogs).toBe(false));
    act(() => {
      result.current.setSearchTerm('Alpha');
    });
    expect(result.current.filteredAndSortedLogs.length).toBe(1);
    act(() => {
      result.current.setSearchTerm('');
      result.current.setActionFilter('CREATE');
    });
    expect(result.current.filteredAndSortedLogs.length).toBe(1);
    act(() => {
      result.current.handleSort('createdAt');
    });
    expect(result.current.currentPage).toBe(1);
    expect(result.current.paginatedLogs.length).toBe(1); // Only 1 log matches after filtering
  });
});
